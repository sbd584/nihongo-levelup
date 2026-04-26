interface StatData {
  label: string;
  labelJa: string;
  value: number;
  color: string;
}

interface Props {
  stats: StatData[];
}

export default function RadarChart({ stats }: Props) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 90;
  const n = stats.length;

  const getPoint = (i: number, radius: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = stats.map((s, i) => getPoint(i, (s.value / 100) * r));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridLevels.map((level, li) => {
          const pts = Array.from({ length: n }, (_, i) => getPoint(i, r * level));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
          return (
            <path
              key={li}
              d={path}
              fill="none"
              stroke="rgba(59,130,246,0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {stats.map((_, i) => {
          const outer = getPoint(i, r);
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={outer.x} y2={outer.y}
              stroke="rgba(59,130,246,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill="rgba(59,130,246,0.12)"
          stroke="url(#radarGrad)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r={4}
            fill={stats[i].color}
            stroke="#0a0a14"
            strokeWidth="1.5"
          />
        ))}

        {/* Labels */}
        {stats.map((s, i) => {
          const labelR = r + 22;
          const pt = getPoint(i, labelR);
          return (
            <text
              key={i}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(220,220,240,0.7)"
              fontSize="9"
              fontFamily="Rajdhani, sans-serif"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              {s.labelJa}
            </text>
          );
        })}
      </svg>

      {/* Stat bars */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2 px-2 mt-1">
        {stats.map((s) => (
          <div key={s.label} data-testid={`stat-${s.label.toLowerCase()}`}>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-muted-foreground font-display tracking-wider uppercase">{s.label}</span>
              <span className="text-[10px] font-bold font-display" style={{ color: s.color }}>{Math.round(s.value)}</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.value}%`, backgroundColor: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
