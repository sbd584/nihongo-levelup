interface CheckIn {
  date: string;
  minutesStudied: number;
}

interface Props {
  checkIns: CheckIn[];
}

export default function Heatmap({ checkIns }: Props) {
  const today = new Date();
  const days: { date: string; intensity: number }[] = [];

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const checkin = checkIns.find((c) => c.date === dateStr);
    const minutes = checkin?.minutesStudied ?? 0;
    const intensity = minutes === 0 ? 0 : minutes < 15 ? 1 : minutes < 30 ? 2 : minutes < 60 ? 3 : 4;
    days.push({ date: dateStr, intensity });
  }

  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];

  // Pad to start on Sunday
  const firstDay = new Date(days[0].date).getDay();
  for (let i = 0; i < firstDay; i++) currentWeek.push({ date: "", intensity: -1 });

  days.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const colors = [
    "bg-border/60",
    "bg-blue-900/60",
    "bg-blue-700/70",
    "bg-blue-500/80",
    "bg-blue-400",
  ];

  const glows = [
    "",
    "",
    "",
    "shadow-[0_0_4px_rgba(59,130,246,0.4)]",
    "shadow-[0_0_6px_rgba(59,130,246,0.7)]",
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day.date ? `${day.date}: ${day.intensity > 0 ? "studied" : "no study"}` : ""}
                className={`w-3 h-3 rounded-sm transition-all ${
                  day.intensity === -1
                    ? "opacity-0"
                    : colors[day.intensity]
                } ${day.intensity > 0 ? glows[day.intensity] : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-muted-foreground font-display tracking-wider">Less</span>
        {colors.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-muted-foreground font-display tracking-wider">More</span>
      </div>
    </div>
  );
}
