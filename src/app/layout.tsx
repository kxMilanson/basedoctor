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
      <body className="font-sans antialiased text-[#111315] bg-[#F8F7F4] min-h-screen flex flex-col justify-between selection:bg-[#DBE4FF] selection:text-[#003099]">
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
