"use client";

interface RadialHealthGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

export function RadialHealthGauge({
  score,
  size = 156,
  label = "Kondycja sklepu",
}: RadialHealthGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 80 ? "#10B981" : clamped >= 50 ? "#D97706" : "#E11D48";

  const trackColor = "#EAE6DF";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold tracking-tight text-[#18181B] tabular-nums leading-none">
          {clamped}
        </span>
        <span className="text-xs font-medium text-[#71717A] mt-1">
          na 100 pkt
        </span>
        {label && (
          <span className="text-[11px] font-semibold text-[#52525B] mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
