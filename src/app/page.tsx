"use client";

import { useState } from "react";
import Link from "next/link";
import { RadialHealthGauge } from "@/components/RadialHealthGauge";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  Lock,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Warehouse,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { DIAGNOSTIC_CAPABILITIES_DOC } from "@/lib/diagnostics/engine";

interface HeroDemoIssue {
  id: string;
  severity: "CRITICAL" | "WARNING";
  category: string;
  title: string;
  before: string;
  after: string;
  points: number;
  fixed: boolean;
}

const INITIAL_HERO_ISSUES: HeroDemoIssue[] = [
  {
    id: "h1",
    severity: "CRITICAL",
    category: "Magazyn",
    title: "Ujemny stan magazynowy — Słuchawki ANC",
    before: "-2 szt.",
    after: "0 szt.",
    points: 12,
    fixed: false,
  },
  {
    id: "h2",
    severity: "CRITICAL",
    category: "Produkty",
    title: "Zdublowany kod produktu SKU — Klawiatura Pro",
    before: "KLAW-PRO",
    after: "KLAW-PRO-V2",
    points: 10,
    fixed: false,
  },
  {
    id: "h3",
    severity: "WARNING",
    category: "Wysyłka",
    title: "Brak wagi brutto (dopłaty kurierskie) — Zegarek Smart",
    before: "0.00 kg",
    after: "0.45 kg",
    points: 6,
    fixed: false,
  },
];

