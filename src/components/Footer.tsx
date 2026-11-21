"use client";

import { usePathname } from "next/navigation";

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
    <footer className="border-t border-[#E5E3DC] bg-[#FFFFFF] py-6 text-xs text-[#5C6168]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#111315]">BaseDoctor</span>
          <span className="text-[#CFCBC2]">•</span>
          <span>© {new Date().getFullYear()} Wszelkie prawa zastrzeżone</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[#868C94] text-[11px] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            Architektura Read-Only
          </span>
          <span>•</span>
          <span>Oficjalne API Base.com</span>
          <span>•</span>
          <span>Szyfrowanie AES-256-GCM</span>
        </div>
      </div>
    </footer>
  );
}
