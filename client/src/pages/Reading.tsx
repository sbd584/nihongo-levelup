import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";
type PassageRank = "E" | "D" | "C" | "B" | "A" | "S";

interface Passage {
  id: string;
  level: JLPTLevel;
  rank: PassageRank;
  title: string;
  titleEn: string;
  text: string;
  textEn: string;
  furigana: Array<[string, string]>;
  genre: string;
  wordCount: number;
}

interface GlossedToken {
  type: "gloss" | "plain" | "break";
  surface: string;
  reading?: string;
  meaning?: string;
}

interface QuizWord {
  surface: string;
  reading: string;
  meaning: string;
}

interface QuizQuestion {
  word: QuizWord;
  choices: string[];
  correctIdx: number;
}

function parseTokens(raw: string): GlossedToken[] {
  const tokens: GlossedToken[] = [];
  const parts = raw.split(/(\[.*?\|.*?\|.*?\])/g);
  for (const part of parts) {
    if (part.startsWith("[") && part.includes("|")) {
      const inner = part.slice(1, -1);
      const [surface, reading, meaning] = inner.split("|");
      tokens.push({ type: "gloss", surface, reading, meaning });
    } else {
      const lines = part.split("\n");
      lines.forEach((line, i) => {
        if (line) tokens.push({ type: "plain", surface: line });
        if (i < lines.length - 1) tokens.push({ type: "break", surface: "\n" });
      });
    }
  }
  return tokens;
}