export default function HomePage() {
  const [heroIssues, setHeroIssues] = useState<HeroDemoIssue[]>(INITIAL_HERO_ISSUES);
  const [activeTab, setActiveTab] = useState<"sku" | "orders" | "inventory" | "weight">("sku");

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    storeUrl: "",
    monthlyOrders: "500 - 2 000 zamówień",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactResult, setContactResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const heroScore =
    68 + heroIssues.reduce((acc, item) => (item.fixed ? acc + item.points : acc), 0);
  const fixedHeroItems = heroIssues.filter((i) => i.fixed);

  const toggleHeroFix = (id: string) => {
    setHeroIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, fixed: !item.fixed } : item))
    );
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactResult(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się wysłać formularza.");
      }
      setContactResult({
        type: "success",
        text:
          data.message ||
          "Dziękujemy! Otrzymaliśmy Twoje zgłoszenie i odezwiemy się w ciągu 24 godzin.",
      });
      setContactForm({
        name: "",
        email: "",
        storeUrl: "",
        monthlyOrders: "500 - 2 000 zamówień",
        message: "",
      });
    } catch (err: any) {
      setContactResult({ type: "error", text: err.message });
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="bg-obsidian-spotlight text-white min-h-screen">
      {/* 1. HERO SECTION + 3-PANEL INTERACTIVE COMMAND COCKPIT */}
      <section className="pt-16 pb-24 sm:pt-24 sm:pb-28 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Headline */}
          <div className="text-center space-y-7 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-zinc-200 text-xs sm:text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Audyt i bezpieczna naprawa błędów w Base.com i Allegro</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[66px] font-extrabold tracking-[-0.035em] leading-[1.04] bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Zapanuj nad błędami w sklepie.{" "}
              <span className="bg-gradient-to-r from-[#2DD4BF] to-[#10B981] bg-clip-text text-transparent">
                Bez ryzyka.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              BaseDoctor w 30 sekund wykrywa zdublowane SKU, ujemne stany i opóźnione wysyłki, a
              następnie pozwala naprawić je jednym kliknięciem z podglądem „Przed → Po” i kopią
              zapasową.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="btn-studio-brand px-8 py-4 text-base w-full sm:w-auto"
              >
                <span>Sprawdź swój sklep za darmo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl text-base font-semibold text-zinc-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] transition w-full sm:w-auto text-center"
              >
                Zobacz panel na żywo
              </Link>
            </div>
          </div>

          {/* 3-PANEL INTERACTIVE COMMAND COCKPIT */}
          <div className="rounded-3xl bg-[#0D0F16] border border-white/[0.1] p-4 sm:p-6 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            {/* Top Cockpit Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/[0.08] text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-2 text-zinc-300 font-medium">
                  BaseDoctor Command Cockpit — kliknij „Napraw”, aby przetestować na żywo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] font-semibold">
                  Połączenie Read-Only aktywne
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* LEFT RAIL: Store Telemetry & 3 Domains */}
              <div className="lg:col-span-3 space-y-4 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                    Monitorowany sklep
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Sklep Główny Base.com</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <div className="text-[11px] text-zinc-400">Produkty</div>
                    <div className="text-lg font-bold text-white tabular-nums">1 420</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <div className="text-[11px] text-zinc-400">Zamówienia</div>
                    <div className="text-lg font-bold text-white tabular-nums">3 890</div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/[0.07]">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                    Kondycja obszarów
                  </div>
                  {[
                    {
                      label: "Katalog i SKU",
                      val: heroIssues[1].fixed ? 96 : 64,
                      color: heroIssues[1].fixed ? "bg-[#10B981]" : "bg-[#F59E0B]",
                    },
                    {
                      label: "Magazyn WMS",
                      val: heroIssues[0].fixed ? 98 : 58,
                      color: heroIssues[0].fixed ? "bg-[#10B981]" : "bg-[#F43F5E]",
                    },
                    {
                      label: "Wysyłka i wagi",
                      val: heroIssues[2].fixed ? 100 : 78,
                      color: heroIssues[2].fixed ? "bg-[#10B981]" : "bg-[#F59E0B]",
                    },
                  ].map((dom) => (
                    <div key={dom.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-300">{dom.label}</span>
                        <span className="font-semibold text-white tabular-nums">{dom.val}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${dom.color}`}
                          style={{ width: `${dom.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CENTER PANEL: Interactive Issue & Diff Stream */}
              <div className="lg:col-span-6 space-y-3">
                {heroIssues.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      item.fixed
                        ? "bg-[#10B981]/[0.08] border-[#10B981]/30"
                        : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.16]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.fixed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Naprawiono (+{item.points} pkt)
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              item.severity === "CRITICAL"
                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {item.severity === "CRITICAL" ? "Pilne" : "Warto poprawić"}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">{item.category}</span>
                      </div>

                      <div className="text-sm sm:text-base font-semibold text-white">
                        {item.title}
                      </div>

                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-xs">
                        <span className="text-rose-400 line-through">{item.before}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="text-[#2DD4BF] font-semibold">{item.after}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleHeroFix(item.id)}
                      className={
                        item.fixed
                          ? "px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 border border-white/[0.12] transition inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                          : "btn-studio-brand py-2.5 px-4 text-xs shrink-0 cursor-pointer"
                      }
                    >
                      {item.fixed ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Cofnij</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Napraw 1 kliknięciem</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* RIGHT PANEL: Dark Radial Gauge + Snapshot Log */}
              <div className="lg:col-span-3 space-y-4 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex flex-col items-center text-center pt-1">
                  <RadialHealthGauge score={heroScore} size={146} theme="dark" />
                </div>

                <div className="space-y-2 pt-3 border-t border-white/[0.07]">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                    Dziennik Snapshotów
                  </div>
                  {fixedHeroItems.length === 0 ? (
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Kliknij „Napraw 1 kliknięciem”, aby zobaczyć zapis kopii zapasowej.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {fixedHeroItems.map((snap) => (
                        <div
                          key={snap.id}
                          className="p-2 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[11px] text-zinc-200 flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{snap.category}: {snap.after}</span>
                          <span className="text-[#34D399] font-mono shrink-0">Zapisano</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 12-COLUMN ASYMMETRIC BENTO GRID */}
      <section id="bento-funkcje" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="text-sm font-semibold text-[#2DD4BF]">
            Dlaczego sklepy wybierają BaseDoctor
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Zaprojektowane dla wyniku sprzedaży, nie dla wykresów.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bento Card 1 (7 Cols): SKU & Allegro Guard */}
          <div className="lg:col-span-7 bento-dark-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/25 border border-[#14B8A6]/30 text-[#2DD4BF] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Koniec z pomyłkami SKU i blokadami aukcji
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                Wykrywamy brakujące i zdublowane kody SKU oraz błędne kody EAN, zanim marketplace
                odrzuci ofertę albo magazyn spakuje zły wariant.
              </p>
            </div>

            {/* Embedded Micro-UI */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Wykryta kolizja w katalogu:</span>
                <span className="text-rose-400">2 produkty z tym samym SKU</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-zinc-200">
                  ID 1042 • <span className="text-[#2DD4BF]">KLAW-RGB-CZARNA</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-zinc-200">
                  ID 1089 • <span className="text-[#2DD4BF]">KLAW-RGB-BIALA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2 (5 Cols): Safe Fix + Rollback */}
          <div className="lg:col-span-5 bento-dark-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/25 border border-[#14B8A6]/30 text-[#2DD4BF] flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Podgląd „Przed → Po” i cofanie
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Każda poprawka przechodzi przez ekran zatwierdzenia i zapisuje kopię poprzedniej
                wartości. Cofasz zmianę jednym kliknięciem.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between text-xs">
              <div>
                <div className="text-zinc-400">Stan magazynowy</div>
                <div className="font-mono font-bold text-white mt-0.5">
                  <span className="text-rose-400 line-through mr-2">-2 szt.</span>
                  <span className="text-[#34D399]">0 szt.</span>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-zinc-200 font-semibold">
                Cofnij ↺
              </span>
            </div>
          </div>

          {/* Bento Card 3 (5 Cols): Courier Weight Surcharge Guard */}
          <div className="lg:col-span-5 bento-dark-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Ochrona przed dopłatami kurierskimi
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Wyłapujemy produkty o wadze 0,00 kg oraz wysłane paczki bez zapisanego listu
                przewozowego.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-zinc-300">Produkty bez wagi brutto</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                Wykryto i gotowe do poprawy
              </span>
            </div>
          </div>

          {/* Bento Card 4 (7 Cols): Read-Only Trust Architecture */}
          <div className="lg:col-span-7 bento-dark-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/30 text-[#34D399] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Architektura 2-etapowa: najpierw podgląd, potem decyzja
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                Podczas samego audytu BaseDoctor nie posiada uprawnień do edycji Twojego sklepu.
                Wszelkie poprawki wykonujesz świadomie po obejrzeniu podglądu zmian i możesz
                pobrać je również jako plik korekty CSV.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="text-[#34D399] font-bold">1. Skan</div>
                <div className="text-zinc-400 mt-0.5">Tylko odczyt</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="text-[#2DD4BF] font-bold">2. Podgląd</div>
                <div className="text-zinc-400 mt-0.5">Przed → Po</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="text-white font-bold">3. Eksport</div>
                <div className="text-zinc-400 mt-0.5">PDF & CSV</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PROBLEM EXPLORER */}
      <section id="co-sprawdzamy" className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-sm font-semibold text-[#2DD4BF]">Przykłady wykrywanych błędów</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Jasny plan działania dla każdej usterki
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/[0.04] rounded-2xl max-w-3xl mx-auto border border-white/[0.08]">
          {[
            { id: "sku", label: "Pomyłki w produktach (SKU)" },
            { id: "orders", label: "Paczki bez numeru śledzenia" },
            { id: "inventory", label: "Sprzedaż brakującego towaru" },
            { id: "weight", label: "Dopłaty kurierskie za wagę" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-[#090A0F] font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bento-dark-card p-6 sm:p-9 space-y-5">
          {activeTab === "sku" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Pilne — blokuje sprzedaż
                </span>
                <span className="text-sm text-zinc-400">
                  Szacowany czas naprawy: <strong className="text-white">ok. 10 minut</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Ten sam kod produktu (SKU) przypisany do dwóch różnych towarów
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla sprzedaży?</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Magazyn może wysłać niewłaściwy wariant produktu, a stany na Allegro mogą się błędnie synchronizować.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-[#0F766E]/15 border border-[#14B8A6]/30 space-y-1.5">
                  <div className="text-sm font-semibold text-[#5EEAD4] flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    Rozdziel kod w Asystencie Napraw jednym kliknięciem i sprawdź powiązania na swoich aukcjach.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Pilne — ryzyko utraty oceny
                </span>
                <span className="text-sm text-zinc-400">
                  Szacowany czas naprawy: <strong className="text-white">ok. 5 minut</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Zamówienie oznaczone jako wysłane nie ma numeru przesyłki
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla sprzedaży?</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Klient nie otrzymuje linku do śledzenia paczki, a Allegro może obniżyć Twój wskaźnik jakości sprzedaży.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-[#0F766E]/15 border border-[#14B8A6]/30 space-y-1.5">
                  <div className="text-sm font-semibold text-[#5EEAD4] flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    Uzupełnij numer nadania w zamówieniu lub zweryfikuj generowanie etykiet kurierskich.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "inventory" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Pilne — sprzedaż na minusie
                </span>
                <span className="text-sm text-zinc-400">
                  Szacowany czas naprawy: <strong className="text-white">ok. 15 minut</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Ujemny stan magazynowy (-2 szt.) w produkcie „Słuchawki Bezprzewodowe”
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla sprzedaży?</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Klienci kupują towar, którego nie możesz wysłać na czas. Grozi to anulacjami i negatywnymi ocenami.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-[#0F766E]/15 border border-[#14B8A6]/30 space-y-1.5">
                  <div className="text-sm font-semibold text-[#5EEAD4] flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    Wyzeruj ujemny stan w BaseDoctor jednym kliknięciem i włącz automatyczne zamykanie pustych ofert.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "weight" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Warto poprawić
                </span>
                <span className="text-sm text-zinc-400">
                  Szacowany czas naprawy: <strong className="text-white">ok. 5 minut</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Brak wpisanej wagi produktu (0,00 kg)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla sprzedaży?</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Błędny dobór gabarytu paczki w InPost/DPD/DHL i kosztowne dopłaty weryfikacyjne na sortowni.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-[#0F766E]/15 border border-[#14B8A6]/30 space-y-1.5">
                  <div className="text-sm font-semibold text-[#5EEAD4] flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    Wpisz wagę brutto z opakowaniem w oknie szybkiej naprawy BaseDoctor.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. SCOPE & CONTACT SECTION */}
      <section id="jak-to-dziala" className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-dark-card p-7 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <span>Obszary objęte sprawdzeniem</span>
            </h3>
            <div className="space-y-3.5 text-sm">
              {DIAGNOSTIC_CAPABILITIES_DOC.supportedChecks.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-zinc-100">{group.category}</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    {group.checks.map((chk, cIdx) => (
                      <li key={cIdx}>{chk}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-dark-card p-7 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Czego nie sprawdzamy (uczciwa informacja)</span>
            </h3>
            <div className="space-y-3.5 text-sm">
              {DIAGNOSTIC_CAPABILITIES_DOC.unsupportedChecks.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="font-semibold text-zinc-100">{item.area}</div>
                  <div className="text-zinc-400 mt-1 leading-relaxed">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Consultation Form */}
        <div id="kontakt" className="max-w-2xl mx-auto bento-dark-card p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-sm font-semibold text-[#2DD4BF]">Masz pytania?</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Poproś o bezpłatną konsultację w sprawie Twojego sklepu
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Zostaw kontakt, jeśli chcesz omówić wyniki swojego sklepu lub sprawdzić, jak uporządkować bazę produktów.
            </p>
          </div>

          {contactResult && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center gap-2.5 ${
                contactResult.type === "success"
                  ? "bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399]"
                  : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
              }`}
            >
              {contactResult.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{contactResult.text}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Imię i nazwisko lub nazwa sklepu *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="np. Jan Kowalski"
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Adres e-mail *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="jan@twojsklep.pl"
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Adres sklepu (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={contactForm.storeUrl}
                  onChange={(e) => setContactForm({ ...contactForm, storeUrl: e.target.value })}
                  placeholder="np. twojsklep.pl"
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Liczba zamówień w miesiącu
                </label>
                <select
                  value={contactForm.monthlyOrders}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, monthlyOrders: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.12] text-sm text-white focus:outline-none focus:border-[#2DD4BF] bg-[#161925] transition"
                >
                  <option value="Poniżej 500 zamówień">Poniżej 500 zamówień/mc</option>
                  <option value="500 - 2 000 zamówień">500 – 2 000 zamówień/mc</option>
                  <option value="2 000 - 10 000 zamówień">2 000 – 10 000 zamówień/mc</option>
                  <option value="Powyżej 10 000 zamówień">Powyżej 10 000 zamówień/mc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                W czym możemy pomóc? (opcjonalnie)
              </label>
              <textarea
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="np. Chcemy sprawdzić, dlaczego mamy dopłaty za wagę paczek albo skąd biorą się braki na magazynie."
                className="w-full px-4 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
              />
            </div>

            <button
              type="submit"
              disabled={contactSubmitting}
              className="btn-studio-brand w-full py-3.5 text-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{contactSubmitting ? "Wysyłanie..." : "Wyślij prośbę o kontakt"}</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
