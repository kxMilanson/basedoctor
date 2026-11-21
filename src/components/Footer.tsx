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
    <footer className="border-t border-[#E8E4DC] bg-[#F3F0EA]/60 py-8 text-xs text-[#71717A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <BrandLogo variant="shield" size={24} />
          <span className="text-[#D6D1C7]">•</span>
          <span>© {new Date().getFullYear()} Diagnostyka dla sklepów e-commerce</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[#71717A] text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Tryb bezpieczny (tylko odczyt)</span>
          </span>
          <span className="text-[#D6D1C7]">•</span>
          <span>Bez zmian w Twoim sklepie</span>
          <span className="text-[#D6D1C7]">•</span>
          <span>Przejrzyste raporty PDF</span>
        </div>
      </div>
    </footer>
  );
}
