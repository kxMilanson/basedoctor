"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  FileCheck,
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
  Users,
  Briefcase,
  AlertOctagon,
  ChevronRight,
  Send,
  Building,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { DIAGNOSTIC_CAPABILITIES_DOC } from "@/lib/diagnostics/engine";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"sku" | "orders" | "inventory" | "weight">("sku");

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    storeUrl: "",
    monthlyOrders: "500 - 2 000 zamówień",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactResult, setContactResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        throw new Error(data.error || "Błąd wysyłania formularza.");
      }
      setContactResult({
        type: "success",
        text: data.message || "Dziękujemy! Twój wniosek o audyt wstępny został pomyślnie przyjęty.",
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
    <div className="space-y-24 py-10 sm:py-20 text-[#111315]">
      {/* 1. Hero Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E5E3DC] text-[#373B40] text-[11px] font-mono tracking-tight shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse"></span>
          <span>BaseDoctor 2.0 • Oficjalne API Base.com (BaseLinker)</span>
          <span className="text-[#CFCBC2]">|</span>
          <span className="text-[#046C4E] font-semibold">100% Read-Only</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-[#111315] tracking-tight leading-[1.1]">
          Zdiagnozuj usterki w swoim sklepie zanim przyniosą{" "}
          <span className="text-[#0052FF]">straty finansowe</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#5C6168] leading-relaxed font-normal">
          Automatyczny, 30-sekundowy audyt integralności bazy danych dla sprzedawców e-commerce.
          Wykrywaj zdublowane kody SKU, ujemne stany i zablokowane zamówienia z wyceną ryzyka i gotowym planem naprawczym.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="btn-primary-cobalt px-6 py-3 text-xs"
          >
            <span>Rozpocznij darmowy audyt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/login"
            className="btn-secondary-surface px-6 py-3 text-xs"
          >
            Logowanie do panelu
          </Link>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-[#5C6168] font-medium font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Skan w 30 sekund
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Zero modyfikacji danych
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Raporty PDF do pobrania
          </span>
        </div>
      </section>

      {/* 2. Interactive Diagnostic Report Preview */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="pci-eyebrow text-[#0052FF]">
            Podgląd Działania Silnika
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111315]">
            Przejrzyste usterki zamiast technicznego żargonu
          </h2>
          <p className="text-xs text-[#5C6168]">
            Każda wykryta nieprawidłowość zawiera oszacowany wpływ biznesowy, zalecaną korektę oraz czas naprawy.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-[#F4F2ED] rounded-md max-w-2xl mx-auto border border-[#E5E3DC]">
          <button
            onClick={() => setActiveTab("sku")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === "sku"
                ? "bg-[#FFFFFF] text-[#111315] shadow-xs font-semibold"
                : "text-[#5C6168] hover:text-[#111315]"
            }`}
          >
            Zdublowany SKU
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#FFFFFF] text-[#111315] shadow-xs font-semibold"
                : "text-[#5C6168] hover:text-[#111315]"
            }`}
          >
            Brak Listu Przewozowego
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === "inventory"
                ? "bg-[#FFFFFF] text-[#111315] shadow-xs font-semibold"
                : "text-[#5C6168] hover:text-[#111315]"
            }`}
          >
            Ujemny Stan Magazynowy
          </button>
          <button
            onClick={() => setActiveTab("weight")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === "weight"
                ? "bg-[#FFFFFF] text-[#111315] shadow-xs font-semibold"
                : "text-[#5C6168] hover:text-[#111315]"
            }`}
          >
            Brak Wagi Produktu
          </button>
        </div>

        {/* Issue Card Preview */}
        <div className="pci-card p-6 sm:p-8 space-y-5">
          {activeTab === "sku" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-critical">KRYTYCZNY</span>
                  <span className="font-mono text-xs font-semibold text-[#868C94]">PROD_DUPLICATE_SKU</span>
                </div>
                <div className="text-xs text-[#5C6168] font-mono">
                  Czas naprawy: <strong className="text-[#111315] font-semibold">~10 minut</strong>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111315]">
                  Wykryto zdublowany identyfikator SKU: "KLAWIATURA-RGB-PRO"
                </h3>
                <p className="text-xs text-[#5C6168] mt-1">
                  Ten sam kod SKU został przypisany do 2 różnych rekordów w katalogu Base.com (ID: 1042 oraz ID: 1089).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#B45309]">
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                    Konsekwencje Biznesowe:
                  </div>
                  <p className="text-[#5C6168] leading-relaxed text-[11px]">
                    Wysokie ryzyko wysyłki niewłaściwego wariantu towaru, rozbieżności w synchronizacji stanów na Allegro i Amazon oraz chaos w inwentaryzacji.
                  </p>
                </div>

                <div className="p-4 rounded-md bg-[#EDF2FF] border border-[#C7D7FE] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#0040CC]">
                    <Check className="w-4 h-4 text-[#0052FF] shrink-0" />
                    Rekomendowane Rozwiązanie:
                  </div>
                  <p className="text-[#373B40] leading-relaxed text-[11px]">
                    Zmień SKU jednego z produktów na unikalny (np. dodaj sufiks wariantu kolorystycznego) i zaktualizuj powiązania w ofertach marketplace.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-critical">KRYTYCZNY</span>
                  <span className="font-mono text-xs font-semibold text-[#868C94]">ORD_MISSING_TRACKING</span>
                </div>
                <div className="text-xs text-[#5C6168] font-mono">
                  Czas naprawy: <strong className="text-[#111315] font-semibold">~5 minut</strong>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111315]">
                  Wysłane zamówienie #88241 bez zapisanego numeru listu przewozowego
                </h3>
                <p className="text-xs text-[#5C6168] mt-1">
                  Zamówienie posiada status "Wysłane", lecz w BaseLinkerze nie zarejestrowano numeru paczki ani etykiety kurierskiej.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#B45309]">
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                    Konsekwencje Biznesowe:
                  </div>
                  <p className="text-[#5C6168] leading-relaxed text-[11px]">
                    Kupujący nie otrzymuje linku do śledzenia przesyłki. Allegro obniża wskaźnik jakości sprzedaży "Terminowa wysyłka i numer przesyłki w terminie", co grozi utratą statusu Super Sprzedawcy.
                  </p>
                </div>

                <div className="p-4 rounded-md bg-[#EDF2FF] border border-[#C7D7FE] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#0040CC]">
                    <Check className="w-4 h-4 text-[#0052FF] shrink-0" />
                    Rekomendowane Rozwiązanie:
                  </div>
                  <p className="text-[#373B40] leading-relaxed text-[11px]">
                    Uzupełnij numer nadania w zamówieniu lub sprawdź integrację kurierską, która nie przekazała numeru listu po wygenerowaniu etykiety.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-critical">KRYTYCZNY</span>
                  <span className="font-mono text-xs font-semibold text-[#868C94]">INV_NEGATIVE_STOCK</span>
                </div>
                <div className="text-xs text-[#5C6168] font-mono">
                  Czas naprawy: <strong className="text-[#111315] font-semibold">~15 minut</strong>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111315]">
                  Ujemny stan magazynowy (-2 szt.) dla produktu "Słuchawki Bezprzewodowe ANC"
                </h3>
                <p className="text-xs text-[#5C6168] mt-1">
                  Stan w magazynie głównym wynosi -2 szt. Towar został sprzedany mimo braku fizycznego zapasu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#B45309]">
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                    Konsekwencje Biznesowe:
                  </div>
                  <p className="text-[#5C6168] leading-relaxed text-[11px]">
                    Overselling (sprzedaż towaru widmo). Brak możliwości realizacji bieżących zamówień na czas, negatywne opinie klientów oraz konieczność anulowania transakcji.
                  </p>
                </div>

                <div className="p-4 rounded-md bg-[#EDF2FF] border border-[#C7D7FE] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#0040CC]">
                    <Check className="w-4 h-4 text-[#0052FF] shrink-0" />
                    Rekomendowane Rozwiązanie:
                  </div>
                  <p className="text-[#373B40] leading-relaxed text-[11px]">
                    Zablokuj wystawianie z zerowym/ujemnym stanem w ustawieniach integracji marketplace, przeprowadź korektę inwentaryzacyjną i zsynchronizuj stan z ERP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "weight" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-warning">OSTRZEŻENIE</span>
                  <span className="font-mono text-xs font-semibold text-[#868C94]">PROD_MISSING_WEIGHT</span>
                </div>
                <div className="text-xs text-[#5C6168] font-mono">
                  Czas naprawy: <strong className="text-[#111315] font-semibold">~5 minut</strong>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111315]">
                  Brak wagi produktu (0.00 kg) dla SKU: "ZEGAREK-SMART-01"
                </h3>
                <p className="text-xs text-[#5C6168] mt-1">
                  Produkt ma wpisaną wagę 0.00 kg w karcie katalogowej Base.com.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#B45309]">
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                    Konsekwencje Biznesowe:
                  </div>
                  <p className="text-[#5C6168] leading-relaxed text-[11px]">
                    Błędy automatycznego dobierania gabarytu paczki w InPost, DPD lub DHL. Ryzyko dotkliwych dopłat weryfikacyjnych (weryfikacja wagi na sortowni kuriera).
                  </p>
                </div>

                <div className="p-4 rounded-md bg-[#EDF2FF] border border-[#C7D7FE] text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#0040CC]">
                    <Check className="w-4 h-4 text-[#0052FF] shrink-0" />
                    Rekomendowane Rozwiązanie:
                  </div>
                  <p className="text-[#373B40] leading-relaxed text-[11px]">
                    Uzupełnij rzeczywistą wagę brutto (z opakowaniem) w karcie produktu w BaseLinkerze.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Target Audience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1 max-w-2xl mx-auto">
          <span className="pci-eyebrow text-[#0052FF]">
            Dla kogo powstał BaseDoctor?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111315]">
            Trzy grupy, które oszczędzają najwięcej czasu i pieniędzy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="pci-card p-6 space-y-3 hover:border-[#CFCBC2] transition">
            <div className="w-9 h-9 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-[#0052FF] flex items-center justify-center font-bold">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#111315]">
              Właściciele Sklepów E-Commerce
            </h3>
            <p className="text-xs text-[#5C6168] leading-relaxed">
              Dla sklepów realizujących od 500 do 10 000+ zamówień miesięcznie. Koniec z niespodziewanymi dopłatami kurierskimi za brak wagi (0 kg), utratą statusu Super Sprzedawcy i wydawaniem towarów bez zapłaty.
            </p>
          </div>

          <div className="pci-card p-6 space-y-3 hover:border-[#CFCBC2] transition">
            <div className="w-9 h-9 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-[#0052FF] flex items-center justify-center font-bold">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#111315]">
              Wdrożeniowcy i Agencje BaseLinker
            </h3>
            <p className="text-xs text-[#5C6168] leading-relaxed">
              Zamiast spędzać 4 godziny na ręcznym sprawdzaniu bazy nowego klienta, generujesz kompleksowy audyt w 30 sekund. Gotowy raport PDF staje się natychmiast podstawą do wyceny prac naprawczych.
            </p>
          </div>

          <div className="pci-card p-6 space-y-3 hover:border-[#CFCBC2] transition">
            <div className="w-9 h-9 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-[#0052FF] flex items-center justify-center font-bold">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#111315]">
              Kierownicy Magazynu i Logistyki
            </h3>
            <p className="text-xs text-[#5C6168] leading-relaxed">
              Natychmiastowe wykrywanie ujemnych stanów w poszczególnych magazynach składowych, eliminacja oversellingu oraz zamówień wiszących w realizacji ponad 7 i 14 dni.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Process Flow (3 Steps) */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-1">
          <span className="pci-eyebrow text-[#0052FF]">
            Przebieg Audytu
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111315]">
            Trzy proste kroki do pełnej kontroli nad sklepem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="pci-card p-6 space-y-3">
            <div className="w-7 h-7 rounded-md bg-[#111315] text-white font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111315]">
              Bezpieczne połączenie tokenu API
            </h3>
            <p className="text-xs text-[#5C6168] leading-relaxed">
              Podajesz klucz API z panelu BaseLinkera. Token jest szyfrowany algorytmem AES-256-GCM.
              Nasz system stosuje rygorystyczny tryb tylko do odczytu — brak uprawnień do edycji ani usuwania danych.
            </p>
          </div>

          <div className="pci-card p-6 space-y-3">
            <div className="w-7 h-7 rounded-md bg-[#111315] text-white font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111315]">
              Automatyczny skan 15 reguł w 30 sek.
            </h3>
            <p className="text-xs text-[#5C6168] leading-relaxed">
              Silnik diagnostyczny analizuje katalog SKU, kody EAN, spójność magazynową i zamówienia z ostatnich 30 dni,
              weryfikując dane zgodnie z oficjalną specyfikacją Base.com API.
            </p>
          </div>

          <div className="pci-card p-6 space-y-3">
            <div className="w-7 h-7 rounded-md bg-[#111315] text-white font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111315]">
              Raport PDF z wyceną ryzyka
            </h3>
            <p className="text-xs text-[#5C6168] leading-relaxed">
              Otrzymujesz wynik punktowy Health Score (0-100%) oraz ustrukturyzowany wykaz usterek z rekomendacjami
              i czasem ręcznej naprawy, gotowy do pobrania w oficjalnym formacie PDF.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Security & Read-Only Technical Guarantee */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#111315] text-white rounded-xl p-8 sm:p-12 shadow-xs space-y-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-zinc-300 text-[11px] font-mono">
              <Lock className="w-3.5 h-3.5 text-[#0052FF]" />
              Gwarancja Bezpieczeństwa & Architektura Read-Only
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              100% Tryb Tylko do Odczytu — Bezpieczeństwo Twojego Sklepu
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Nasz serwer posiada wbudowaną białą listę dopuszczalnych metod API Base.com.
              BaseDoctor z zasady konstrukcyjnej nie zawiera żadnej metody modyfikującej
              ani kasującej Twoje produkty czy zamówienia. Twój token API jest szyfrowany
              za pomocą AES-256-GCM z unikalnym wektorem IV i przechowywany wyłącznie
              po stronie serwera.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="p-4 rounded-md bg-white/5 border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span className="text-zinc-200">Brak operacji set*, add*, delete*</span>
            </div>
            <div className="p-4 rounded-md bg-white/5 border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span className="text-zinc-200">Rate limiting max 95 req/min</span>
            </div>
            <div className="p-4 rounded-md bg-white/5 border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span className="text-zinc-200">Szyfrowanie AES-256-GCM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Diagnostic Matrix */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#111315]">
            Zakres Diagnostyki BaseDoctor
          </h2>
          <p className="text-xs text-[#5C6168]">
            Przejrzysta lista wspieranych reguł audytowych oraz ograniczeń systemu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="pci-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111315] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              Obsługiwane testy (MVP)
            </h3>
            <div className="space-y-3 text-xs">
              {DIAGNOSTIC_CAPABILITIES_DOC.supportedChecks.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-[#111315]">{group.category}</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[#5C6168]">
                    {group.checks.map((chk, cIdx) => (
                      <li key={cIdx}>{chk}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pci-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111315] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              Obszary poza zakresem (Jasno udokumentowane)
            </h3>
            <div className="space-y-3 text-xs">
              {DIAGNOSTIC_CAPABILITIES_DOC.unsupportedChecks.map((item, idx) => (
                <div key={idx} className="p-3 rounded-md bg-[#FAF9F6] border border-[#EFECE6]">
                  <div className="font-semibold text-[#111315]">{item.area}</div>
                  <div className="text-[#5C6168] mt-0.5 leading-relaxed">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact / Audit Consultation Form */}
      <section id="kontakt" className="max-w-2xl mx-auto px-4">
        <div className="pci-card p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-1.5">
            <span className="pci-eyebrow text-[#0052FF]">
              Darmowa Konsultacja
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111315]">
              Zamów Bezpłatny Audyt Wstępny lub Porozmawiaj z Inżynierem
            </h2>
            <p className="text-xs text-[#5C6168] max-w-md mx-auto">
              Chcesz sprawdzić stan integracji swojego konta BaseLinker? Wypełnij krótki formularz — odezwiemy się w ciągu 24h.
            </p>
          </div>

          {contactResult && (
            <div
              className={`p-3.5 rounded-md text-xs flex items-center gap-2.5 ${
                contactResult.type === "success"
                  ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#046C4E]"
                  : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
              }`}
            >
              {contactResult.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              )}
              <span>{contactResult.text}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                  Imię i Nazwisko / Nazwa Firmy *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Piotr Wiśniewski (E-Sklep)"
                  className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                  Adres E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="piotr@twojsklep.pl"
                  className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                  Domena Sklepu (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={contactForm.storeUrl}
                  onChange={(e) => setContactForm({ ...contactForm, storeUrl: e.target.value })}
                  placeholder="np. moj-sklep.pl"
                  className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                  Miesięczna Liczba Zamówień
                </label>
                <select
                  value={contactForm.monthlyOrders}
                  onChange={(e) => setContactForm({ ...contactForm, monthlyOrders: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                >
                  <option value="Poniżej 500 zamówień">Poniżej 500 zamówień/mc</option>
                  <option value="500 - 2 000 zamówień">500 – 2 000 zamówień/mc</option>
                  <option value="2 000 - 10 000 zamówień">2 000 – 10 000 zamówień/mc</option>
                  <option value="Powyżej 10 000 zamówień">Powyżej 10 000 zamówień/mc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                Wiadomość / Najczęstsze problemy w sklepie (opcjonalnie)
              </label>
              <textarea
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="np. Borykamy się z dopłatami za brak wagi paczek w kurierce oraz rozbieżnościami stanów z ERP."
                className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
              />
            </div>

            <button
              type="submit"
              disabled={contactSubmitting}
              className="btn-primary-cobalt w-full py-2.5 text-xs font-semibold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{contactSubmitting ? "Wysyłanie zgłoszenia..." : "Wyślij Wniosek o Bezpłatny Audyt"}</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
