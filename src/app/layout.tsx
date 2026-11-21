import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

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
    <html lang="pl">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <Navbar />
            <main>{children}</main>
          </div>
          <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div>
                © {new Date().getFullYear()} BaseDoctor SaaS. Wszelkie prawa zastrzeżone.
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Tryb połączenia: Tylko do odczytu (Read-Only)</span>
                <span>•</span>
                <span>Oficjalne API Base.com</span>
                <span>•</span>
                <span>Szyfrowanie AES-256-GCM</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
