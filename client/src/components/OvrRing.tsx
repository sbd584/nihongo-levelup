import { useEffect, useRef, useState } from "react";

interface Props {
  ovr: number;
  rank: string;
  rankColor: string;
}

export default function OvrRing({ ovr, rank, rankColor }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef<number>();

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;
    const from = 0;
    const to = ovr;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [ovr]);

  const size = 200;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (ovr / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(59,130,246,0.1)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
            className="animate-ring-pulse"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-5xl font-bold text-glow-blue"
            style={{ color: rankColor }}
            data-testid="ovr-score"
          >
            {displayed}
          </span>
          <span className="text-xs text-muted-foreground font-display tracking-widest uppercase mt-0.5">OVR</span>
        </div>
      </div>

      {/* Rank badge */}
      <div
        className="px-6 py-1.5 rounded border font-display text-lg font-bold tracking-[0.2em] uppercase"
        style={{
          borderColor: rankColor,
          color: rankColor,
          boxShadow: `0 0 16px ${rankColor}44`,
        }}
        data-testid="rank-badge"
      >
        RANK {rank}
      </div>
    </div>
  );
}
