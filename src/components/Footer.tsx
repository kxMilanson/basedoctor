"use client";

import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  const pathname = usePathname();

  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/connections") ||
    pathname.startsWith("/scans") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.08] bg-[#090A0F] py-8 text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <BrandLogo variant="shield" size={24} theme="dark" />
          <span className="text-zinc-600">•</span>
          <span>© {new Date().getFullYear()} Diagnostyka i bezpieczna naprawa e-commerce</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Domyślnie tylko odczyt</span>
          </span>
          <span className="text-zinc-700">•</span>
          <span>Kopia przed każdą zmianą</span>
          <span className="text-zinc-700">•</span>
          <span>Raporty PDF & Korekty CSV</span>
        </div>
      </div>
    </footer>
  );
}
