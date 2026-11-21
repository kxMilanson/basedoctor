"use client";

import { useState } from "react";
import Link from "next/link";
import { RadialHealthGauge } from "@/components/RadialHealthGauge";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { DIAGNOSTIC_CAPABILITIES_DOC } from "@/lib/diagnostics/engine";

interface HeroDemoIssue {
  id: string;
  severity: "CRITICAL" | "WARNING";
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
    title: "Ujemny stan magazynowy (-2 szt.) — Słuchawki ANC",
    before: "-2 szt.",
    after: "0 szt.",
    points: 12,
    fixed: false,
  },
  {
    id: "h2",
    severity: "CRITICAL",
    title: "Zdublowany kod produktu SKU — Klawiatura Pro",
    before: "KLAW-PRO",
    after: "KLAW-PRO-V2",
    points: 10,
    fixed: false,
  },
  {
    id: "h3",
    severity: "WARNING",
    title: "Brak wagi brutto (0.00 kg) — Zegarek Smart",
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
    <div className="text-[#18181B]">
      {/* 1. HERO SECTION WITH ARCHITECTURAL DOT GRID & LIVE INTERACTIVE SIMULATOR */}
      <section className="bg-studio-grid border-b border-[#E8E4DC] pt-14 pb-20 sm:pt-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-7 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#E8E4DC] text-[#3F3F46] text-xs sm:text-sm font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Diagnostyka i naprawa błędów dla sklepów Base.com i Allegro</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-extrabold text-[#18181B] tracking-[-0.035em] leading-[1.06]">
              Wykryj błędy w sklepie i napraw je{" "}
              <span className="text-[#0F766E]">jednym kliknięciem</span>.
            </h1>

            <p className="text-base sm:text-xl text-[#52525B] leading-relaxed max-w-2xl mx-auto">
              BaseDoctor w 30 sekund sprawdza Twoje produkty, stany magazynowe oraz zamówienia.
              Pokazuje prostym językiem, gdzie tracisz pieniądze i pozwala bezpiecznie poprawić
              problemy z podglądem przed zapisem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/register"
                className="btn-studio-brand px-7 py-3.5 text-base w-full sm:w-auto"
              >
                <span>Sprawdź swój sklep za darmo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="btn-studio-secondary px-7 py-3.5 text-base w-full sm:w-auto"
              >
                <span>Zobacz panel na żywo</span>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-sm text-[#52525B] font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Domyślnie bezpieczny podgląd (tylko odczyt)
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Podgląd „Przed → Po” przed każdą zmianą
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Możliwość cofnięcia 1 kliknięciem
              </span>
            </div>
          </div>

          {/* FRAMED INTERACTIVE APP SHOWCASE */}
          <div className="rounded-3xl bg-[#12151C] p-3 sm:p-5 shadow-modal border border-white/10">
            {/* Browser Chrome Bar */}
            <div className="flex items-center justify-between px-3 pb-3.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-3 font-medium text-zinc-300 hidden sm:inline">
                  Interaktywny podgląd BaseDoctor — kliknij „Napraw”, aby przetestować
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 text-[11px] font-medium">
                Symulator na żywo
              </span>
            </div>

            {/* Inner Warm Studio Workspace */}
            <div className="rounded-2xl bg-[#FAF8F5] p-5 sm:p-8 text-[#18181B]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Radial Health Gauge */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E8E4DC] p-6 flex flex-col items-center text-center space-y-3 shadow-xs">
                  <RadialHealthGauge score={heroScore} size={156} label="Kondycja sklepu" />
                  <div className="space-y-1">
                    <span
                      className={
                        heroScore >= 80
                          ? "pill-healthy"
                          : heroScore >= 50
                          ? "pill-warning"
                          : "pill-urgent"
                      }
                    >
                      {heroScore >= 80
                        ? "Sklep w dobrej kondycji"
                        : "Wymaga uporządkowania"}
                    </span>
                    <p className="text-xs text-[#71717A] pt-1">
                      Klikaj przyciski obok i zobacz, jak rośnie kondycja Twojego sklepu.
                    </p>
                  </div>
                </div>

                {/* Right: 3 Interactive Fixable Issues */}
                <div className="lg:col-span-8 space-y-3">
                  {heroIssues.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        item.fixed
                          ? "bg-[#ECFDF5]/60 border-[#A7F3D0]"
                          : "bg-white border-[#E8E4DC] shadow-xs"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.fixed ? (
                            <span className="pill-healthy">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Naprawiono (+{item.points} pkt)
                            </span>
                          ) : (
                            <span
                              className={
                                item.severity === "CRITICAL"
                                  ? "pill-urgent"
                                  : "pill-warning"
                              }
                            >
                              {item.severity === "CRITICAL" ? "Pilne" : "Warto poprawić"}
                            </span>
                          )}
                          <span className="text-xs text-[#71717A] font-medium">
                            {item.before} →{" "}
                            <strong className="text-[#0F766E]">{item.after}</strong>
                          </span>
                        </div>
                        <div className="text-sm sm:text-base font-semibold text-[#18181B]">
                          {item.title}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleHeroFix(item.id)}
                        className={
                          item.fixed
                            ? "btn-studio-secondary py-2 px-4 text-xs shrink-0 cursor-pointer"
                            : "btn-studio-brand py-2 px-4 text-xs shrink-0 cursor-pointer"
                        }
                      >
                        {item.fixed ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Cofnij zmianę</span>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-24 py-20">
        {/* 2. DARK BENTO SECTION: 2 MODES OF WORK */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#14171F] text-white rounded-3xl p-8 sm:p-12 space-y-10 shadow-modal">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#5EEAD4] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bezpieczna architektura 2-etapowa</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Najpierw bezpieczny audyt. Naprawa tylko wtedy, gdy ją zatwierdzisz.
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Wiemy, że boisz się automatów, które same zmieniają ceny lub stany. Dlatego
                BaseDoctor oddziela przeglądanie sklepu od wprowadzania poprawek.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E]/30 border border-[#14B8A6]/40 text-[#5EEAD4] flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-base font-bold text-white">
                  Tryb podglądu (Domyślny)
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Podczas skanowania BaseDoctor niczego nie edytuje. Wyłącznie czyta katalog i
                  zamówienia, żeby pokazać pełny obraz kondycji sklepu.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E]/30 border border-[#14B8A6]/40 text-[#5EEAD4] flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-base font-bold text-white">
                  Podgląd „Przed → Po”
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Przy wybranych błędach klikasz „Napraw”, widzisz dokładną zmianę przed
                  zapisaniem i samodzielnie ją zatwierdzasz.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E]/30 border border-[#14B8A6]/40 text-[#5EEAD4] flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-base font-bold text-white">
                  Kopia zapasowa i „Cofnij”
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Każda wykonana poprawka zapisuje poprzednią wartość. Jeśli zmienisz zdanie,
                  cofasz zmianę jednym kliknięciem lub pobierasz plik korekty CSV.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE PROBLEM EXPLORER */}
        <section id="co-sprawdzamy" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-sm font-semibold text-[#0F766E]">Co sprawdzamy w sklepie</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#18181B]">
              Konkretne odpowiedzi zamiast technicznych tabel
            </h2>
            <p className="text-sm sm:text-base text-[#52525B]">
              Wybierz jeden z typowych problemów, aby zobaczyć, jak BaseDoctor tłumaczy go na zrozumiały plan działania.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#F3F0EA] rounded-2xl max-w-3xl mx-auto border border-[#E8E4DC]">
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
                    ? "bg-white text-[#18181B] shadow-xs font-semibold"
                    : "text-[#52525B] hover:text-[#18181B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="studio-card p-6 sm:p-9 space-y-5">
            {activeTab === "sku" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                  <span className="pill-urgent">Pilne — blokuje sprzedaż</span>
                  <span className="text-sm text-[#52525B] font-medium">
                    Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 10 minut</strong>
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#18181B]">
                    Ten sam kod produktu (SKU) przypisany do dwóch różnych towarów
                  </h3>
                  <p className="text-sm text-[#52525B] mt-1.5">
                    Dwa produkty w Twoim katalogu mają identyczny kod{" "}
                    <code className="font-mono bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4DC]">
                      KLAWIATURA-RGB-PRO
                    </code>
                    .
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                    <div className="text-sm font-semibold text-[#B45309] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Co to oznacza dla Twojej sprzedaży?</span>
                    </div>
                    <p className="text-sm text-[#3F3F46] leading-relaxed">
                      Magazyn może wysłać niewłaściwy kolor lub wariant produktu, a stany na Allegro mogą błędnie spadać lub wznawiać oferty, których nie masz.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                    <div className="text-sm font-semibold text-[#0F766E] flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Co należy zrobić?</span>
                    </div>
                    <p className="text-sm text-[#134E4A] leading-relaxed">
                      Nadaj jednemu z produktów unikalny kod w Asystencie Napraw (np. dopisz końcówkę wariantu) i sprawdź powiązania na aukcjach.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "orders" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                  <span className="pill-urgent">Pilne — ryzyko utraty oceny</span>
                  <span className="text-sm text-[#52525B] font-medium">
                    Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 5 minut</strong>
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#18181B]">
                    Zamówienie oznaczone jako wysłane nie ma numeru przesyłki
                  </h3>
                  <p className="text-sm text-[#52525B] mt-1.5">
                    Zamówienie #88241 ma status „Wysłane”, ale nie ma przypisanego numeru listu przewozowego.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                    <div className="text-sm font-semibold text-[#B45309] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Co to oznacza dla Twojej sprzedaży?</span>
                    </div>
                    <p className="text-sm text-[#3F3F46] leading-relaxed">
                      Klient nie widzi linku do śledzenia paczki, a Allegro może obniżyć Twój wskaźnik jakości sprzedaży i odebrać odznakę Super Sprzedawcy.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                    <div className="text-sm font-semibold text-[#0F766E] flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Co należy zrobić?</span>
                    </div>
                    <p className="text-sm text-[#134E4A] leading-relaxed">
                      Wpisz numer nadania w zamówieniu albo sprawdź, dlaczego etykieta kurierska nie zapisała numeru przesyłki.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "inventory" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                  <span className="pill-urgent">Pilne — sprzedaż towaru na minusie</span>
                  <span className="text-sm text-[#52525B] font-medium">
                    Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 15 minut</strong>
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#18181B]">
                    Ujemny stan magazynowy (-2 szt.) w produkcie „Słuchawki Bezprzewodowe”
                  </h3>
                  <p className="text-sm text-[#52525B] mt-1.5">
                    System odnotował sprzedaż towaru, mimo że stan na półce był już wyzerowany.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                    <div className="text-sm font-semibold text-[#B45309] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Co to oznacza dla Twojej sprzedaży?</span>
                    </div>
                    <p className="text-sm text-[#3F3F46] leading-relaxed">
                      Klienci kupują towar, którego nie możesz wysłać od razu. Grozi to anulacjami zamówień, sporami i negatywnymi komentarzami.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                    <div className="text-sm font-semibold text-[#0F766E] flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Co należy zrobić?</span>
                    </div>
                    <p className="text-sm text-[#134E4A] leading-relaxed">
                      Wyzeruj ujemny stan na 0 szt. jednym kliknięciem w BaseDoctor i włącz zamykanie ofert przy stanie zero.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "weight" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                  <span className="pill-warning">Warto poprawić</span>
                  <span className="text-sm text-[#52525B] font-medium">
                    Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 5 minut</strong>
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#18181B]">
                    Brak wpisanej wagi produktu (0,00 kg)
                  </h3>
                  <p className="text-sm text-[#52525B] mt-1.5">
                    Karta katalogowa produktu nie zawiera wagi brutto potrzebnej do poprawnego nadawania paczek.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                    <div className="text-sm font-semibold text-[#B45309] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Co to oznacza dla Twojej sprzedaży?</span>
                    </div>
                    <p className="text-sm text-[#3F3F46] leading-relaxed">
                      Programy kurierskie mogą dobierać zły gabaryt lub zaniżoną wagę na etykiecie, co prowadzi do kosztownych dopłat weryfikacyjnych od przewoźnika.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                    <div className="text-sm font-semibold text-[#0F766E] flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Co należy zrobić?</span>
                    </div>
                    <p className="text-sm text-[#134E4A] leading-relaxed">
                      Wpisz przybliżoną wagę produktu wraz z kartonem w oknie szybkiej naprawy BaseDoctor.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 4. WHO IT'S FOR */}
        <section id="dla-kogo" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-sm font-semibold text-[#0F766E]">Dla kogo</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#18181B]">
              Stworzony dla ludzi prowadzących handel, nie dla informatyków
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="studio-card p-7 space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#18181B]">
                Właściciele sklepów internetowych
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Zyskujesz pewność, że w Twoim katalogu nie ma błędnych cen, brakujących zdjęć ani zamówień wysłanych bez płatności.
              </p>
            </div>

            <div className="studio-card p-7 space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#18181B]">
                Sprzedawcy na Allegro i marketplace
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Chronisz jakość sprzedaży przed brakiem numerów nadania, błędnymi kodami EAN oraz sprzedażą towarów, które zniknęły z magazynu.
              </p>
            </div>

            <div className="studio-card p-7 space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#18181B]">
                Zespoły obsługujące zamówienia
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Natychmiast wyłapujesz paczki utknięte w realizacji od ponad 7 lub 14 dni oraz produkty bez wagi, zanim trafią na sortownię kuriera.
              </p>
            </div>
          </div>
        </section>

        {/* 5. TRANSPARENT SCOPE */}
        <section id="jak-to-dziala" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
              Co dokładnie sprawdzamy, a czego nie ruszamy
            </h2>
            <p className="text-sm sm:text-base text-[#52525B]">
              Jasne zasady bez ukrytych ograniczeń
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="studio-card p-7 space-y-4">
              <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <span>Obszary objęte sprawdzeniem</span>
              </h3>
              <div className="space-y-3.5 text-sm">
                {DIAGNOSTIC_CAPABILITIES_DOC.supportedChecks.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-semibold text-[#18181B]">{group.category}</div>
                    <ul className="list-disc list-inside space-y-1 text-[#52525B]">
                      {group.checks.map((chk, cIdx) => (
                        <li key={cIdx}>{chk}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="studio-card p-7 space-y-4">
              <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                <span>Czego nie sprawdzamy (uczciwa informacja)</span>
              </h3>
              <div className="space-y-3.5 text-sm">
                {DIAGNOSTIC_CAPABILITIES_DOC.unsupportedChecks.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                    <div className="font-semibold text-[#18181B]">{item.area}</div>
                    <div className="text-[#52525B] mt-1 leading-relaxed">{item.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. CONTACT / CONSULTATION FORM */}
        <section id="kontakt" className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="studio-card p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-sm font-semibold text-[#0F766E]">Masz pytania?</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
                Poproś o bezpłatną konsultację w sprawie Twojego sklepu
              </h2>
              <p className="text-sm text-[#52525B] max-w-md mx-auto">
                Zostaw kontakt, jeśli chcesz omówić wyniki swojego sklepu lub sprawdzić, jak uporządkować bazę produktów.
              </p>
            </div>

            {contactResult && (
              <div
                className={`p-4 rounded-xl text-sm flex items-center gap-2.5 ${
                  contactResult.type === "success"
                    ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]"
                    : "bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C]"
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
                  <label className="block text-xs font-semibold text-[#3F3F46] mb-1.5">
                    Imię i nazwisko lub nazwa sklepu *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="np. Jan Kowalski"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E4DC] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3F3F46] mb-1.5">
                    Adres e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="jan@twojsklep.pl"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E4DC] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3F3F46] mb-1.5">
                    Adres sklepu (opcjonalnie)
                  </label>
                  <input
                    type="text"
                    value={contactForm.storeUrl}
                    onChange={(e) => setContactForm({ ...contactForm, storeUrl: e.target.value })}
                    placeholder="np. twojsklep.pl"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E4DC] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3F3F46] mb-1.5">
                    Liczba zamówień w miesiącu
                  </label>
                  <select
                    value={contactForm.monthlyOrders}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, monthlyOrders: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E4DC] text-sm text-[#18181B] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                  >
                    <option value="Poniżej 500 zamówień">Poniżej 500 zamówień/mc</option>
                    <option value="500 - 2 000 zamówień">500 – 2 000 zamówień/mc</option>
                    <option value="2 000 - 10 000 zamówień">2 000 – 10 000 zamówień/mc</option>
                    <option value="Powyżej 10 000 zamówień">Powyżej 10 000 zamówień/mc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3F3F46] mb-1.5">
                  W czym możemy pomóc? (opcjonalnie)
                </label>
                <textarea
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="np. Chcemy sprawdzić, dlaczego mamy dopłaty za wagę paczek albo skąd biorą się braki na magazynie."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E4DC] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
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
    </div>
  );
}
