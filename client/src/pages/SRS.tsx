import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SrsWord } from "@shared/schema";

type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";
type MainTab = "games" | "library" | "add";
type GameMode = "flashcard" | "match" | "sentence" | "multichoice";

const levelColors: Record<string, string> = {
  N5: "#22c55e", N4: "#3b82f6", N3: "#a855f7", N2: "#f59e0b", N1: "#ef4444",
};

const SRS_INTERVALS = ["Again", "Hard", "Good", "Easy"];
const SRS_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
const SRS_DAYS = ["<1d", "~2d", "~4d", "~7d"];

type CoreWord = {
  word: string; reading: string; romaji: string;
  meaning: string; example: string; exampleEn: string; level: "N5" | "N4";
};

// ─── Utility ───────────────────────────────────────────────────────────────

function isPureKana(str: string): boolean {
  return /^[\u3040-\u309f\u30a0-\u30ff]+$/.test(str);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correct: SrsWord, pool: SrsWord[], n = 3): SrsWord[] {
  // Pick words whose meaning starts with a different first word (harder distractors)
  const firstWord = (m: string) => m.split(/[\s/,]/)[0].toLowerCase();
  const target = firstWord(correct.meaning);
  const others = pool.filter(w => w.id !== correct.id && firstWord(w.meaning) !== target);
  const shuffled = shuffle(others);
  return shuffled.slice(0, n);
}

// ─── Match Pairs Game ──────────────────────────────────────────────────────

