import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useHashLocation } from "wouter/use-hash-location";
import { useToast } from "@/hooks/use-toast";

type SessionType = "morning" | "evening";
type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

const levelColors: Record<JLPTLevel, string> = {
  N5: "#22c55e",
  N4: "#3b82f6",
  N3: "#a855f7",
  N2: "#f59e0b",
  N1: "#ef4444",
};

const levelHints: Record<JLPTLevel, string> = {
  N5: "Beginner basics — highest foundation value (1.5×)",
  N4: "Elementary — high frequency daily words (1.2×)",
  N3: "Intermediate — core daily vocab (1.0×)",
  N2: "Upper intermediate (0.8×)",
  N1: "Advanced / native level (0.7×)",
};

// Quick-pick option chips
const VOCAB_OPTIONS = [0, 5, 10, 15, 20, 30];
const KANJI_OPTIONS = [0, 3, 5, 10, 15, 20];
const MINUTES_OPTIONS = [10, 15, 20, 30, 45, 60, 90];

function ChipPicker({
  label,
  options,
  value,
  onChange,
  unit = "",
  testPrefix,
  accentColor = "#3b82f6",
}: {
  label: string;
  options: number[];
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  testPrefix: string;
  accentColor?: string;
}) {
  const isCustom = !options.includes(value) && value > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-muted-foreground/80 font-display">{label}</label>
        <span
          className="font-display text-sm font-bold"
          style={{ color: value > 0 ? accentColor : "#6b7280" }}
        >
          {value}{unit}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              data-testid={`${testPrefix}-${opt}`}
              className="px-3 py-1.5 rounded-lg font-display text-xs font-bold tracking-wide transition-all duration-150 border"
              style={{
                borderColor: active ? accentColor : "rgba(255,255,255,0.08)",
                background: active ? `${accentColor}22` : "rgba(0,0,0,0.3)",
                color: active ? accentColor : "#6b7280",
                boxShadow: active ? `0 0 8px ${accentColor}33` : "none",
              }}
            >
              {opt === 0 ? "None" : `${opt}${unit}`}
            </button>
          );
        })}
        {/* Custom stepper for values not in the preset list */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => onChange(Math.max(0, value - 1))}
            data-testid={`${testPrefix}-dec`}
            className="w-7 h-7 rounded-lg border border-border/60 bg-background/60 text-muted-foreground font-bold text-sm flex items-center justify-center transition-colors hover:border-blue-500/40 hover:text-foreground"
          >−</button>
          <button
            onClick={() => onChange(value + 1)}
            data-testid={`${testPrefix}-inc`}
            className="w-7 h-7 rounded-lg border border-border/60 bg-background/60 text-muted-foreground font-bold text-sm flex items-center justify-center transition-colors hover:border-blue-500/40 hover:text-foreground"
          >+</button>
        </div>
      </div>
    </div>
  );
}

