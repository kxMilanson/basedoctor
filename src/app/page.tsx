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
} from "lucide-react";
import { DIAGNOSTIC_CAPABILITIES_DOC } from "@/lib/diagnostics/engine";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          Oficjalna integracja z API Base.com (BaseLinker)
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Zdiagnozuj usterki w swoim sklepie zanim przyniosą{" "}
          <span className="text-blue-600 underline decoration-blue-300">
            straty finansowe
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
          BaseDoctor przeprowadza rygorystyczny, automatyczny audyt katalogu produktów,
          stanów magazynowych i zamówień. Bezpiecznie, w trybie{" "}
          <strong className="text-slate-900 font-semibold">tylko do odczytu</strong>,
          z szyfrowaniem tokenów AES-256-GCM.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            Rozpocznij darmowy audyt
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition"
          >
            Zaloguj się do panelu
          </Link>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Katalog SKU i Kody EAN
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Błyskawicznie wykrywa brakujące i zduplikowane kody SKU, nieprawidłowe kody
              kreskowe EAN-13, brak wagi produktu (0.00 kg) oraz groźne ceny 0 PLN.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Spójność Magazynowa
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identyfikuje ujemne stany magazynowe w magazynach składowych,
              niespójności sumy stanów oraz ostrzega o wyczerpanych zapasach.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Anomalie Zamówień i Płatności
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Wykrywa zamówienia zablokowane ponad 7 i 14 dni, wysyłki bez numeru
              listu przewozowego oraz krytyczne zamówienia wysłane bez odnotowanej zapłaty.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Read-Only Guarantee */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> Gwarancja Bezpieczeństwa
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              100% Tryb Tylko do Odczytu (Read-Only)
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Nasz backend stosuje rygorystyczną białą listę metod API Base.com.
              BaseDoctor z zasady konstrukcyjnej nie zawiera żadnej metody modyfikującej
              ani kasującej Twoje produkty czy zamówienia. Twój token API jest szyfrowany
              za pomocą AES-256-GCM z unikalnym wektorem IV i przechowywany wyłącznie
              po stronie serwera.
            </p>
            <div className="pt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Brak operacji set*, add*, delete*
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Zgodność z rate limiting 100 req/min
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Eksport do raportów PDF
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Diagnostic Rules Matrix */}
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
    </div>
  );
}
