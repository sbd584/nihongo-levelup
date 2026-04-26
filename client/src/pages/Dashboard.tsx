import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import OvrRing from "@/components/OvrRing";
import RadarChart from "@/components/RadarChart";
import Heatmap from "@/components/Heatmap";
import type { Stats, CheckIn } from "@shared/schema";

type MasteryData = { total: number; vocabKnown: number; kanjiKnown: number; vocabPct: number; kanjiPct: number };

type DuolingoData = {
  name: string;
  streak: number;
  totalXp: number;
  japaneseXp: number;
};

type WordOfDay = {
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  example: string;
  exampleEn: string;
};

// Ranks tied to JLPT pass likelihood:
// S in a band = ~80%+ chance of passing that level
// A = ~65%, B = ~50% (pass threshold), C = ~35%, D = ~20%, E = just entered
// OVR bands: N5 0-19, N4 20-39, N3 40-59, N2 60-79, N1 80-100
function getRankInfo(ovr: number): { rank: string; color: string; label: string; jlpt: string; rankPrev: number; rankNext: number } {
  const band = (prev: number, next: number, jlpt: string) => {
    const size = next - prev;
    const s = Math.floor(size / 6);
    const pos = ovr - prev;
    if (pos < s)     return { rank: "E", color: "#9ca3af", label: jlpt, jlpt, rankPrev: prev,       rankNext: prev + s };
    if (pos < s*2)   return { rank: "D", color: "#22c55e", label: jlpt, jlpt, rankPrev: prev + s,   rankNext: prev + s*2 };
    if (pos < s*3)   return { rank: "C", color: "#3b82f6", label: jlpt, jlpt, rankPrev: prev + s*2, rankNext: prev + s*3 };
    if (pos < s*4)   return { rank: "B", color: "#a855f7", label: jlpt, jlpt, rankPrev: prev + s*3, rankNext: prev + s*4 };
    if (pos < s*5)   return { rank: "A", color: "#f59e0b", label: jlpt, jlpt, rankPrev: prev + s*4, rankNext: prev + s*5 };
    return             { rank: "S", color: "#ef4444", label: jlpt, jlpt, rankPrev: prev + s*5, rankNext: next };
  };
  if (ovr < 20)  return band(0,  20,  "N5");
  if (ovr < 40)  return band(20, 40,  "N4");
  if (ovr < 60)  return band(40, 60,  "N3");
  if (ovr < 80)  return band(60, 80,  "N2");
  return               band(80, 100, "N1");
}

