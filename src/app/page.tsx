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
  TrendingDown,
  FileText,
  AlertOctagon,
  ChevronRight,
  Send,
  Building,
  Check,
  AlertCircle,
} from "lucide-react";
import { DIAGNOSTIC_CAPABILITIES_DOC } from "@/lib/diagnostics/engine";

export default function HomePage() {
  // Interactive sample issue preview state
  const [activeTab, setActiveTab] = useState<"sku" | "orders" | "inventory" | "weight">("sku");

  // Contact form state
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
    <div className="space-y-20 py-8 sm:py-16">
      {/* 1. Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Oficjalna integracja z API Base.com (BaseLinker) • 100% Tryb Tylko do Odczytu
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Zdiagnozuj usterki w swoim sklepie zanim przyniosą{" "}
          <span className="text-blue-600 underline decoration-blue-300 decoration-wavy underline-offset-8">
            straty finansowe
          </span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-slate-600 leading-relaxed">
          BaseDoctor przeprowadza rygorystyczny, 30-sekundowy audyt katalogu produktów,
          synchronizacji stanów magazynowych oraz anomalii w zamówieniach. Bezpiecznie,
          z szyfrowaniem poświadczeń AES-256-GCM i gotowymi rekomendacjami naprawczymi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition"
          >
            Rozpocznij darmowy audyt
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition"
          >
            Zaloguj się do panelu
          </Link>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Skan w 30 sekund
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Brak uprawnień do edycji danych
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Raporty PDF do pobrania
          </span>
        </div>
      </section>

      {/* 2. Target Audience - Dla kogo jest BaseDoctor? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Dla kogo powstał BaseDoctor?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Trzy grupy, które oszczędzają najwięcej czasu i pieniędzy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Persona 1: Store Owner */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-200 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Właściciele Sklepów E-commerce
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dla firm wysyłających od 500 do 10 000+ zamówień miesięcznie. Koniec ze stratami
              na dopłatach gabarytowych za brak wagi (0 kg), utratą statusu Super Sprzedawcy
              z powodu brakującego numeru listu czy wysyłką nieopłaconych zamówień.
            </p>
            <div className="pt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
              Eliminacja kosztownych błędów operacyjnych <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Persona 2: BaseLinker Agencies & Integrators */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-200 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Wdrożeniowcy i Agencje BaseLinker
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Zamiast spędzać 4 godziny na manualnym przeklikiwaniu bazy nowego klienta,
              przeprowadzasz pełny audyt w 30 sekund. Generujesz profesjonalny raport PDF
              z wykazem nieprawidłowości i natychmiast oferujesz pakiet wdrożeniowo-naprawczy.
            </p>
            <div className="pt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1">
              Gotowe narzędzie ofertowe dla klientów <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Persona 3: Ops & Logistics Managers */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-200 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Kierownicy Magazynu i Operacji
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Błyskawicznie wykryj ujemne stany magazynowe w magazynach fizycznych,
              rozbieżności sumarycznych stanów w Base.com oraz zamówienia wiszące
              w realizacji ponad 7 i 14 dni, które blokują pracowników kompletacji.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              Spójność magazynowa bez oversellingu <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Diagnostic Process - Jak wygląda audyt w 3 krokach */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Przebieg audytu
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Trzy proste kroki do pełnej przejrzystości
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Bezpieczne połączenie tokenu API
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Podajesz klucz API z panelu BaseLinkera. Token jest szyfrowany algorytmem AES-256-GCM.
              Nasz system stosuje rygorystyczny tryb tylko do odczytu — nie ma technicznej możliwości
              edycji ani skasowania żadnego produktu czy zamówienia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Automatyczny skan 15 reguł w 30 sekund
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Silnik diagnostyczny pobiera katalog produktów, stany magazynowe i zamówienia
              z ostatnich 30 dni. Sprawdza duplikaty SKU/EAN, wagę, ujemne stany, brak numeru
              listu przewozowego oraz zamówienia zablokowane ponad 7 i 14 dni.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Raport PDF z wyceną ryzyka i planem naprawczym
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Otrzymujesz wynik punktowy Health Score (0-100%) oraz ustrukturyzowany wykaz usterek.
              Każdy problem zawiera opis konsekwencji biznesowych, zalecaną instrukcję naprawy
              oraz szacowany czas ręcznej korekty.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Report Preview */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Podgląd wyników
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Zobacz, jak BaseDoctor prezentuje wykryte usterki
          </h2>
          <p className="text-xs text-slate-500">
            Każda usterka posiada określoną wagę, realny wpływ na biznes i konkretną rekomendację naprawczą.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("sku")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "sku"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Zdublowany SKU (PROD_DUPLICATE_SKU)
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "orders"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Brak Listu Przewozowego (ORD_MISSING_TRACKING)
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Ujemny Stan (INV_NEGATIVE_STOCK)
          </button>
          <button
            onClick={() => setActiveTab("weight")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "weight"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Brak Wagi Produktu (PROD_MISSING_WEIGHT)
          </button>
        </div>

        {/* Active Card Body */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
          {activeTab === "sku" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    KRYTYCZNY
                  </span>
                  <span className="text-xs font-bold text-slate-400">PROD_DUPLICATE_SKU</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Szacowany czas naprawy: <strong className="text-slate-800">~10 minut</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Wykryto zdublowany identyfikator SKU: "KLAWIATURA-RGB-PRO"
              </h3>
              <p className="text-xs text-slate-600">
                Ten sam kod SKU został przypisany do 2 różnych rekordów w katalogu Base.com (ID: 1042 oraz ID: 1089).
              </p>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Konsekwencje Biznesowe:
                </div>
                <p>
                  Ryzyko spakowania i wysyłki niewłaściwego towaru klientowi, błędy synchronizacji stanów
                  magazynowych na Allegro i Amazon oraz chaos w inwentaryzacji.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-blue-600" />
                  Rekomendowane Rozwiązanie:
                </div>
                <p>
                  Zmień SKU jednego z produktów na unikalny (np. dodając sufiks wariantu kolorystycznego)
                  i zaktualizuj powiązania w ofertach marketplace.
                </p>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    KRYTYCZNY
                  </span>
                  <span className="text-xs font-bold text-slate-400">ORD_MISSING_TRACKING</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Szacowany czas naprawy: <strong className="text-slate-800">~5 minut</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Wysłane zamówienie #88241 bez zapisanego numeru listu przewozowego
              </h3>
              <p className="text-xs text-slate-600">
                Zamówienie posiada status "Wysłane", lecz w BaseLinkerze nie zarejestrowano numeru paczki ani etykiety kurierskiej.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Konsekwencje Biznesowe:
                </div>
                <p>
                  Kupujący nie otrzymuje linku do śledzenia przesyłki. Allegro obniża wskaźnik jakości
                  sprzedaży "Terminowa wysyłka i numer przesyłki w terminie", co grozi utratą statusu Super Sprzedawcy.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-blue-600" />
                  Rekomendowane Rozwiązanie:
                </div>
                <p>
                  Uzupełnij numer nadania w zamówieniu lub sprawdź integrację kurierską, która nie przekazała
                  numeru listu po wygenerowaniu etykiety.
                </p>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    KRYTYCZNY
                  </span>
                  <span className="text-xs font-bold text-slate-400">INV_NEGATIVE_STOCK</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Szacowany czas naprawy: <strong className="text-slate-800">~15 minut</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ujemny stan magazynowy (-2 szt.) dla produktu "Słuchawki Bezprzewodowe ANC"
              </h3>
              <p className="text-xs text-slate-600">
                Stan w magazynie głównym wynosi -2 szt. Towar został sprzedany mimo braku fizycznego zapasu.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Konsekwencje Biznesowe:
                </div>
                <p>
                  Overselling (sprzedaż towaru widmo). Brak możliwości realizacji bieżących zamówień na czas,
                  negatywne opinie klientów oraz konieczność anulowania transakcji.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-blue-600" />
                  Rekomendowane Rozwiązanie:
                </div>
                <p>
                  Zablokuj wystawianie z zerowym/ujemnym stanem w ustawieniach integracji marketplace,
                  przeprowadź szybką korektę inwentaryzacyjną i zsynchronizuj stan z ERP.
                </p>
              </div>
            </div>
          )}

          {activeTab === "weight" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    OSTRZEŻENIE
                  </span>
                  <span className="text-xs font-bold text-slate-400">PROD_MISSING_WEIGHT</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Szacowany czas naprawy: <strong className="text-slate-800">~5 minut</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Brak wagi produktu (0.00 kg) dla SKU: "ZEGAREK-SMART-01"
              </h3>
              <p className="text-xs text-slate-600">
                Produkt ma wpisaną wagę 0.00 kg w karcie katalogowej Base.com.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Konsekwencje Biznesowe:
                </div>
                <p>
                  Błędy automatycznego dobierania gabarytu paczki w InPost, DPD lub DHL.
                  Ryzyko dotkliwych dopłat weryfikacyjnych (weryfikacja wagi na sortowni kuriera).
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-blue-600" />
                  Rekomendowane Rozwiązanie:
                </div>
                <p>
                  Uzupełnij rzeczywistą wagę brutto (z opakowaniem) w karcie produktu w BaseLinkerze.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Security & Read-Only Guarantee */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden space-y-6">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> Gwarancja Bezpieczeństwa & Architektury Read-Only
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              100% Tryb Tylko do Odczytu — Bezpieczeństwo Twojego Sklepu
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Nasz serwer posiada wbudowaną białą listę dopuszczalnych metod API Base.com.
              BaseDoctor z zasady konstrukcyjnej nie zawiera żadnej metody modyfikującej
              ani kasującej Twoje produkty czy zamówienia. Twój token API jest szyfrowany
              za pomocą AES-256-GCM z unikalnym wektorem IV i przechowywany wyłącznie
              po stronie serwera.
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-300">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Brak operacji set*, add*, delete*</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rate limiting 100 req/min</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Szyfrowanie AES-256-GCM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Diagnostic Matrix */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Zakres Diagnostyki BaseDoctor
          </h2>
          <p className="text-sm text-slate-600">
            Przejrzysta lista wspieranych reguł audytowych oraz ograniczeń systemu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Obsługiwane testy (MVP)
            </h3>
            <div className="space-y-3 text-xs text-slate-700">
              {DIAGNOSTIC_CAPABILITIES_DOC.supportedChecks.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-slate-900">{group.category}</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {group.checks.map((chk, cIdx) => (
                      <li key={cIdx}>{chk}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Obszary poza zakresem (Jasno udokumentowane)
            </h3>
            <div className="space-y-3 text-xs text-slate-700">
              {DIAGNOSTIC_CAPABILITIES_DOC.unsupportedChecks.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-900">{item.area}</div>
                  <div className="text-slate-600 mt-0.5">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact / Audit Request Lead Form */}
      <section id="kontakt" className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Darmowa Konsultacja
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Zamów Bezpłatny Audyt Wstępny lub Porozmawiaj z Inżynierem
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Chcesz sprawdzić kondycję swojego konta BaseLinker lub potrzebujesz dedykowanej analizy
              dla dużej liczby zamówień? Wypełnij formularz — odezwiemy się w ciągu 24h.
            </p>
          </div>

          {contactResult && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 ${
                contactResult.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {contactResult.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{contactResult.text}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Imię i Nazwisko / Nazwa Firmy *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="np. Piotr Wiśniewski (E-Sklep Sp. z o.o.)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adres E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="piotr@twojasklep.pl"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adres Sklepu / Domena (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={contactForm.storeUrl}
                  onChange={(e) => setContactForm({ ...contactForm, storeUrl: e.target.value })}
                  placeholder="np. moj-sklep.pl"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Miesięczna Liczba Zamówień
                </label>
                <select
                  value={contactForm.monthlyOrders}
                  onChange={(e) => setContactForm({ ...contactForm, monthlyOrders: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
                >
                  <option value="Poniżej 500 zamówień">Poniżej 500 zamówień/mc</option>
                  <option value="500 - 2 000 zamówień">500 – 2 000 zamówień/mc</option>
                  <option value="2 000 - 10 000 zamówień">2 000 – 10 000 zamówień/mc</option>
                  <option value="Powyżej 10 000 zamówień">Powyżej 10 000 zamówień/mc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wiadomość / Główne Problemy w Sklepie (opcjonalnie)
              </label>
              <textarea
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="np. Mamy problem z dopłatami za brak wagi paczek oraz rozbieżnościami stanów z magazynu zewnętrznego."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={contactSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
              {contactSubmitting ? "Wysyłanie zgłoszenia..." : "Wyślij Wniosek o Bezpłatny Audyt"}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Wysyłając formularz, wyrażasz zgodę na kontakt doradcy technicznego BaseDoctor.
            </p>
          </form>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 pt-8 pb-12 max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-700">
          BaseDoctor — Narzędzie Diagnostyczne dla E-Commerce i Base.com
        </p>
        <p>
          Wszystkie nazwy produktów i znaki towarowe (BaseLinker, Base.com, Allegro, Amazon, WooCommerce, PrestaShop)
          należą do ich prawowitych właścicieli i zostały użyte wyłącznie w celach informacyjnych.
        </p>
        <p className="text-[11px] text-slate-400">
          Zgodność z RODO • Szyfrowanie poświadczeń AES-256-GCM • Architektura Read-Only
        </p>
      </footer>
    </div>
  );
}
