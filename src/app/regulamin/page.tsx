import Link from "next/link";
import { ShieldCheck, FileText, ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Regulamin Świadczenia Usług B2B — BaseDoctor",
  description:
    "Regulamin świadczenia usług drogą elektroniczną dla przedsiębiorców (B2B) w serwisie BaseDoctor.",
};

export default function RegulaminPage() {
  return (
    <div className="min-h-screen bg-obsidian-spotlight text-zinc-100 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wróć na stronę główną</span>
          </Link>
        </div>

        <div className="bento-dark-card p-6 sm:p-10 space-y-8">
          <header className="border-b border-white/[0.08] pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 text-[#2DD4BF] text-xs font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>Dokumentacja Prawna B2B • UŚUDE Art. 8</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Regulamin Świadczenia Usług Drogą Elektroniczną (B2B)
            </h1>
            <p className="text-xs text-zinc-400">
              Obowiązuje od dnia publikacji • Wersja 1.0 • Wyłącznie dla przedsiębiorców (B2B)
            </p>
          </header>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-amber-200 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">[Dane Operatora do uzupełnienia przed startem sprzedaży]:</strong>{" "}
              Właścicielem i Usługodawcą platformy BaseDoctor jest{" "}
              <span className="underline decoration-amber-400/50">
                [Pełna nazwa firmy / Imię i nazwisko], ul. [Adres siedziby], [Kod pocztowy i miasto], NIP: [NIP], REGON: [REGON], wpisana do [CEIDG / KRS nr ...]
              </span>
              , adres e-mail do kontaktu:{" "}
              <span className="underline decoration-amber-400/50">[kontakt@twojadomena.pl]</span>.
            </div>
          </div>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 1. Postanowienia ogólne i definicje</h2>
            <p>
              1. Niniejszy Regulamin określa zasady korzystania z platformy diagnostycznej{" "}
              <strong className="text-white">BaseDoctor</strong> dostępnej pod adresem internetowym serwisu,
              w tym zasady świadczenia usług drogą elektroniczną w rozumieniu ustawy z dnia 18 lipca 2002 r.
              o świadczeniu usług drogą elektroniczną (Dz.U. 2002 nr 144 poz. 1204 z późn. zm.).
            </p>
            <p>
              2. Platforma BaseDoctor jest narzędziem klasy B2B (Business-to-Business) przeznaczonym wyłącznie dla
              przedsiębiorców w rozumieniu art. 43¹ Kodeksu cywilnego, prowadzących działalność gospodarczą w obszarze
              handlu elektronicznego (e-commerce). Usługa nie jest skierowana do konsumentów.
            </p>
            <p>
              3. <strong className="text-white">Usługobiorca (Klient)</strong> — przedsiębiorca posiadający konto
              w serwisie BaseDoctor i korzystający z narzędzi diagnostycznych.
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 2. Charakter Usługi, Read-Only oraz Asystent Bezpiecznej Naprawy</h2>
            <p>
              1. Podstawową funkcją BaseDoctor jest automatyczna analiza i diagnostyka konfiguracji systemów
              e-commerce (w szczególności BaseLinker / Base.com, integracji kurierskich, stanów magazynowych i mapowań SKU).
            </p>
            <p>
              2. <strong className="text-white">Domyślny tryb tylko do odczytu (Read-Only):</strong> Skanowanie
              diagnostyczne odbywa się wyłącznie w trybie odczytu danych technicznych. System nie dokonuje
              samoczynnych zmian w magazynie, cenach ani zamówieniach Klienta podczas skanowania.
            </p>
            <p>
              3. <strong className="text-white">Asystent Bezpiecznej Naprawy (Human-in-the-Loop):</strong> Wszelkie
              operacje modyfikacji danych (np. korekta wagi paczki lub powiązania SKU) wykonywane są wyłącznie na
              wyraźne, każdorazowe żądanie i po zatwierdzeniu przez upoważnionego Użytkownika. Przed wykonaniem
              zmiany system rejestruje stan pierwotny w celu umożliwienia cofnięcia operacji (Rollback).
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 3. Wymagania techniczne i bezpieczeństwo konta</h2>
            <p>
              1. Do korzystania z serwisu niezbędne jest urządzenie z dostępem do sieci Internet, aktualna
              przeglądarka internetowa obsługująca JavaScript i pliki cookies sesyjne oraz aktywne konto e-mail.
            </p>
            <p>
              2. Klient zobowiązany jest do zachowania poufności swoich danych logowania oraz tokenów API.
              Przekazywane do BaseDoctor tokeny API są szyfrowane po stronie serwera algorytmem{" "}
              <strong className="text-white">AES-256-GCM</strong> i wykorzystywane wyłącznie w celu realizacji
              zleconych skanów oraz zatwierdzonych korekt.
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 4. Odpowiedzialność i charakter raportów (Art. 473 KC)</h2>
            <p>
              1. Raporty diagnostyczne, szacunki strat finansowych oraz rekomendacje generowane przez BaseDoctor
              mają charakter wyłącznie <strong className="text-white">doradczy i informacyjny</strong>. Ostateczną
              decyzję o wdrożeniu zmian w systemie sprzedażowym podejmuje Klient.
            </p>
            <p>
              2. Na podstawie art. 473 § 1 Kodeksu cywilnego odpowiedzialność Usługodawcy z tytułu utraconych
              korzyści (lucrum cessans) oraz szkód pośrednich wynikających z decyzji biznesowych podjętych przez
              Klienta na podstawie raportów lub z przerw technicznych niezależnych dostawców API (np. Base.com)
              zostaje wyłączona, z zastrzeżeniem szkód wyrządzonych z winy umyślnej.
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 5. Reklamacje i rozwiązanie umowy</h2>
            <p>
              1. Klient może zgłaszać reklamacje dotyczące działania serwisu drogą elektroniczną na adres kontaktowy
              Usługodawcy. Zgłoszenie powinno zawierać opis problemu oraz dane umożliwiające identyfikację konta.
            </p>
            <p>
              2. Usługodawca rozpatruje reklamacje w terminie do <strong className="text-white">14 dni kalendarzowych</strong>{" "}
              od daty ich otrzymania i udziela odpowiedzi na adres e-mail Klienta.
            </p>
            <p>
              3. Klient może w każdej chwili usunąć swoje konto wraz z powiązanymi tokenami API i historią skanów
              bezpośrednio w panelu Użytkownika (zakładka Ustawienia) zgodnie z art. 17 RODO.
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed border-t border-white/[0.08] pt-6">
            <h2 className="text-lg font-semibold text-white">§ 6. Postanowienia końcowe</h2>
            <p>
              W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego,
              w szczególności Kodeksu cywilnego oraz Ustawy o świadczeniu usług drogą elektroniczną. Wszelkie spory
              między stronami B2B rozstrzygane będą przez sąd właściwy dla siedziby Usługodawcy.
            </p>
          </section>

          <div className="pt-4 flex flex-wrap gap-4 text-xs text-zinc-400 border-t border-white/[0.08]">
            <Link href="/polityka-prywatnosci" className="text-[#2DD4BF] hover:underline flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Polityka Prywatności i Cookies</span>
            </Link>
            <Link href="/dpa" className="text-[#2DD4BF] hover:underline flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Umowa Powierzenia Danych (DPA)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
