import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BaseDoctor | Sprawdź kondycję swojego sklepu Base.com",
  description:
    "Przejrzysta diagnostyka dla właścicieli sklepów internetowych i sprzedawców Allegro. Wykryj błędy w produktach, magazynie i wysyłce bez ryzyka zmian w sklepie.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={inter.variable}>
      <body className="font-sans antialiased text-[#18181B] bg-[#FAF8F5] min-h-screen flex flex-col justify-between selection:bg-[#CCFBF1] selection:text-[#134E4A]">
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
