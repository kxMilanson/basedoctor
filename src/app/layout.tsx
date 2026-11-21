import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BaseDoctor | Audyt i Diagnostyka Sklepów Base.com",
  description:
    "Bezpieczna platforma diagnostyczna dla e-commerce integrująca się z Base.com (BaseLinker). Wykrywa błędy SKU/EAN, anomalie magazynowe i opóźnienia zamówień w trybie tylko do odczytu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={inter.variable}>
      <body className="font-sans antialiased text-zinc-950 bg-[#fafafa] min-h-screen flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
        <div>
          <Navbar />
          <main className="pb-16">{children}</main>
        </div>
        <footer className="border-t border-zinc-200/80 bg-white/70 py-6 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-800">BaseDoctor</span>
              <span className="text-zinc-300">•</span>
              <span>© {new Date().getFullYear()} Wszelkie prawa zastrzeżone</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Architektura Read-Only
              </span>
              <span>•</span>
              <span>Oficjalne API Base.com</span>
              <span>•</span>
              <span>Szyfrowanie AES-256-GCM</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