function calcOVR(s: Stats): number {
  // Conversation-optimized weights (research-backed)
  // Vocab 30%, Listen 20%, Kanji 15%, Reading 15%, Grammar 10%, Consistency 10%
  const weights = { vocabulary: 0.30, kanji: 0.15, listening: 0.20, reading: 0.15, grammar: 0.10, consistency: 0.10 };
  return Math.round(
    s.vocabulary * weights.vocabulary +
    s.kanji * weights.kanji +
    s.listening * weights.listening +
    s.reading * weights.reading +
    s.grammar * weights.grammar +
    s.consistency * weights.consistency
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: checkIns = [] } = useQuery<CheckIn[]>({
    queryKey: ["/api/checkins"],
  });

  const { data: word } = useQuery<WordOfDay>({
    queryKey: ["/api/word-of-day"],
  });

  const { data: todayCheckin } = useQuery({ queryKey: ["/api/checkin/today"] });
  const { data: mastery } = useQuery<MasteryData>({ queryKey: ["/api/srs/mastery"] });

  // Duolingo stats — static snapshot (CORS blocks live fetch on static host)
  const duo: DuolingoData = { name: "Sam", streak: 0, totalXp: 7856, japaneseXp: 4915 };

  // Fix #6: Auto-credit Word of the Day on Dashboard open
  const wotdMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/wotd-viewed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  useEffect(() => {
    if (word) {
      // Fire and forget — credits the WotD view for today
      wotdMutation.mutate();
    }
  // Only run once when word first loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!word]);

  if (statsLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-400 font-display text-xl animate-pulse tracking-widest">LOADING...</div>
      </div>
    );
  }

  const ovr = calcOVR(stats);
  const { rank, color: rankColor, label: rankLabel, jlpt, rankPrev, rankNext } = getRankInfo(ovr);

  const statData = [
    { label: "Vocab", labelJa: "語彙", value: stats.vocabulary, color: "#3b82f6" },
    { label: "Kanji", labelJa: "漢字", value: stats.kanji, color: "#a855f7" },
    { label: "Listen", labelJa: "聴解", value: stats.listening, color: "#22c55e" },
    { label: "Reading", labelJa: "読解", value: stats.reading, color: "#f59e0b" },
    { label: "Grammar", labelJa: "文法", value: stats.grammar, color: "#ef4444" },
    { label: "Streak", labelJa: "継続", value: stats.consistency, color: "#06b6d4" },
  ];

  const rankProgress = rankNext > rankPrev ? ((ovr - rankPrev) / (rankNext - rankPrev)) * 100 : 100;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 space-y-5 animate-float-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-wider text-foreground">日本語 LEVEL UP</h1>
          <p className="text-xs text-muted-foreground font-display tracking-widest uppercase">{rankLabel} · {jlpt} Hunter</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Streak</div>
          <div className="font-display text-lg font-bold text-blue-400">{stats.currentStreak}🔥</div>
        </div>
      </div>

      {/* OVR Ring */}
      <div className="flex justify-center py-2">
        <OvrRing ovr={ovr} rank={rank} rankColor={rankColor} />
      </div>

      {/* Rank Progress */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-muted-foreground font-display tracking-wider">RANK PROGRESS</span>
          <span className="text-xs font-display font-bold" style={{ color: rankColor }}>
            {rank === "S" ? `${jlpt} MASTERED` : `→ ${jlpt} ${rank === "E" ? "D" : rank === "D" ? "C" : rank === "C" ? "B" : rank === "B" ? "A" : "S"}`}
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${rankProgress}%`,
              background: `linear-gradient(90deg, ${rankColor}99, ${rankColor})`,
              boxShadow: `0 0 8px ${rankColor}66`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">{rankPrev}</span>
          <span className="text-[10px] text-muted-foreground">{rankNext}</span>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Words", value: stats.totalVocabLearned ?? 0, icon: "語" },
          { label: "Kanji", value: (stats.totalKanjiDrilled ?? 0) + (stats.totalKanjiInContext ?? 0), icon: "字" },
          { label: "Hours", value: Math.round((stats.totalMinutesStudied ?? 0) / 60 * 10) / 10, icon: "時" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-card/60 border border-border/40 rounded-xl p-3 text-center" data-testid={`stat-${label.toLowerCase()}`}>
            <div className="text-lg font-display font-bold text-blue-400">{value}</div>
            <div className="text-[10px] text-muted-foreground font-display tracking-wider uppercase">{label}</div>
            <div className="text-xs text-muted-foreground/40 mt-0.5">{icon}</div>
          </div>
        ))}
      </div>

      {/* Mastery row */}
      {mastery && mastery.total > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Vocab Known", pct: mastery.vocabPct, n: mastery.vocabKnown, total: mastery.total, color: "#22c55e" },
            { label: "Kanji Known", pct: mastery.kanjiPct, n: mastery.kanjiKnown, total: mastery.total, color: "#a855f7" },
          ].map(({ label, pct, n, total, color }) => (
            <div key={label} className="bg-card/60 border border-border/40 rounded-xl p-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-display tracking-wider uppercase text-muted-foreground">{label}</span>
                <span className="text-[10px] font-display font-bold" style={{ color }}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{n} / {total} words</div>
            </div>
          ))}
        </div>
      )}

      {/* Radar */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4">
        <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-3">Skill Attributes</h2>
        <RadarChart stats={statData} />
      </div>

      {/* Word of the Day */}
      {word && (
        <div className="bg-card/60 border border-blue-500/20 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl" />
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-display tracking-widest uppercase text-blue-400">Word of the Day</span>
            <span className="text-[10px] text-muted-foreground font-display">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-display text-2xl font-bold text-foreground" data-testid="word-of-day">{word.word}</span>
            <span className="text-sm text-blue-400">{word.reading}</span>
            <span className="text-xs text-muted-foreground">{word.romaji}</span>
          </div>
          <p className="text-sm font-medium text-foreground/80 mb-2">{word.meaning}</p>
          <div className="bg-background/60 rounded-lg p-2.5">
            <p className="text-sm text-foreground/70">{word.example}</p>
            <p className="text-xs text-muted-foreground mt-1 italic">{word.exampleEn}</p>
          </div>
        </div>
      )}

      {/* Duolingo Card */}
      {duo && (
        <div className="bg-card/60 border border-[#58cc02]/20 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#58cc02]/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-display tracking-widest uppercase text-[#58cc02]">Duolingo</span>
            <span className="text-[10px] text-muted-foreground font-display">@Yasssammm</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="font-display text-lg font-bold text-[#ff9600]">{duo.streak}🔥</div>
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Streak</div>
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-bold text-[#58cc02]">{duo.japaneseXp.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase">JP XP</div>
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-bold text-blue-400">{duo.totalXp.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Total XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">Activity (90 days)</h2>
          <span className="text-xs text-blue-400 font-display">{checkIns.length} sessions</span>
        </div>
        <Heatmap checkIns={checkIns as any} />
      </div>

      {/* Check-in CTA */}
      {!todayCheckin && (
        <Link href="/checkin">
          <div
            className="w-full py-4 rounded-xl font-display text-base font-bold tracking-widest uppercase text-center cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              boxShadow: "0 0 24px rgba(59,130,246,0.3)",
            }}
            data-testid="btn-log-study"
          >
            + Log Today's Study
          </div>
        </Link>
      )}
      {todayCheckin && (
        <div className="w-full py-3 rounded-xl border border-green-500/30 bg-green-900/10 text-center">
          <span className="font-display text-sm tracking-widest text-green-400 uppercase">✓ Session Logged Today</span>
        </div>
      )}
    </div>
  );
}
