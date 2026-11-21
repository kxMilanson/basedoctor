"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  Send,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  AlertCircle,
  FileText,
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
  const [contactResult, setContactResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    <div className="space-y-24 py-12 sm:py-20 text-[#18181B]">
      {/* 1. HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E4DC] text-[#3F3F46] text-xs font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Bezpieczna diagnostyka dla sklepów internetowych i sprzedawców Allegro</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#18181B] tracking-tight leading-[1.08]">
            Sprawdź, czy błędy w katalogu i zamówieniach nie odbierają Ci{" "}
            <span className="text-[#0F766E]">sprzedaży</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#52525B] leading-relaxed max-w-2xl mx-auto">
            BaseDoctor w 30 sekund przegląda Twoje produkty, stany magazynowe oraz zamówienia w
            Base.com. Pokazuje prostym językiem, co wymaga poprawy, zanim klienci wystawią
            negatywną opinię lub kurier doliczy dopłatę.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register" className="btn-studio-brand px-6 py-3.5 text-sm w-full sm:w-auto">
              <span>Sprawdź swój sklep za darmo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-studio-secondary px-6 py-3.5 text-sm w-full sm:w-auto">
              <span>Zobacz przykładowy panel</span>
            </Link>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#52525B] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Bez zmian w Twoim sklepie (tylko odczyt)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Wynik gotowy w 30 sekund
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Czytelny raport PDF
            </span>
          </div>
        </div>

        {/* Visual Product Preview Card */}
        <div className="studio-card p-6 sm:p-8 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F1EFEA]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="pill-demo">Przykładowy podgląd raportu</span>
                <span className="text-xs text-[#71717A]">Sklep z elektroniką i akcesoriami</span>
              </div>
              <h2 className="text-lg font-bold text-[#18181B]">
                Sklep działa, ale kilka spraw warto uporządkować
              </h2>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] shrink-0">
              <div className="text-right">
                <div className="text-[11px] font-medium text-[#71717A]">Kondycja sklepu</div>
                <div className="text-xs font-semibold text-[#B45309]">Warto poprawić</div>
              </div>
              <div className="text-3xl font-bold text-[#18181B] tabular-nums">
                86<span className="text-sm font-medium text-[#71717A]">/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="pill-urgent">Pilne — blokuje sprzedaż</span>
                <span className="text-[11px] text-[#71717A] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0F766E]" /> Zajmie ok. 10 min
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#18181B]">
                Dwa różne produkty mają ten sam kod SKU
              </h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Magazyn może mylić warianty przy pakowaniu paczek, a stany na Allegro mogą się źle odświeżać. Zmień jeden z kodów na unikalny.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="pill-warning">Warto poprawić</span>
                <span className="text-[11px] text-[#71717A] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0F766E]" /> Zajmie ok. 5 min
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#18181B]">
                12 produktów nie ma wpisanej wagi (0,00 kg)
              </h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Brak wagi powoduje błędny dobór gabarytu paczki i ryzyko dopłat na sortowni kuriera. Uzupełnij wagę brutto w karcie produktu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE PROBLEM EXPLORER */}
      <section id="co-sprawdzamy" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-[#0F766E]">Co sprawdzamy w sklepie</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
            Konkretne odpowiedzi zamiast technicznych tabel
          </h2>
          <p className="text-sm text-[#52525B]">
            Wybierz jeden z typowych problemów, aby zobaczyć, jak BaseDoctor tłumaczy go na zrozumiały plan działania.
          </p>
        </div>

        {/* Friendly Tab Controls */}
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
              className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-[#18181B] shadow-xs font-semibold"
                  : "text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Explorer Card */}
        <div className="studio-card p-6 sm:p-8 space-y-5">
          {activeTab === "sku" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                <span className="pill-urgent">Pilne — blokuje sprzedaż</span>
                <span className="text-xs text-[#52525B] font-medium">
                  Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 10 minut</strong>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18181B]">
                  Ten sam kod produktu (SKU) przypisany do dwóch różnych towarów
                </h3>
                <p className="text-xs sm:text-sm text-[#52525B] mt-1">
                  Dwa produkty w Twoim katalogu mają identyczny kod <code className="font-mono bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E8E4DC]">KLAWIATURA-RGB-PRO</code>.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                  <div className="text-xs font-semibold text-[#B45309] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla Twojej sprzedaży?</span>
                  </div>
                  <p className="text-xs text-[#3F3F46] leading-relaxed">
                    Magazyn może wysłać niewłaściwy kolor lub wariant produktu, a stany na Allegro mogą błędnie spadać lub wznawiać oferty, których nie masz.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                  <div className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-xs text-[#134E4A] leading-relaxed">
                    Nadaj jednemu z produktów unikalny kod (np. dopisz końcówkę wariantu) i sprawdź powiązania na swoich aukcjach.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                <span className="pill-urgent">Pilne — ryzyko utraty oceny</span>
                <span className="text-xs text-[#52525B] font-medium">
                  Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 5 minut</strong>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18181B]">
                  Zamówienie oznaczone jako wysłane nie ma numeru przesyłki
                </h3>
                <p className="text-xs sm:text-sm text-[#52525B] mt-1">
                  Zamówienie #88241 ma status „Wysłane”, ale nie ma przypisanego numeru listu przewozowego.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                  <div className="text-xs font-semibold text-[#B45309] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla Twojej sprzedaży?</span>
                  </div>
                  <p className="text-xs text-[#3F3F46] leading-relaxed">
                    Klient nie widzi linku do śledzenia paczki, a Allegro może obniżyć Twój wskaźnik jakości sprzedaży i odebrać odznakę Super Sprzedawcy.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                  <div className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-xs text-[#134E4A] leading-relaxed">
                    Wpisz numer nadania ręcznie w zamówieniu albo sprawdź, dlaczego etykieta kurierska nie zapisała numeru przesyłki.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "inventory" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                <span className="pill-urgent">Pilne — sprzedaż towaru na minusie</span>
                <span className="text-xs text-[#52525B] font-medium">
                  Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 15 minut</strong>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18181B]">
                  Ujemny stan magazynowy (-2 szt.) w produkcie „Słuchawki Bezprzewodowe”
                </h3>
                <p className="text-xs sm:text-sm text-[#52525B] mt-1">
                  System odnotował sprzedaż towaru, mimo że stan na półce był już wyzerowany.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                  <div className="text-xs font-semibold text-[#B45309] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla Twojej sprzedaży?</span>
                  </div>
                  <p className="text-xs text-[#3F3F46] leading-relaxed">
                    Klienci kupują towar, którego nie możesz wysłać od razu. Grozi to anulacjami zamówień, sporami i negatywnymi komentarzami.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                  <div className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-xs text-[#134E4A] leading-relaxed">
                    Policz faktyczny stan produktu na magazynie, zaktualizuj ilość w Base.com i włącz automatyczne zamykanie ofert przy stanie zero.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "weight" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F1EFEA]">
                <span className="pill-warning">Warto poprawić</span>
                <span className="text-xs text-[#52525B] font-medium">
                  Szacowany czas naprawy: <strong className="text-[#18181B]">ok. 5 minut</strong>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18181B]">
                  Brak wpisanej wagi produktu (0,00 kg)
                </h3>
                <p className="text-xs sm:text-sm text-[#52525B] mt-1">
                  Karta katalogowa produktu nie zawiera wagi brutto potrzebnej do poprawnego nadawania paczek.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1.5">
                  <div className="text-xs font-semibold text-[#B45309] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Co to oznacza dla Twojej sprzedaży?</span>
                  </div>
                  <p className="text-xs text-[#3F3F46] leading-relaxed">
                    Programy kurierskie mogą dobierać zły gabaryt lub zaniżoną wagę na etykiecie, co prowadzi do kosztownych dopłat weryfikacyjnych od przewoźnika.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5">
                  <div className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Co należy zrobić?</span>
                  </div>
                  <p className="text-xs text-[#134E4A] leading-relaxed">
                    Wpisz przybliżoną wagę produktu wraz z kartonem w jego karcie w Base.com.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. WHO IT'S FOR */}
      <section id="dla-kogo" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-[#0F766E]">Dla kogo</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
            Stworzony dla ludzi prowadzących handel, nie dla informatyków
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="studio-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">
              Właściciele sklepów internetowych
            </h3>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Zyskujesz spokój ducha, że w Twoim katalogu nie ma błędnych cen, brakujących zdjęć ani niezabezpieczonych zamówień wysłanych bez płatności.
            </p>
          </div>

          <div className="studio-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">
              Sprzedawcy na Allegro i marketplace
            </h3>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Chronisz jakość sprzedaży przed brakiem numerów nadania, błędnymi kodami EAN oraz sprzedażą towarów, które właśnie zniknęły z magazynu.
            </p>
          </div>

          <div className="studio-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#18181B]">
              Zespoły obsługujące zamówienia
            </h3>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Natychmiast wyłapujesz paczki utknięte w realizacji od ponad 7 lub 14 dni oraz produkty bez wagi, zanim trafią na sortownię kuriera.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS + SECURITY PEACE OF MIND */}
      <section id="jak-to-dziala" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-[#0F766E]">Jak to działa</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
            Trzy proste kroki do uporządkowanego sklepu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="studio-card p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#18181B] text-white font-semibold text-xs flex items-center justify-center">
              1
            </div>
            <h3 className="text-sm font-bold text-[#18181B]">
              Podłączasz swój sklep Base.com
            </h3>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Wklejasz klucz dostępu ze swojego konta Base.com. Pokazujemy Ci krok po kroku, gdzie go znaleźć — zajmuje to około minuty.
            </p>
          </div>

          <div className="studio-card p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#18181B] text-white font-semibold text-xs flex items-center justify-center">
              2
            </div>
            <h3 className="text-sm font-bold text-[#18181B]">
              System przegląda sklep w 30 sekund
            </h3>
            <p className="text-xs text-[#52525B] leading-relaxed">
              BaseDoctor sprawdza Twoje produkty, stany magazynowe oraz zamówienia pod kątem 15 najczęstszych błędów spotykanych w handlu.
            </p>
          </div>

          <div className="studio-card p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#18181B] text-white font-semibold text-xs flex items-center justify-center">
              3
            </div>
            <h3 className="text-sm font-bold text-[#18181B]">
              Dostajesz listę spraw i raport PDF
            </h3>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Otrzymujesz przejrzystą ocenę kondycji sklepu oraz dokładne wskazówki, co i dlaczego warto poprawić w pierwszej kolejności.
            </p>
          </div>
        </div>

        {/* Calm Peace-of-Mind Security Card */}
        <div className="studio-card p-7 sm:p-10 bg-[#18181B] text-white border-[#18181B]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-zinc-200 text-xs font-medium">
                <Lock className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Bezpieczeństwo na pierwszym miejscu</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                BaseDoctor działa jak audytor, który tylko patrzy — nigdy niczego nie przestawia na półkach.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Nasze narzędzie korzysta wyłącznie z bezpiecznych zapytań do odczytu. Z zasady nie posiada funkcji zmieniających ceny, opisy, stany magazynowe ani statusy zamówień w Twoim sklepie.
              </p>
            </div>
            <div className="lg:col-span-4 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/10 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
                <span>Zero zmian w produktach i cenach</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
                <span>Bezpieczne przechowywanie klucza</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
                <span>Możliwość usunięcia w każdej chwili</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENT SCOPE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-[#18181B]">
            Co dokładnie sprawdzamy, a czego nie ruszamy
          </h2>
          <p className="text-xs sm:text-sm text-[#52525B]">
            Jasne zasady bez ukrytych ograniczeń
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="studio-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Obszary objęte sprawdzeniem</span>
            </h3>
            <div className="space-y-3 text-xs">
              {DIAGNOSTIC_CAPABILITIES_DOC.supportedChecks.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-[#18181B]">{group.category}</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[#52525B]">
                    {group.checks.map((chk, cIdx) => (
                      <li key={cIdx}>{chk}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="studio-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <span>Czego nie sprawdzamy (uczciwa informacja)</span>
            </h3>
            <div className="space-y-3 text-xs">
              {DIAGNOSTIC_CAPABILITIES_DOC.unsupportedChecks.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                  <div className="font-semibold text-[#18181B]">{item.area}</div>
                  <div className="text-[#52525B] mt-0.5 leading-relaxed">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT / CONSULTATION FORM */}
      <section id="kontakt" className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="studio-card p-7 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-[#0F766E]">Masz pytania?</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18181B]">
              Poproś o bezpłatną konsultację w sprawie Twojego sklepu
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] max-w-md mx-auto">
              Zostaw kontakt, jeśli chcesz omówić wyniki swojego sklepu lub sprawdzić, jak uporządkować bazę produktów.
            </p>
          </div>

          {contactResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                  Imię i nazwisko lub nazwa sklepu *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="np. Jan Kowalski"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                  Adres e-mail *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="jan@twojsklep.pl"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                  Adres sklepu (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={contactForm.storeUrl}
                  onChange={(e) => setContactForm({ ...contactForm, storeUrl: e.target.value })}
                  placeholder="np. twojsklep.pl"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                  Liczba zamówień w miesiącu
                </label>
                <select
                  value={contactForm.monthlyOrders}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, monthlyOrders: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                >
                  <option value="Poniżej 500 zamówień">Poniżej 500 zamówień/mc</option>
                  <option value="500 - 2 000 zamówień">500 – 2 000 zamówień/mc</option>
                  <option value="2 000 - 10 000 zamówień">2 000 – 10 000 zamówień/mc</option>
                  <option value="Powyżej 10 000 zamówień">Powyżej 10 000 zamówień/mc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                W czym możemy pomóc? (opcjonalnie)
              </label>
              <textarea
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="np. Chcemy sprawdzić, dlaczego mamy dopłaty za wagę paczek albo skąd biorą się braki na magazynie."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={contactSubmitting}
              className="btn-studio-brand w-full py-3 text-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {contactSubmitting ? "Wysyłanie..." : "Wyślij prośbę o kontakt"}
              </span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