export default function CheckIn() {
  const [, setLocation] = useHashLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [vocab, setVocab] = useState(0);
  const [vocabLevel, setVocabLevel] = useState<JLPTLevel>("N5");
  const [kanjiDrilled, setKanjiDrilled] = useState(0);
  const [kanjiInContext, setKanjiInContext] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [sessionType, setSessionType] = useState<SessionType>("morning");
  const [notes, setNotes] = useState("");
  const [comprehensionWin, setComprehensionWin] = useState("");
  const [levelUp, setLevelUp] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Pre-select session type based on current hour
  useState(() => {
    const h = new Date().getHours();
    setSessionType(h >= 12 ? "evening" : "morning");
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/checkin", data),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/checkins"] });
      qc.invalidateQueries({ queryKey: ["/api/checkin/today"] });
      setLevelUp(true);
      setTimeout(() => setLocation("/"), 1800);
    },
    onError: () => {
      toast({ title: "Error", description: "Couldn't save check-in.", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!minutes) {
      toast({ title: "Hold up", description: "Pick how many minutes you studied." });
      return;
    }
    mutation.mutate({
      date: today,
      vocabLearned: vocab,
      vocabLevel,
      kanjiDrilled,
      kanjiInContext,
      minutesStudied: minutes,
      sessionType,
      notes,
      comprehensionWin,
      wordOfDayViewed: 0,
    });
  };

  if (levelUp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-8">
        <div className="text-6xl animate-bounce">⚔️</div>
        <h1 className="font-display text-3xl font-bold text-center text-blue-400 tracking-widest">
          SESSION LOGGED
        </h1>
        <p className="text-center text-muted-foreground font-display tracking-wider">Stats updated. Keep climbing.</p>
        <div className="text-2xl">日本語</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 space-y-4 animate-float-up safe-top">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold tracking-wider">Log Study Session</h1>
        <p className="text-xs text-muted-foreground font-display tracking-widest mt-0.5 uppercase">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Session type — auto-selected, still toggleable */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4">
        <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground block mb-3">Session Type</label>
        <div className="grid grid-cols-2 gap-3">
          {(["morning", "evening"] as SessionType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSessionType(type)}
              data-testid={`btn-session-${type}`}
              className={`py-3 rounded-lg font-display text-sm font-bold tracking-widest uppercase transition-all duration-200 ${
                sessionType === type
                  ? "bg-blue-600/80 text-white border border-blue-400/50"
                  : "bg-background/60 border border-border/60 text-muted-foreground"
              }`}
            >
              {type === "morning" ? "☀️ Morning" : "🌙 Evening"}
            </button>
          ))}
        </div>
      </div>

      {/* Time — chips */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4">
        <ChipPicker
          label="⏱ Minutes studied"
          options={MINUTES_OPTIONS}
          value={minutes}
          onChange={setMinutes}
          unit="m"
          testPrefix="chip-minutes"
          accentColor="#06b6d4"
        />
      </div>

      {/* Vocab with JLPT level */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4 space-y-4">
        <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground block">📖 Vocabulary</label>

        <ChipPicker
          label="New words learned"
          options={VOCAB_OPTIONS}
          value={vocab}
          onChange={setVocab}
          testPrefix="chip-vocab"
          accentColor="#3b82f6"
        />

        {/* JLPT Level picker */}
        <div>
          <label className="text-xs text-muted-foreground/80 block mb-2 font-display">Word level (JLPT)</label>
          <div className="flex gap-2">
            {(["N5", "N4", "N3", "N2", "N1"] as JLPTLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setVocabLevel(lvl)}
                data-testid={`btn-level-${lvl}`}
                className="flex-1 py-1.5 rounded-lg font-display text-xs font-bold tracking-wider transition-all duration-200 border"
                style={{
                  borderColor: vocabLevel === lvl ? levelColors[lvl] : "transparent",
                  background: vocabLevel === lvl ? `${levelColors[lvl]}22` : "rgba(0,0,0,0.3)",
                  color: vocabLevel === lvl ? levelColors[lvl] : "#6b7280",
                  boxShadow: vocabLevel === lvl ? `0 0 8px ${levelColors[lvl]}44` : "none",
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-display">
            {levelHints[vocabLevel]}
          </p>
        </div>
      </div>

      {/* Kanji — chips for both fields */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4 space-y-4">
        <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground block">漢 Kanji</label>

        <ChipPicker
          label="Drilled in isolation (flashcards, writing)"
          options={KANJI_OPTIONS}
          value={kanjiDrilled}
          onChange={setKanjiDrilled}
          testPrefix="chip-kanji-drilled"
          accentColor="#a855f7"
        />

        <ChipPicker
          label="Encountered in context (reading) ×2 value"
          options={KANJI_OPTIONS}
          value={kanjiInContext}
          onChange={setKanjiInContext}
          testPrefix="chip-kanji-context"
          accentColor="#22c55e"
        />

        <p className="text-[10px] text-blue-400/60 font-display">
          Research: kanji met in reading context builds retention 2× faster than drilled in isolation.
        </p>
      </div>

      {/* Comprehension Win */}
      <div className="bg-card/60 border border-blue-500/20 rounded-xl p-4">
        <label className="text-[10px] font-display tracking-widest uppercase text-blue-400/80 block mb-2">
          ✨ Comprehension Win (optional)
        </label>
        <textarea
          className="w-full bg-background/60 border border-border/60 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-blue-500/60 transition-colors"
          rows={2}
          placeholder="e.g. 'Understood a full sentence without looking anything up'"
          value={comprehensionWin}
          onChange={(e) => setComprehensionWin(e.target.value)}
          data-testid="input-comprehension-win"
        />
        <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-display">
          These moments signal real acquisition — they boost your Consistency stat.
        </p>
      </div>

      {/* Notes */}
      <div className="bg-card/60 border border-border/40 rounded-xl p-4">
        <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground block mb-2">Notes (optional)</label>
        <textarea
          className="w-full bg-background/60 border border-border/60 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-blue-500/60 transition-colors"
          rows={2}
          placeholder="What did you study? Any words that stuck? Conversations you had..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="input-notes"
        />
      </div>

      {/* Summary bar — quick sanity check before submitting */}
      <div className="bg-card/80 border border-border/60 rounded-xl p-3 flex items-center justify-around text-center">
        <div>
          <div className="font-display text-sm font-bold text-cyan-400">{minutes}m</div>
          <div className="text-[10px] text-muted-foreground font-display uppercase">Time</div>
        </div>
        <div className="w-px h-8 bg-border/60" />
        <div>
          <div className="font-display text-sm font-bold text-blue-400">{vocab}</div>
          <div className="text-[10px] text-muted-foreground font-display uppercase">Words</div>
        </div>
        <div className="w-px h-8 bg-border/60" />
        <div>
          <div className="font-display text-sm font-bold text-purple-400">{kanjiDrilled + kanjiInContext}</div>
          <div className="text-[10px] text-muted-foreground font-display uppercase">Kanji</div>
        </div>
        <div className="w-px h-8 bg-border/60" />
        <div>
          <div className="font-display text-sm font-bold" style={{ color: levelColors[vocabLevel] }}>{vocabLevel}</div>
          <div className="text-[10px] text-muted-foreground font-display uppercase">Level</div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        data-testid="btn-submit-checkin"
        className="w-full py-4 rounded-xl font-display text-base font-bold tracking-widest uppercase transition-all duration-200 active:scale-95 disabled:opacity-50"
        style={{
          background: mutation.isPending ? "#1e3a8a" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
          boxShadow: mutation.isPending ? "none" : "0 0 24px rgba(59,130,246,0.3)",
        }}
      >
        {mutation.isPending ? "SAVING..." : "CONFIRM SESSION ⚔️"}
      </button>
    </div>
  );
}
