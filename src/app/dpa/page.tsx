import Link from "next/link";
import { Lock, ShieldCheck, ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Umowa Powierzenia Przetwarzania Danych (DPA) — BaseDoctor",
  description:
    "Umowa powierzenia przetwarzania danych osobowych zgodna z Art. 28 RODO dla klientów B2B serwisu BaseDoctor.",
};

export default function DpaPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#60A5FA] text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>RODO Art. 28 • Data Processing Agreement (DPA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Umowa Powierzenia Przetwarzania Danych Osobowych (DPA)
            </h1>
            <p className="text-xs text-zinc-400">
              Integralna część Regulaminu Świadczenia Usług B2B • Zgodność z Art. 28 ust. 3 RODO
            </p>
          </header>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-amber-200 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">[Dane Podmiotu Przetwarzającego do uzupełnienia]:</strong>{" "}
              Stronami niniejszej umowy są: Klient B2B jako{" "}
              <strong className="text-white">Administrator Danych (Powierzający)</strong> oraz{" "}
              <span className="underline decoration-amber-400/50">
                [Pełna nazwa firmy Operatora, Adres, NIP, REGON]
              </span>{" "}
              jako <strong className="text-white">Podmiot Przetwarzający (Procesor)</strong>.
            </div>
          </div>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 1. Przedmiot, cel i minimalizacja danych (Privacy by Design)</h2>
            <p>
              1. Powierzający powierza Podmiotowi Przetwarzającemu dane w zakresie niezbędnym do świadczenia usługi
              diagnostyki i bezpiecznej korekty konfiguracji sklepu / systemu ERP (Base.com) na czas trwania umowy
              głównej (posiadania aktywnego konta w BaseDoctor).
            </p>
            <p>
              2. <strong className="text-white">Gwarancja Privacy by Design:</strong> System BaseDoctor jest
              zaprojektowany w modelu ścisłej minimalizacji danych. Narzędzie przetwarza wyłącznie metadane
              techniczne i operacyjne (identyfikatory SKU, wagi gabarytowe, stany magazynowe, kody błędów integracji).{" "}
              <strong className="text-white">
                BaseDoctor celowo pomija, nie pobiera i nie utrwala w bazie danych żadnych danych osobowych konsumentów
                końcowych
              </strong>{" "}
              (imion, nazwisk, adresów zamieszkania/dostawy, numerów telefonów ani adresów e-mail kupujących).
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 2. Środki Techniczne i Organizacyjne (TOMs — Art. 32 RODO)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Szyfrowanie w spoczynku (Encryption at Rest):</strong> Tokeny dostępowe API
                sklepów są szyfrowane silnym algorytmem <strong className="text-white">AES-256-GCM</strong> z unikalnym
                wektorem inicjalizującym (IV) oraz tagiem uwierzytelniającym.
              </li>
              <li>
                <strong className="text-white">Szyfrowanie w transmisji (Encryption in Transit):</strong> Cała
                komunikacja odbywa się wyłącznie po szyfrowanym protokole HTTPS / TLS 1.3.
              </li>
              <li>
                <strong className="text-white">Izolacja dostępu (Anti-IDOR):</strong> Każde żądanie do API weryfikuje
                własność zasobu względem uwierzytelnionej sesji Użytkownika (brak dostępu krzyżowego między najemcami).
              </li>
              <li>
                <strong className="text-white">Domyślny tryb Read-Only:</strong> Diagnostyka nie modyfikuje danych
                produkcyjnych Klienta bez jawnego zatwierdzenia w Asystencie Bezpiecznej Naprawy.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">§ 3. Podpowierzenie i wsparcie Administratora</h2>
            <p>
              1. Klient wyraża ogólną zgodę na korzystanie przez Podmiot Przetwarzający z podwykonawców
              infrastrukturalnych (subprocesorów) świadczących usługi hostingu aplikacji i zarządzanej bazy danych
              (np. Vercel Inc., dostawca bazy PostgreSQL) przy zachowaniu adekwatnych zabezpieczeń RODO / Standardowych
              Klauzul Umownych (SCC).
            </p>
            <p>
              2. W przypadku stwierdzenia naruszenia ochrony danych osobowych Podmiot Przetwarzający poinformuje
              Powierzającego bez zbędnej zwłoki, nie później niż w ciągu <strong className="text-white">48 godzin</strong>{" "}
              od wykrycia incydentu.
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed border-t border-white/[0.08] pt-6">
            <h2 className="text-lg font-semibold text-white">§ 4. Usunięcie danych po zakończeniu umowy</h2>
            <p>
              Po zakończeniu świadczenia usług lub po usunięciu konta przez Klienta w panelu <em>Ustawienia</em>,
              wszystkie zaszyfrowane tokeny API, połączenia oraz historia skanów są nieodwracalnie usuwane z bazy
              danych BaseDoctor.
            </p>
          </section>

          <div className="pt-4 flex flex-wrap gap-4 text-xs text-zinc-400 border-t border-white/[0.08]">
            <Link href="/regulamin" className="text-[#2DD4BF] hover:underline">
              Regulamin Świadczenia Usług (B2B)
            </Link>
            <Link href="/polityka-prywatnosci" className="text-[#2DD4BF] hover:underline flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Polityka Prywatności i Cookies</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