function MatchGame({ words, showHint }: { words: SrsWord[]; showHint?: boolean }) {
  const PAIR_COUNT = Math.min(6, words.length);
  const [pairs] = useState(() => shuffle(words).slice(0, PAIR_COUNT));
  const [jpCards] = useState(() => shuffle(pairs.map(w => w.id)));
  const [enCards] = useState(() => shuffle(pairs.map(w => w.id)));
  const [selectedJp, setSelectedJp] = useState<number | null>(null);
  const [selectedEn, setSelectedEn] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);

  const wordById = (id: number) => pairs.find(w => w.id === id)!;

  useEffect(() => {
    if (selectedJp !== null && selectedEn !== null) {
      if (selectedJp === selectedEn) {
        const next = new Set(matched).add(selectedJp);
        setMatched(next);
        setSelectedJp(null);
        setSelectedEn(null);
        if (next.size === PAIR_COUNT) setTimeout(() => setDone(true), 400);
      } else {
        setWrong(new Set([selectedJp, selectedEn]));
        setMistakes(m => m + 1);
        setTimeout(() => {
          setWrong(new Set());
          setSelectedJp(null);
          setSelectedEn(null);
        }, 700);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJp, selectedEn]);

  if (done) return (
    <div className="bg-card/60 border border-green-500/20 rounded-xl p-8 text-center space-y-3">
      <div className="text-4xl">⚔️</div>
      <h2 className="font-display text-lg font-bold text-green-400">All Matched!</h2>
      <p className="text-sm text-muted-foreground">{mistakes === 0 ? "Perfect run!" : `${mistakes} mistake${mistakes !== 1 ? "s" : ""}`}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-5 py-2 rounded-lg font-display text-xs font-bold tracking-widest uppercase border border-blue-500/40 text-blue-400 bg-blue-600/10"
      >Play Again</button>
    </div>
  );

  const cardBase = "rounded-xl p-3 text-center cursor-pointer select-none transition-all duration-200 active:scale-95 border text-sm font-display font-bold min-h-[56px] flex items-center justify-center";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">Match the pairs</span>
        <span className="text-[10px] font-display text-muted-foreground">{matched.size}/{PAIR_COUNT} matched · {mistakes} mistakes</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <div className="text-[10px] font-display tracking-widest uppercase text-blue-400 text-center mb-2">Japanese</div>
          {jpCards.map(id => {
            const w = wordById(id);
            const isMatched = matched.has(id);
            const isWrong = wrong.has(id);
            const isSelected = selectedJp === id;
            return (
              <div
                key={`jp-${id}`}
                onClick={() => { if (!isMatched) setSelectedJp(id); }}
                className={cardBase}
                style={{
                  borderColor: isMatched ? "#22c55e66" : isWrong ? "#ef444466" : isSelected ? "#3b82f6" : "#ffffff15",
                  background: isMatched ? "#22c55e11" : isWrong ? "#ef444411" : isSelected ? "#3b82f622" : "rgba(0,0,0,0.3)",
                  color: isMatched ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? "#60a5fa" : "#e2e8f0",
                  opacity: isMatched ? 0.5 : 1,
                  pointerEvents: isMatched ? "none" : "auto",
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xl">{w.word}</span>
                  {showHint && !isPureKana(w.word) && w.reading && (
                    <span className="text-[10px] text-blue-400/80 font-normal">{w.reading}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-display tracking-widest uppercase text-green-400 text-center mb-2">English</div>
          {enCards.map(id => {
            const w = wordById(id);
            const isMatched = matched.has(id);
            const isWrong = wrong.has(id);
            const isSelected = selectedEn === id;
            return (
              <div
                key={`en-${id}`}
                onClick={() => { if (!isMatched) setSelectedEn(id); }}
                className={cardBase}
                style={{
                  borderColor: isMatched ? "#22c55e66" : isWrong ? "#ef444466" : isSelected ? "#22c55e" : "#ffffff15",
                  background: isMatched ? "#22c55e11" : isWrong ? "#ef444411" : isSelected ? "#22c55e22" : "rgba(0,0,0,0.3)",
                  color: isMatched ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? "#22c55e" : "#94a3b8",
                  opacity: isMatched ? 0.5 : 1,
                  pointerEvents: isMatched ? "none" : "auto",
                  fontSize: "11px",
                }}
              >
                {w.meaning}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Multiple Choice Game ──────────────────────────────────────────────────

function MultiChoiceGame({ words, showHint }: { words: SrsWord[]; showHint?: boolean }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [questions] = useState(() =>
    shuffle(words).slice(0, Math.min(10, words.length)).map(w => {
      const distractors = pickDistractors(w, words);
      const choices = shuffle([w, ...distractors]);
      return { word: w, choices };
    })
  );

  const q = questions[idx];

  function choose(chosenId: number) {
    if (selected !== null) return;
    setSelected(chosenId);
    if (chosenId === q.word.id) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(i => i + 1); setSelected(null); }
    }, 900);
  }

  if (done) return (
    <div className="bg-card/60 border border-blue-500/20 rounded-xl p-8 text-center space-y-3">
      <div className="text-4xl">{score >= questions.length * 0.8 ? "⚔️" : "📖"}</div>
      <h2 className="font-display text-lg font-bold text-blue-400">{score}/{questions.length} Correct</h2>
      <p className="text-sm text-muted-foreground">
        {score === questions.length ? "Perfect!" : score >= questions.length * 0.8 ? "Strong work." : "Keep drilling — you'll get there."}
      </p>
      <button onClick={() => window.location.reload()} className="mt-2 px-5 py-2 rounded-lg font-display text-xs font-bold tracking-widest uppercase border border-blue-500/40 text-blue-400 bg-blue-600/10">Try Again</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground font-display">{idx}/{questions.length}</span>
      </div>

      <div className="bg-card/60 border border-border/40 rounded-2xl p-8 text-center">
        <p className="text-[10px] font-display tracking-widest uppercase text-muted-foreground mb-3">What does this mean?</p>
        <div className="font-display text-5xl font-bold text-foreground mb-2">{q.word.word}</div>
        <div className="text-sm text-blue-400">{showHint ? q.word.reading : "・・・"}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(c => {
          const isCorrect = c.id === q.word.id;
          const isChosen = selected === c.id;
          const revealed = selected !== null;
          return (
            <button
              key={c.id}
              onClick={() => choose(c.id)}
              disabled={selected !== null}
              className="py-3 px-3 rounded-xl border text-xs font-display font-bold tracking-wide transition-all duration-200 active:scale-95 disabled:cursor-default text-left leading-tight"
              style={{
                borderColor: revealed
                  ? isCorrect ? "#22c55e66" : isChosen ? "#ef444466" : "#ffffff10"
                  : "#ffffff15",
                background: revealed
                  ? isCorrect ? "#22c55e15" : isChosen ? "#ef444415" : "rgba(0,0,0,0.2)"
                  : "rgba(0,0,0,0.3)",
                color: revealed
                  ? isCorrect ? "#22c55e" : isChosen ? "#ef4444" : "#4b5563"
                  : "#e2e8f0",
              }}
            >
              {c.meaning}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Use in a Sentence Game ────────────────────────────────────────────────

function SentenceGame({ words, showHint, coreMap }: { words: SrsWord[]; showHint?: boolean; coreMap: Map<string, CoreWord> }) {
  // Only use words that exist in the core bank (have example sentences)
  const eligible = words.filter(w => coreMap.has(w.word));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const [questions] = useState(() =>
    shuffle(eligible).slice(0, Math.min(8, eligible.length)).map(w => {
      const core = coreMap.get(w.word);
      const distractors = pickDistractors(w, eligible, 3);
      const choices = shuffle([w.meaning, ...distractors.map(d => d.meaning)]);
      return { word: w, core, choices };
    })
  );

  const q = questions[idx];

  function choose(meaning: string) {
    if (selected !== null) return;
    setSelected(meaning);
    if (meaning === q.word.meaning) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(i => i + 1); setSelected(null); }
    }, 1000);
  }

  if (done) return (
    <div className="bg-card/60 border border-purple-500/20 rounded-xl p-8 text-center space-y-3">
      <div className="text-4xl">{score >= questions.length * 0.8 ? "⚔️" : "📖"}</div>
      <h2 className="font-display text-lg font-bold text-purple-400">{score}/{questions.length} Correct</h2>
      <p className="text-sm text-muted-foreground">
        {score === questions.length ? "Flawless context reading!" : score >= questions.length * 0.8 ? "Solid comprehension." : "Context clues take time — keep going."}
      </p>
      <button onClick={() => window.location.reload()} className="mt-2 px-5 py-2 rounded-lg font-display text-xs font-bold tracking-widest uppercase border border-purple-500/40 text-purple-400 bg-purple-600/10">Try Again</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground font-display">{idx}/{questions.length}</span>
      </div>

      <div className="bg-card/60 border border-purple-500/20 rounded-2xl p-6 space-y-3">
        <p className="text-[10px] font-display tracking-widest uppercase text-purple-400">What does the blank mean?</p>
        <div className="font-display text-2xl font-bold text-foreground text-center py-2">{q.word.word}</div>
        {showHint && !isPureKana(q.word.word) && (
          <p className="text-blue-400 text-sm text-center">{q.word.reading}</p>
        )}
        {q.core?.example ? (
          <div className="bg-background/40 rounded-lg p-3">
            <p className="text-sm text-foreground/70 text-center">
              {q.core.example.replace(q.word.word, "【　　】")}
            </p>
            <p className="text-[10px] text-muted-foreground text-center mt-1 italic">
              {q.core.exampleEn.replace(q.word.meaning, "______")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">What is the meaning of {q.word.word}?</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {q.choices.map((meaning, i) => {
          const isCorrect = meaning === q.word.meaning;
          const isChosen = selected === meaning;
          const revealed = selected !== null;
          return (
            <button
              key={i}
              onClick={() => choose(meaning)}
              disabled={selected !== null}
              className="py-3 px-4 rounded-xl border text-sm font-display transition-all duration-200 active:scale-95 disabled:cursor-default text-left"
              style={{
                borderColor: revealed ? isCorrect ? "#a855f766" : isChosen ? "#ef444466" : "#ffffff10" : "#ffffff15",
                background: revealed ? isCorrect ? "#a855f715" : isChosen ? "#ef444415" : "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.3)",
                color: revealed ? isCorrect ? "#a855f7" : isChosen ? "#ef4444" : "#4b5563" : "#e2e8f0",
              }}
            >
              {meaning}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Hint Toggle ──────────────────────────────────────────────────────────

function HintToggle({ show, onToggle, disabled }: { show: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-display font-bold tracking-widest uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        borderColor: disabled ? "#ffffff15" : show ? "#3b82f666" : "#ffffff15",
        background: disabled ? "rgba(0,0,0,0.2)" : show ? "rgba(59,130,246,0.12)" : "rgba(0,0,0,0.3)",
        color: disabled ? "#4b5563" : show ? "#60a5fa" : "#6b7280",
      }}
    >
      <span>あ</span>
      <span>{disabled ? "Pure Kana" : show ? "Hint ON" : "Hint OFF"}</span>
    </button>
  );
}

// ─── Flashcard Review ──────────────────────────────────────────────────────

function FlashcardReview({ words, onReview, showHint }: { words: SrsWord[]; onReview: (id: number, result: number) => void; showHint?: boolean }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [pending, setPending] = useState(false);

  const current = words[idx];
  const isDone = idx >= words.length;

  function rate(result: number) {
    if (pending) return;
    setPending(true);
    onReview(current.id, result);
    setTimeout(() => {
      setRevealed(false);
      setIdx(i => i + 1);
      setPending(false);
    }, 200);
  }

  if (isDone && words.length > 0) return (
    <div className="bg-card/60 border border-blue-500/20 rounded-xl p-8 text-center space-y-3">
      <div className="text-4xl">⚔️</div>
      <h2 className="font-display text-lg font-bold text-blue-400">Session Complete!</h2>
      <p className="text-sm text-muted-foreground">{words.length} cards reviewed. Stats updated.</p>
      <button onClick={() => { setIdx(0); setRevealed(false); }} className="mt-2 px-6 py-2 rounded-lg font-display text-sm font-bold tracking-wider text-blue-400 border border-blue-500/30 bg-blue-600/10">Review Again</button>
    </div>
  );

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${(idx / words.length) * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground font-display">{idx}/{words.length}</span>
      </div>

      <div
        className="bg-card/60 border border-border/40 rounded-2xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-3 cursor-pointer select-none"
        onClick={() => setRevealed(true)}
        style={{ borderColor: revealed ? (levelColors[current.level] + "44") : undefined }}
      >
        <span className="text-[10px] font-display font-bold tracking-widest px-2 py-0.5 rounded border"
          style={{ color: levelColors[current.level], borderColor: levelColors[current.level] + "44" }}>
          {current.level}
        </span>
        <div className="font-display text-5xl font-bold text-foreground">{current.word}</div>
        {!revealed && showHint && (
          <p className="text-blue-400/70 font-display text-base">{current.reading}</p>
        )}
        {!revealed && <p className="text-sm text-muted-foreground font-display tracking-wider animate-pulse">Tap to reveal</p>}
        {revealed && (
          <div className="space-y-1.5 animate-float-up">
            <p className="text-blue-400 font-display text-lg">{current.reading}</p>
            <p className="text-foreground/80 font-medium">{current.meaning}</p>
          </div>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2 animate-float-up">
          {SRS_INTERVALS.map((label, i) => (
            <button key={label} onClick={() => rate(i)} disabled={pending}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border transition-all duration-200 active:scale-95 disabled:opacity-50"
              style={{ borderColor: SRS_COLORS[i] + "44", background: SRS_COLORS[i] + "11", color: SRS_COLORS[i] }}>
              <span className="font-display text-xs font-bold tracking-wider">{label}</span>
              <span className="text-[10px] opacity-60">{SRS_DAYS[i]}</span>
            </button>
          ))}
        </div>
      )}
      {!revealed && (
        <button onClick={() => setRevealed(true)}
          className="w-full py-3 rounded-xl font-display text-sm font-bold tracking-widest uppercase border border-blue-500/30 text-blue-400 bg-blue-600/10">
          Show Answer
        </button>
      )}
    </div>
  );
}

// ─── Main SRS Page ──────────────────────────────────────────────────────────

export default function SRS() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<MainTab>("games");
  const [gameMode, setGameMode] = useState<GameMode>("flashcard");
  const [showHint, setShowHint] = useState(false);
  const [gameSet, setGameSet] = useState<"daily" | "mistakes" | "hard" | "known" | "N5" | "N4" | "N3" | "N2" | "N1">("daily");
  const [gameCount, setGameCount] = useState<number>(10);

  // Add word form
  const [newWord, setNewWord] = useState("");
  const [newReading, setNewReading] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newLevel, setNewLevel] = useState<JLPTLevel>("N5");

  // Starter Deck filters
  const [deckFilter, setDeckFilter] = useState<"N5" | "N4" | "all">("N5");

  const { data: dueWords = [], isLoading: dueLoading } = useQuery<SrsWord[]>({ queryKey: ["/api/srs/due"] });
  const { data: allWords = [] } = useQuery<SrsWord[]>({ queryKey: ["/api/srs"] });
  const { data: coreWords = [] } = useQuery<CoreWord[]>({
    queryKey: ["/api/core-words"],
    enabled: activeTab === "library" || activeTab === "games",
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, result }: { id: number; result: number }) =>
      apiRequest("POST", `/api/srs/review/${id}`, { result }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/srs/due"] });
      qc.invalidateQueries({ queryKey: ["/api/srs"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/srs/add", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/srs"] });
      qc.invalidateQueries({ queryKey: ["/api/srs/due"] });
      setNewWord(""); setNewReading(""); setNewMeaning("");
      toast({ title: "Word added to SRS queue ✓" });
    },
    onError: () => toast({ title: "Error adding word", variant: "destructive" }),
  });

  const bulkAddMutation = useMutation({
    mutationFn: (words: CoreWord[]) =>
      apiRequest("POST", "/api/srs/bulk-add", {
        words: words.map(w => ({ word: w.word, reading: w.reading, meaning: w.meaning, level: w.level })),
      }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/srs"] });
      qc.invalidateQueries({ queryKey: ["/api/srs/due"] });
      toast({ title: `Deck loaded ✓`, description: `${data.added} words added, ~10/day staggered${data.skipped > 0 ? `, ${data.skipped} already in deck` : ""}.` });
    },
    onError: () => toast({ title: "Error loading deck", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/srs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/srs"] });
      qc.invalidateQueries({ queryKey: ["/api/srs/due"] });
    },
  });

  const clearQueueMutation = useMutation({
    mutationFn: () => Promise.all(dueWords.map(w => apiRequest("POST", `/api/srs/review/${w.id}`, { result: 2 }))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/srs/due"] });
      qc.invalidateQueries({ queryKey: ["/api/srs"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Queue cleared ✓" });
    },
  });

  const inDeckSet = new Set(allWords.map(w => w.word));
  const filteredCore = coreWords.filter(w => deckFilter === "all" ? true : w.level === deckFilter);
  const filteredNotInDeck = filteredCore.filter(w => !inDeckSet.has(w.word));
  const filteredInDeck = filteredCore.filter(w => inDeckSet.has(w.word));

  const tabs: { id: MainTab; label: string }[] = [
    { id: "games", label: `Games (${dueWords.length})` },
    { id: "library", label: "Library" },
    { id: "add", label: "+ Word" },
  ];

  // Build the game word pool based on selected set
  const gamePool: SrsWord[] = (() => {
    if (gameSet === "daily") {
      // Due words first, fallback to shuffled deck
      const due = dueWords.slice(0, gameCount);
      if (due.length >= 4) return due;
      const extra = shuffle([...allWords]).filter(w => !due.find(d => d.id === w.id));
      return [...due, ...extra].slice(0, gameCount);
    }
    if (gameSet === "mistakes") {
      // Words you got wrong most recently (lastResult = "again")
      const wrong = allWords.filter(w => w.lastResult === "again");
      if (wrong.length >= 4) return shuffle(wrong).slice(0, gameCount);
      // Pad with hard words if not enough mistakes
      const hardExtra = shuffle(allWords.filter(w => w.easeFactor < 2.0 && w.lastResult !== "again"));
      return [...wrong, ...hardExtra].slice(0, gameCount);
    }
    if (gameSet === "hard") return shuffle(allWords.filter(w => w.lastResult === "again" || w.easeFactor < 2.0)).slice(0, gameCount);
    if (gameSet === "known") return shuffle(allWords.filter(w => w.repetitions >= 2 && w.interval >= 3)).slice(0, gameCount);
    // N5-N1: pull deck words matching level, fallback to any deck words
    const inDeck = new Set(allWords.map(w => w.word));
    const levelWords = coreWords.filter(w => w.level === gameSet && inDeck.has(w.word))
      .map(cw => allWords.find(w => w.word === cw.word)!).filter(Boolean);
    if (levelWords.length >= 4) return shuffle(levelWords).slice(0, gameCount);
    // Not enough level-specific words — fall back to full deck
    return shuffle([...allWords]).slice(0, gameCount);
  })();

  const gameModes: { id: GameMode; label: string; icon: string; color: string; desc: string }[] = [
    { id: "flashcard", label: "Flashcard", icon: "🃏", color: "#3b82f6", desc: "Tap to flip · rate yourself" },
    { id: "match", label: "Match", icon: "🎯", color: "#22c55e", desc: "Tap pairs to connect them" },
    { id: "multichoice", label: "4-Choice", icon: "⚡", color: "#f59e0b", desc: "Pick the right meaning — fast" },
    { id: "sentence", label: "In Context", icon: "🔥", color: "#a855f7", desc: "Hardest — read the sentence" },
  ];

  // Need ≥4 words in deck for games
  const canPlay = allWords.length >= 4;  // need words in deck to play

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 space-y-4 animate-float-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-wider">SRS Flashcards</h1>
          <p className="text-xs text-muted-foreground font-display tracking-widest mt-0.5 uppercase">Spaced Repetition System</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-display font-bold text-blue-400">{dueWords.length}</div>
          <div className="text-[10px] text-muted-foreground font-display tracking-wider">Due today</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="py-2 rounded-lg font-display text-[9px] font-bold tracking-wide uppercase transition-all duration-200 border"
            style={{
              borderColor: activeTab === id ? "#3b82f6" : "transparent",
              background: activeTab === id ? "rgba(59,130,246,0.15)" : "rgba(0,0,0,0.3)",
              color: activeTab === id ? "#60a5fa" : "#6b7280",
            }}
          >{label}</button>
        ))}
      </div>



      {/* ── GAMES TAB (default, includes due-word flashcard) ── */}
      {activeTab === "games" && (
        <div className="space-y-4">
          {/* Due count banner */}
          {dueWords.length > 0 && (
            <div className="flex items-center justify-between bg-blue-900/20 border border-blue-500/20 rounded-lg px-3 py-2">
              <span className="text-xs text-blue-400 font-display">{dueWords.length} cards due today</span>
              <button onClick={() => clearQueueMutation.mutate()} disabled={clearQueueMutation.isPending}
                className="text-[10px] font-display tracking-widest uppercase text-red-400/60 hover:text-red-400 transition-all disabled:opacity-30">Clear</button>
            </div>
          )}
          {!canPlay && (
            <div className="bg-card/60 border border-border/40 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">You need at least 4 words in your deck to play.</p>
              <button onClick={() => setActiveTab("library")}
                className="mt-3 px-5 py-2 rounded-lg font-display text-xs font-bold tracking-widest uppercase border border-blue-500/40 text-blue-400 bg-blue-600/10">
                Load Words →
              </button>
            </div>
          )}
          {canPlay && (
            <>
              {/* Mode picker */}
              <div className="grid grid-cols-2 gap-2">
                {gameModes.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setGameMode(m.id)}
                    className="rounded-xl p-3 border text-left transition-all duration-200 active:scale-95"
                    style={{
                      borderColor: gameMode === m.id ? m.color + "66" : "#ffffff10",
                      background: gameMode === m.id ? m.color + "15" : "rgba(0,0,0,0.3)",
                    }}
                  >
                    <div className="text-lg mb-1">{m.icon}</div>
                    <div className="font-display text-xs font-bold tracking-wider" style={{ color: gameMode === m.id ? m.color : "#e2e8f0" }}>{m.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>

              {/* Set picker */}
              <div className="space-y-2">
                <p className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">Study Set</p>
                {/* Primary sets */}
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { id: "daily",    label: "Daily 10",        color: "#3b82f6", sub: "due today" },
                    { id: "mistakes", label: "Today's Mistakes", color: "#ef4444", sub: "got wrong" },
                    { id: "hard",     label: "Hard",             color: "#f97316", sub: "low ease" },
                    { id: "known",    label: "Known",            color: "#22c55e", sub: "well learned" },
                  ] as const).map(s => (
                    <button key={s.id} onClick={() => setGameSet(s.id as any)}
                      className="py-2 px-3 rounded-lg font-display text-left border transition-all"
                      style={{
                        borderColor: gameSet === s.id ? s.color + "66" : "#ffffff10",
                        background: gameSet === s.id ? s.color + "18" : "rgba(0,0,0,0.3)",
                      }}>
                      <div className="text-[11px] font-bold" style={{ color: gameSet === s.id ? s.color : "#e2e8f0" }}>{s.label}</div>
                      <div className="text-[9px] mt-0.5" style={{ color: gameSet === s.id ? s.color + "aa" : "#4b5563" }}>{s.sub}</div>
                    </button>
                  ))}
                </div>
                {/* JLPT level sets */}
                <div className="grid grid-cols-5 gap-1">
                  {([
                    { id: "N5", label: "N5", color: "#3b82f6" },
                    { id: "N4", label: "N4", color: "#22c55e" },
                    { id: "N3", label: "N3", color: "#f59e0b" },
                    { id: "N2", label: "N2", color: "#f97316" },
                    { id: "N1", label: "N1", color: "#a855f7" },
                  ] as const).map(s => (
                    <button key={s.id} onClick={() => setGameSet(s.id as any)}
                      className="py-1 rounded-lg font-display text-[10px] font-bold tracking-wide border transition-all"
                      style={{
                        borderColor: gameSet === s.id ? s.color + "66" : "#ffffff10",
                        background: gameSet === s.id ? s.color + "18" : "rgba(0,0,0,0.3)",
                        color: gameSet === s.id ? s.color : "#6b7280",
                      }}>{s.label}</button>
                  ))}
                </div>
              </div>

              {/* Count picker */}
              <div className="space-y-2">
                <p className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">How many?</p>
                <div className="flex gap-1.5">
                  {[10, 15, 25, 50, 100].map(n => (
                    <button key={n} onClick={() => setGameCount(n)}
                      className="flex-1 py-1.5 rounded-lg font-display text-[10px] font-bold border transition-all"
                      style={{
                        borderColor: gameCount === n ? "#3b82f666" : "#ffffff10",
                        background: gameCount === n ? "rgba(59,130,246,0.15)" : "rgba(0,0,0,0.3)",
                        color: gameCount === n ? "#60a5fa" : "#6b7280",
                      }}>{n}</button>
                  ))}
                </div>
              </div>

              {gamePool.length < 4 && (
                <p className="text-xs text-muted-foreground text-center py-2">Not enough words in this set — add more to your deck or try a different set.</p>
              )}

              {/* Game area */}
              {gamePool.length >= 4 && (
                <>
                  <div className="flex justify-end">
                    <HintToggle show={showHint} onToggle={() => setShowHint(h => !h)} />
                  </div>
                  <div>
                    {gameMode === "flashcard" && <FlashcardReview key={gameSet+gameCount} words={shuffle(gamePool)} onReview={(id, result) => reviewMutation.mutate({ id, result })} showHint={showHint} />}
                    {gameMode === "match" && <MatchGame key={gameSet+gameCount} words={gamePool} showHint={showHint} />}
                    {gameMode === "multichoice" && <MultiChoiceGame key={gameSet+gameCount} words={gamePool} showHint={showHint} />}
                    {gameMode === "sentence" && <SentenceGame key={gameSet+gameCount} words={gamePool} showHint={showHint} coreMap={new Map(coreWords.map((w: CoreWord) => [w.word, w]))} />}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CORE 500 STARTER DECK TAB ── */}
      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="bg-card/60 border border-blue-500/20 rounded-xl p-4">
            <div className="mb-2">
              <h2 className="font-display text-sm font-bold text-blue-400 tracking-wider">Core 500 Frequency Deck</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Top 500 JLPT N5/N4 words. Introduced ~10/day so you're never overwhelmed.</p>
            </div>
            <div className="flex gap-2 mt-3">
              {(["N5", "N4", "N3", "N2", "N1", "all"] as const).map((f) => (
                <button key={f} onClick={() => setDeckFilter(f)}
                  className="flex-1 py-1.5 rounded-lg font-display text-xs font-bold tracking-wider border transition-all"
                  style={{
                    borderColor: deckFilter === f ? (f === "all" ? "#3b82f6" : levelColors[f]) : "transparent",
                    background: deckFilter === f ? `${f === "all" ? "#3b82f6" : levelColors[f]}22` : "rgba(0,0,0,0.3)",
                    color: deckFilter === f ? (f === "all" ? "#60a5fa" : levelColors[f]) : "#6b7280",
                  }}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-3 text-center">
              {[
                { v: filteredCore.length - filteredNotInDeck.length, l: "In Deck", c: "#22c55e" },
                { v: filteredNotInDeck.length, l: "To Add", c: "#3b82f6" },
                { v: filteredCore.length, l: "Total", c: "#e2e8f0" },
              ].map(({ v, l, c }) => (
                <div key={l} className="flex-1 bg-background/40 rounded-lg py-2">
                  <div className="font-display text-sm font-bold" style={{ color: c }}>{v}</div>
                  <div className="text-[10px] text-muted-foreground font-display">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {filteredNotInDeck.length > 0 && (
            <button onClick={() => bulkAddMutation.mutate(filteredNotInDeck)} disabled={bulkAddMutation.isPending}
              className="w-full py-4 rounded-xl font-display text-sm font-bold tracking-widest uppercase transition-all duration-200 active:scale-95 disabled:opacity-50"
              style={{ background: bulkAddMutation.isPending ? "#1e3a8a" : "linear-gradient(135deg, #1d4ed8, #7c3aed)", boxShadow: bulkAddMutation.isPending ? "none" : "0 0 20px rgba(59,130,246,0.3)" }}>
              {bulkAddMutation.isPending ? "Loading deck..." : `Add ${filteredNotInDeck.length} ${deckFilter === "all" ? "" : deckFilter + " "}Words`}
            </button>
          )}
          {filteredNotInDeck.length === 0 && filteredCore.length > 0 && (
            <div className="bg-card/60 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-display text-sm text-green-400 font-bold">All {deckFilter === "all" ? "500" : deckFilter} words in your deck!</p>
            </div>
          )}

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
            {filteredCore.length === 0 && <div className="text-center text-muted-foreground font-display py-8 animate-pulse text-sm">Loading...</div>}
            {filteredCore.map((w, i) => {
              const inDeck = inDeckSet.has(w.word);
              return (
                <div key={w.word} className="bg-card/40 border border-border/30 rounded-lg px-3 py-2 flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground/40 font-display w-6 text-right shrink-0">{i + 1}</span>
                  <span className="font-display text-sm font-bold text-foreground w-14 shrink-0">{w.word}</span>
                  <span className="text-xs text-blue-400/70 w-20 shrink-0">{w.reading}</span>
                  <span className="text-xs text-muted-foreground flex-1 truncate">{w.meaning}</span>
                  <span className="text-[9px] font-display font-bold px-1.5 py-0.5 rounded border shrink-0"
                    style={{ color: levelColors[w.level], borderColor: levelColors[w.level] + "33" }}>{w.level}</span>
                  {inDeck && <span className="text-green-500/70 shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ADD WORD TAB ── */}
      {activeTab === "add" && (
        <div className="bg-card/60 border border-border/40 rounded-xl p-4 space-y-4">
          <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground block">Add a Custom Word</label>
          {[
            { label: "Japanese word / kanji", val: newWord, set: setNewWord, ph: "e.g. 勉強", test: "input-new-word" },
            { label: "Reading (hiragana)", val: newReading, set: setNewReading, ph: "e.g. べんきょう", test: "input-new-reading" },
            { label: "Meaning (English)", val: newMeaning, set: setNewMeaning, ph: "e.g. Study / to study", test: "input-new-meaning" },
          ].map(({ label, val, set, ph, test }) => (
            <div key={label}>
              <label className="text-xs text-muted-foreground/80 block mb-1.5 font-display">{label}</label>
              <input type="text" value={val} onChange={e => set(e.target.value)} placeholder={ph} data-testid={test}
                className="w-full bg-background/60 border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500/60 transition-colors" />
            </div>
          ))}
          <div>
            <label className="text-xs text-muted-foreground/80 block mb-2 font-display">JLPT Level</label>
            <div className="flex gap-2">
              {(["N5", "N4", "N3", "N2", "N1"] as JLPTLevel[]).map(lvl => (
                <button key={lvl} onClick={() => setNewLevel(lvl)}
                  className="flex-1 py-1.5 rounded-lg font-display text-xs font-bold tracking-wider transition-all border"
                  style={{ borderColor: newLevel === lvl ? levelColors[lvl] : "transparent", background: newLevel === lvl ? `${levelColors[lvl]}22` : "rgba(0,0,0,0.3)", color: newLevel === lvl ? levelColors[lvl] : "#6b7280" }}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => { if (!newWord || !newMeaning) { toast({ title: "Add word and meaning at minimum" }); return; } addMutation.mutate({ word: newWord, reading: newReading, meaning: newMeaning, level: newLevel }); }}
            disabled={addMutation.isPending}
            className="w-full py-3 rounded-xl font-display text-sm font-bold tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", boxShadow: "0 0 16px rgba(59,130,246,0.25)" }}>
            {addMutation.isPending ? "Adding..." : "Add to Deck"}
          </button>
        </div>
      )}

      {/* ── MY DECK TAB ── */}
          </div>
  );
}