function extractGlossWords(tokens: GlossedToken[]): QuizWord[] {
  const seen = new Set<string>();
  const words: QuizWord[] = [];
  for (const t of tokens) {
    if (t.type === "gloss" && t.surface && !seen.has(t.surface)) {
      seen.add(t.surface);
      words.push({ surface: t.surface, reading: t.reading ?? "", meaning: t.meaning ?? "" });
    }
  }
  return words;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(words: QuizWord[]): QuizQuestion[] {
  if (words.length < 2) return [];
  const allMeanings = words.map(w => w.meaning);
  return shuffle(words).map(word => {
    const wrong = shuffle(allMeanings.filter(m => m !== word.meaning)).slice(0, 3);
    const choices = shuffle([word.meaning, ...wrong]);
    return { word, choices, correctIdx: choices.indexOf(word.meaning) };
  });
}

// Apply furigana to plain text — wrap kanji with <ruby>
function applyFurigana(text: string, furiganaMap: Map<string, string>): React.ReactNode[] {
  if (furiganaMap.size === 0) return [text];
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    let matched = false;
    for (const [kanji, reading] of furiganaMap) {
      if (remaining.startsWith(kanji)) {
        nodes.push(
          <ruby key={key++}>
            {kanji}
            <rt style={{ fontSize: "0.55em", color: "#fbbf24", fontFamily: "sans-serif" }}>{reading}</rt>
          </ruby>
        );
        remaining = remaining.slice(kanji.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      nodes.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return nodes;
}

// Web Speech API TTS
function speakJapanese(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const plain = text.replace(/\[([^|]+)\|[^|]+\|[^\]]+\]/g, "$1");
  const utter = new SpeechSynthesisUtterance(plain);
  utter.lang = "ja-JP";
  utter.rate = 0.85;
  // Try to find a Japanese voice
  const voices = window.speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang.startsWith("ja"));
  if (jpVoice) utter.voice = jpVoice;
  window.speechSynthesis.speak(utter);
}

const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
const RANKS: PassageRank[] = ["E", "D", "C", "B", "A", "S"];

const LEVEL_COLOR: Record<JLPTLevel, string> = {
  N5: "#3b82f6",
  N4: "#22c55e",
  N3: "#f59e0b",
  N2: "#f97316",
  N1: "#a855f7",
};

const GENRE_ICON: Record<string, string> = {
  "slice-of-life": "🌸",
  fantasy: "⚔️",
  mystery: "🌙",
  romance: "💌",
  adventure: "🏔️",
};

interface PopupState {
  surface: string;
  reading: string;
  meaning: string;
  x: number;
  y: number;
}

type AppMode = "read" | "quiz";

export default function Reading() {
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>("N5");
  const [selectedRank, setSelectedRank] = useState<PassageRank>("E");
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const [showFurigana, setShowFurigana] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<AppMode>("read");

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const { data: passages = [], isLoading } = useQuery<Passage[]>({
    queryKey: ["/api/passages", selectedLevel, selectedRank],
    queryFn: () =>
      apiRequest("GET", `/api/passages?level=${selectedLevel}&rank=${selectedRank}`)
        .then((r) => r.json()),
  });

  const passage = passages[0] ?? null;
  const tokens = useMemo(() => passage ? parseTokens(passage.text) : [], [passage?.id]);
  const glossWords = useMemo(() => extractGlossWords(tokens), [passage?.id]);
  const furiganaMap = useMemo(() => {
    const m = new Map<string, string>();
    if (passage?.furigana) passage.furigana.forEach(([k, r]) => m.set(k, r));
    return m;
  }, [passage?.id]);
  const levelColor = LEVEL_COLOR[selectedLevel];
  const canQuiz = glossWords.length >= 2;

  // Stop speech when passage changes
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [passage?.id]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!passage) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakJapanese(passage.text);
      // Poll until done
      const interval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(interval);
        }
      }, 300);
    }
  };

  const startQuiz = () => {
    window.speechSynthesis?.cancel();
    const qs = buildQuiz(glossWords);
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setMode("quiz");
    setPopup(null);
  };

  const exitQuiz = () => { setMode("read"); setSelected(null); setDone(false); };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[qIdx].correctIdx) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) setDone(true);
      else { setQIdx(i => i + 1); setSelected(null); }
    }, 900);
  };

  const handleGlossClick = useCallback((token: GlossedToken, e: React.MouseEvent) => {
    if (token.type !== "gloss") return;
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ surface: token.surface, reading: token.reading ?? "", meaning: token.meaning ?? "", x: rect.left + rect.width / 2, y: rect.top - 8 });
  }, []);

  const closePopup = () => setPopup(null);
  const changeLevel = (lvl: JLPTLevel) => { setSelectedLevel(lvl); setPopup(null); setMode("read"); };
  const changeRank = (rank: PassageRank) => { setSelectedRank(rank); setPopup(null); setMode("read"); };
  const currentQ = questions[qIdx];

  // Render a token with optional furigana
  const renderToken = (token: GlossedToken, i: number) => {
    if (token.type === "break") return <br key={i} />;
    if (token.type === "gloss") {
      return (
        <button
          key={i}
          onClick={(e) => handleGlossClick(token, e)}
          style={{
            color: showHint ? "#fbbf24" : "rgba(255,255,255,0.88)",
            textDecoration: showHint ? "underline" : "none",
            textDecorationStyle: "dotted",
            textDecorationColor: "#fbbf2488",
            background: "transparent",
            border: "none",
            padding: 0,
            font: "inherit",
            lineHeight: "inherit",
            cursor: "pointer",
            display: "inline",
          }}
        >
          {showFurigana && token.reading ? (
            <ruby>
              {token.surface}
              <rt style={{ fontSize: "0.55em", color: "#fbbf24", fontFamily: "sans-serif" }}>{token.reading}</rt>
            </ruby>
          ) : token.surface}
        </button>
      );
    }
    // Plain text — apply furigana map if enabled
    if (showFurigana && furiganaMap.size > 0) {
      return <span key={i}>{applyFurigana(token.surface, furiganaMap)}</span>;
    }
    return <span key={i}>{token.surface}</span>;
  };

  return (
    <div
      className="min-h-screen pb-28 relative safe-top"
      style={{ background: "hsl(240 20% 5%)" }}
      onClick={closePopup}
    >
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${levelColor}33, transparent 70%)` }} />

      {/* Sticky header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b border-white/5"
        style={{ background: "hsl(240 20% 5% / 0.96)" }}>
        <div className="max-w-lg mx-auto px-4 pt-1 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-display font-bold text-white tracking-wider">
              {mode === "quiz" ? "⚡ Reading Quiz" : "📖 Reading"}
            </span>
            {mode === "read" ? (
              /* Toggle row */
              <div className="flex items-center gap-1.5">
                {/* Furigana */}
                <button onClick={(e) => { e.stopPropagation(); setShowFurigana(f => !f); }}
                  className="px-2 py-1 rounded-lg text-[10px] font-display font-bold border transition-all"
                  style={{ background: showFurigana ? "rgba(168,85,247,0.15)" : "rgba(0,0,0,0.3)", borderColor: showFurigana ? "#a855f766" : "#ffffff10", color: showFurigana ? "#a855f7" : "#6b7280" }}>
                  ふり
                </button>
                {/* English */}
                <button onClick={(e) => { e.stopPropagation(); setShowEn(f => !f); }}
                  className="px-2 py-1 rounded-lg text-[10px] font-display font-bold border transition-all"
                  style={{ background: showEn ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.3)", borderColor: showEn ? "#22c55e66" : "#ffffff10", color: showEn ? "#22c55e" : "#6b7280" }}>
                  EN
                </button>
                {/* Hint */}
                <button onClick={(e) => { e.stopPropagation(); setShowHint(h => !h); }}
                  className="px-2 py-1 rounded-lg text-[10px] font-display font-bold border transition-all"
                  style={{ background: showHint ? "rgba(251,191,36,0.15)" : "rgba(0,0,0,0.3)", borderColor: showHint ? "#fbbf2466" : "#ffffff10", color: showHint ? "#fbbf24" : "#6b7280" }}>
                  あ
                </button>
                {/* Audio */}
                <button onClick={handleSpeak}
                  className="px-2 py-1 rounded-lg text-[10px] font-display font-bold border transition-all"
                  style={{ background: isSpeaking ? "rgba(59,130,246,0.2)" : "rgba(0,0,0,0.3)", borderColor: isSpeaking ? "#3b82f666" : "#ffffff10", color: isSpeaking ? "#60a5fa" : "#6b7280" }}>
                  {isSpeaking ? "■" : "▶"}
                </button>
              </div>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); exitQuiz(); }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-display font-bold border transition-all"
                style={{ background: "rgba(0,0,0,0.3)", borderColor: "#ffffff10", color: "#6b7280" }}>
                ← Back
              </button>
            )}
          </div>

          {/* Level picker */}
          <div className="flex gap-1 mb-1.5">
            {LEVELS.map((lvl) => (
              <button key={lvl} onClick={(e) => { e.stopPropagation(); changeLevel(lvl); }}
                className="flex-1 py-1 rounded-md text-[11px] font-display font-bold border transition-all"
                style={{ background: selectedLevel === lvl ? LEVEL_COLOR[lvl] + "18" : "rgba(0,0,0,0.3)", borderColor: selectedLevel === lvl ? LEVEL_COLOR[lvl] + "66" : "#ffffff10", color: selectedLevel === lvl ? LEVEL_COLOR[lvl] : "#6b7280" }}>
                {lvl}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {RANKS.map((rank) => (
              <button key={rank} onClick={(e) => { e.stopPropagation(); changeRank(rank); }}
                className="flex-1 py-0.5 rounded-md text-[10px] font-display font-bold border transition-all"
                style={{ background: selectedRank === rank ? levelColor + "18" : "rgba(0,0,0,0.3)", borderColor: selectedRank === rank ? levelColor + "66" : "#ffffff10", color: selectedRank === rank ? levelColor : "#4b5563" }}>
                {rank}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── READ MODE ── */}
      {mode === "read" && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          {isLoading ? (
            <div className="flex flex-col gap-2.5 animate-pulse mt-2">
              {[75, 60, 85, 50, 70, 65].map((w, i) => (
                <div key={i} className="h-4 rounded" style={{ width: `${w}%`, background: "rgba(255,255,255,0.05)" }} />
              ))}
            </div>
          ) : !passage ? (
            <div className="text-center py-12">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-gray-500 font-display text-sm">No passage available</p>
            </div>
          ) : (
            <>
              {/* Title */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{GENRE_ICON[passage.genre] ?? "📖"}</span>
                  <span className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-widest"
                    style={{ color: levelColor, borderColor: levelColor + "44", background: levelColor + "12" }}>
                    {passage.level} · {passage.rank}
                  </span>
                </div>
                <h2 className="text-lg font-display font-bold leading-tight" style={{ color: levelColor }}>{passage.title}</h2>
                <p className="text-[11px] text-gray-500 italic">{passage.titleEn}</p>
              </div>

              {/* Hint legend */}
              {showHint && (
                <div className="mb-3 px-2.5 py-1.5 rounded-lg border text-[11px] text-gray-400 font-display"
                  style={{ background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.18)" }}>
                  <span className="text-yellow-400 font-bold">あ ON</span> — tap <span className="text-yellow-300 underline decoration-dotted">gold words</span> for reading + meaning
                </div>
              )}

              {/* Japanese passage */}
              <div className="text-base tracking-wide select-none"
                style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', 'BIZ UDMincho', Georgia, serif", color: "rgba(255,255,255,0.88)", lineHeight: "2" }}>
                {tokens.map((token, i) => renderToken(token, i))}
              </div>

              {/* English translation */}
              {showEn && passage.textEn && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-green-400">EN</span>
                    <div className="flex-1 h-px bg-green-500/20" />
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed font-display space-y-2">
                    {passage.textEn.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer + Quiz button */}
              <div className="mt-5 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-gray-600 font-display uppercase tracking-widest">
                    ~{passage.wordCount} words · {passage.genre}
                  </span>
                  <span className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color: levelColor, background: levelColor + "12" }}>
                    {passage.level} {passage.rank}
                  </span>
                </div>
                {canQuiz ? (
                  <button onClick={(e) => { e.stopPropagation(); startQuiz(); }}
                    className="w-full py-3 rounded-xl font-display font-bold text-sm border transition-all active:scale-95"
                    style={{ background: levelColor + "18", borderColor: levelColor + "66", color: levelColor }}>
                    ⚡ Quiz Me — {glossWords.length} words
                  </button>
                ) : (
                  <p className="text-center text-[11px] text-gray-600 font-display">Not enough glossed words to quiz</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── QUIZ MODE ── */}
      {mode === "quiz" && (
        <div className="max-w-lg mx-auto px-4 pt-5">
          {done ? (
            <div className="flex flex-col items-center pt-6">
              <div className="text-5xl mb-3">{score === questions.length ? "🏆" : score >= questions.length * 0.7 ? "⭐" : "📚"}</div>
              <div className="text-3xl font-display font-bold mb-1" style={{ color: levelColor }}>{score}/{questions.length}</div>
              <p className="text-sm text-gray-400 font-display mb-1">
                {score === questions.length ? "Perfect! You nailed it." : score >= questions.length * 0.7 ? "Great job — keep reading!" : "Keep at it — re-read and try again."}
              </p>
              <p className="text-[11px] text-gray-600 font-display mb-6">{passage?.title} · {selectedLevel} {selectedRank}</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => startQuiz()} className="flex-1 py-3 rounded-xl font-display font-bold text-sm border transition-all active:scale-95"
                  style={{ background: levelColor + "18", borderColor: levelColor + "66", color: levelColor }}>Retry Quiz</button>
                <button onClick={() => exitQuiz()} className="flex-1 py-3 rounded-xl font-display font-bold text-sm border transition-all active:scale-95"
                  style={{ background: "rgba(0,0,0,0.3)", borderColor: "#ffffff15", color: "#9ca3af" }}>Back to Passage</button>
              </div>
            </div>
          ) : currentQ ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(qIdx / questions.length) * 100}%`, background: levelColor }} />
                </div>
                <span className="text-[11px] font-display text-gray-500 shrink-0">{qIdx + 1}/{questions.length}</span>
              </div>

              <div className="rounded-2xl border p-5 mb-4 text-center"
                style={{ background: levelColor + "08", borderColor: levelColor + "33" }}>
                <div className="text-3xl font-bold mb-1"
                  style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', 'BIZ UDMincho', Georgia, serif", color: levelColor }}>
                  {currentQ.word.surface}
                </div>
                {currentQ.word.reading && <div className="text-sm text-gray-400 font-display">{currentQ.word.reading}</div>}
                <div className="text-[11px] text-gray-600 font-display mt-1 uppercase tracking-widest">what does this mean?</div>
              </div>

              <div className="flex flex-col gap-2">
                {currentQ.choices.map((choice, idx) => {
                  const isCorrect = idx === currentQ.correctIdx;
                  const isSelected = selected === idx;
                  const revealed = selected !== null;
                  let bg = "rgba(0,0,0,0.3)", border = "#ffffff10", color = "#d1d5db";
                  if (revealed) {
                    if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "#22c55e66"; color = "#22c55e"; }
                    else if (isSelected) { bg = "rgba(239,68,68,0.15)"; border = "#ef444466"; color = "#ef4444"; }
                    else color = "#4b5563";
                  }
                  return (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); handleAnswer(idx); }} disabled={revealed}
                      className="w-full text-left px-4 py-3 rounded-xl border font-display text-sm transition-all duration-200 active:scale-[0.98]"
                      style={{ background: bg, borderColor: border, color }}>
                      <span className="font-bold mr-2" style={{ color: revealed ? color : levelColor }}>{["A","B","C","D"][idx]}</span>
                      {choice}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 text-center text-[11px] text-gray-600 font-display">{score} correct so far</div>
            </>
          ) : null}
        </div>
      )}

      {/* Word popup */}
      {mode === "read" && popup && (
        <>
          <div className="fixed inset-0 z-40" onClick={closePopup} />
          <div className="fixed z-50 pointer-events-none"
            style={{ left: Math.min(Math.max(popup.x - 108, 10), (typeof window !== "undefined" ? window.innerWidth : 390) - 226), top: Math.max(popup.y - 100, 56), width: 216 }}>
            <div className="rounded-xl border shadow-2xl p-3"
              style={{ background: "hsl(240 20% 9%)", borderColor: levelColor + "55", boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${levelColor}22` }}>
              <div className="text-xl font-bold mb-0.5 text-center"
                style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', 'BIZ UDMincho', Georgia, serif", color: levelColor }}>
                {popup.surface}
              </div>
              {popup.reading && <div className="text-center text-sm text-gray-300 font-display">{popup.reading}</div>}
              <div className="text-center text-xs text-gray-400 font-display leading-snug mt-0.5">{popup.meaning}</div>
              <div className="mt-2 text-center text-[10px] text-gray-600 font-display">tap anywhere to close</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
