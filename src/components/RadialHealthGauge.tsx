"use client";

interface RadialHealthGaugeProps {
  score: number;
  size?: number;
  label?: string;
  theme?: "light" | "dark";
}

export function RadialHealthGauge({
  score,
  size = 156,
  label = "Kondycja sklepu",
  theme = "light",
}: RadialHealthGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 80 ? "#10B981" : clamped >= 50 ? "#F59E0B" : "#F43F5E";

  const trackColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "#EAE6DF";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
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
        <span
          className={`text-4xl font-extrabold tracking-tight tabular-nums leading-none ${
            theme === "dark" ? "text-white" : "text-[#18181B]"
          }`}
        >
          {clamped}
        </span>
        <span
          className={`text-xs font-medium mt-1 ${
            theme === "dark" ? "text-zinc-400" : "text-[#71717A]"
          }`}
        >
          na 100 pkt
        </span>
        {label && (
          <span
            className={`text-[11px] font-semibold mt-0.5 ${
              theme === "dark" ? "text-zinc-300" : "text-[#52525B]"
            }`}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
