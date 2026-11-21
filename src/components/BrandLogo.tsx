"use client";

interface BrandLogoProps {
  variant?: "pulse" | "shield";
  size?: number;
  showWordmark?: boolean;
  theme?: "light" | "dark";
}

export function BrandLogo({
  variant = "shield",
  size = 32,
  showWordmark = true,
  theme = "light",
}: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {variant === "pulse" ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <rect width="128" height="128" rx="30" fill="#18181B" />
          <circle cx="64" cy="64" r="40" stroke="#0F766E" strokeOpacity="0.4" strokeWidth="5" />
          <circle
            cx="64"
            cy="64"
            r="28"
            stroke="#14B8A6"
            strokeOpacity="0.8"
            strokeWidth="5"
            strokeDasharray="132 44"
            strokeLinecap="round"
          />
          <path d="M64 64L91 37" stroke="#5EEAD4" strokeWidth="5" strokeLinecap="round" />
          <circle cx="91" cy="37" r="6" fill="#10B981" />
          <circle cx="64" cy="64" r="11" fill="#0F766E" />
          <circle cx="64" cy="64" r="5" fill="#FFFFFF" />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <rect width="128" height="128" rx="30" fill="#0F766E" />
          <path
            d="M64 24L98 37.5V62.5C98 83.2 83.4 100.8 64 106C44.6 100.8 30 83.2 30 62.5V37.5L64 24Z"
            fill="#18181B"
            fillOpacity="0.22"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <rect x="46" y="47" width="15" height="15" rx="3.5" fill="#FFFFFF" />
          <rect x="67" y="47" width="15" height="15" rx="3.5" fill="#5EEAD4" />
          <rect x="46" y="68" width="15" height="15" rx="3.5" fill="#FFFFFF" fillOpacity="0.72" />
          <rect x="67" y="68" width="15" height="15" rx="3.5" fill="#FFFFFF" />
        </svg>
      )}
      {showWordmark && (
        <span
          className={`text-base font-bold tracking-tight ${
            theme === "dark" ? "text-white" : "text-[#18181B]"
          }`}
        >
          Base<span className={theme === "dark" ? "text-[#2DD4BF]" : "text-[#0F766E]"}>Doctor</span>
        </span>
      )}
    </div>
  );
}
