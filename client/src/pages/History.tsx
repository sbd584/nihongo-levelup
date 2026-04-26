import { useQuery } from "@tanstack/react-query";
import type { CheckIn } from "@shared/schema";

export default function History() {
  const { data: checkIns = [], isLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/checkins"],
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-400 font-display text-xl animate-pulse tracking-widest">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 space-y-5 animate-float-up">
      <div>
        <h1 className="font-display text-xl font-bold tracking-wider">Quest Log</h1>
        <p className="text-xs text-muted-foreground font-display tracking-widest mt-0.5 uppercase">Your study history</p>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Current Streak" value={`${stats.currentStreak} days`} icon="🔥" color="text-orange-400" />
          <StatCard label="Best Streak" value={`${stats.longestStreak} days`} icon="🏆" color="text-yellow-400" />
          <StatCard label="Total Sessions" value={`${checkIns.length}`} icon="⚔️" color="text-blue-400" />
          <StatCard label="Total Hours" value={`${Math.round(stats.totalMinutesStudied / 60 * 10) / 10}h`} icon="⏱" color="text-purple-400" />
        </div>
      )}

      {/* Check-in list */}
      <div className="space-y-2">
        <h2 className="font-display text-xs tracking-widest uppercase text-muted-foreground">Sessions</h2>
        {checkIns.length === 0 ? (
          <div className="bg-card/60 border border-border/40 rounded-xl p-8 text-center">
            <p className="text-muted-foreground font-display tracking-wider">No sessions yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Log your first study session to start your journey.</p>
          </div>
        ) : (
          checkIns.map((c) => (
            <CheckInCard key={c.id} checkin={c} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-card/60 border border-border/40 rounded-xl p-3 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <div className={`font-display text-lg font-bold ${color}`}>{value}</div>
        <div className="text-[10px] text-muted-foreground font-display tracking-wider uppercase">{label}</div>
      </div>
    </div>
  );
}

function CheckInCard({ checkin }: { checkin: CheckIn }) {
  const date = new Date(checkin.date + "T12:00:00");
  const formatted = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div
      className="bg-card/60 border border-border/40 rounded-xl p-4 flex items-center gap-4"
      data-testid={`checkin-card-${checkin.id}`}
    >
      <div className="flex flex-col items-center gap-0.5 w-12">
        <span className="text-lg">{checkin.sessionType === "morning" ? "☀️" : "🌙"}</span>
        <span className="text-[10px] text-muted-foreground font-display tracking-wider capitalize">{checkin.sessionType}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm font-bold text-foreground">{formatted}</div>
        <div className="flex gap-3 mt-1 flex-wrap">
          {checkin.minutesStudied > 0 && (
            <span className="text-[10px] text-blue-400 font-display">{checkin.minutesStudied}min</span>
          )}
          {checkin.vocabLearned > 0 && (
            <span className="text-[10px] text-purple-400 font-display">{checkin.vocabLearned} words</span>
          )}
          {checkin.kanjiPracticed > 0 && (
            <span className="text-[10px] text-green-400 font-display">{checkin.kanjiPracticed} kanji</span>
          )}
        </div>
        {checkin.notes && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">{checkin.notes}</p>
        )}
      </div>
      <div className="text-right">
        <div className="text-xs font-display font-bold text-blue-400">{checkin.minutesStudied}m</div>
      </div>
    </div>
  );
}
