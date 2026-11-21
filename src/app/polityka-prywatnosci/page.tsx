import Link from "next/link";
import { ShieldCheck, Cookie, ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Polityka Prywatności i Plików Cookies — BaseDoctor",
  description:
    "Informacje o przetwarzaniu danych osobowych (RODO) oraz wykorzystywaniu plików cookies zgodnie z Prawem Komunikacji Elektronicznej (PKE).",
};

export default function PolitykaPrywatnosciPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RODO Art. 13/14 • Prawo Komunikacji Elektronicznej (PKE)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Polityka Prywatności i Plików Cookies
            </h1>
            <p className="text-xs text-zinc-400">
              Obowiązuje od dnia publikacji • Zgodność z RODO (UE 2016/679) oraz polską ustawą PKE
            </p>
          </header>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-amber-200 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">[Dane Administratora do uzupełnienia]:</strong>{" "}
              Administratorem Twoich danych osobowych jest{" "}
              <span className="underline decoration-amber-400/50">
                [Pełna nazwa firmy, Adres, NIP, REGON]
              </span>
              . Kontakt w sprawach ochrony danych osobowych:{" "}
              <span className="underline decoration-amber-400/50">[rodo@twojadomena.pl]</span>.
            </div>
          </div>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">1. Cele i podstawy prawne przetwarzania (Art. 6 RODO)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Świadczenie usługi konta i diagnostyki (Art. 6 ust. 1 lit. b RODO):</strong>{" "}
                przetwarzamy imię/nazwę użytkownika, adres e-mail oraz zaszyfrowane tokeny integracji wyłącznie w celu
                realizacji umowy o świadczenie usług drogą elektroniczną.
              </li>
              <li>
                <strong className="text-white">Obsługa zapytań z formularza kontaktowego (Art. 6 ust. 1 lit. f RODO):</strong>{" "}
                prawnie uzasadniony interes Administratora polegający na udzieleniu odpowiedzi na zapytanie handlowe
                lub prośbę o audyt.
              </li>
              <li>
                <strong className="text-white">Bezpieczeństwo i rozliczalność (Art. 6 ust. 1 lit. f oraz c RODO):</strong>{" "}
                logi techniczne, zapobieganie nadużyciom oraz realizacja obowiązków podatkowych/księgowych w przypadku
                usług płatnych.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">2. Zasada Minimalizacji Danych (Privacy by Design)</h2>
            <p>
              BaseDoctor został zaprojektowany zgodnie z zasadą minimalizacji danych. Podczas skanowania systemów
              sprzedażowych (np. Base.com) aplikacja pobiera wyłącznie dane techniczne (SKU, wagi, stany magazynowe,
              statusy techniczne zamówień) i <strong className="text-white">nie gromadzi danych osobowych konsumentów końcowych</strong>{" "}
              (takich jak imiona, nazwiska, adresy dostawy, numery telefonów czy adresy e-mail kupujących).
            </p>
          </section>

          <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-lg font-semibold text-white">3. Twoje prawa na gruncie RODO</h2>
            <p>Przysługuje Ci prawo do:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Dostępu do swoich danych oraz otrzymania ich kopii (Art. 15 RODO),</li>
              <li>Sprostowania danych (Art. 16 RODO),</li>
              <li>
                <strong className="text-white">Usunięcia danych („prawo do bycia zapomnianym”, Art. 17 RODO)</strong>{" "}
                — dostępne bezpośrednio jednym kliknięciem w zakładce <em>Ustawienia</em>,
              </li>
              <li>
                <strong className="text-white">Przenoszenia danych (Art. 20 RODO)</strong> — eksport wszystkich danych
                konta, połączeń i raportów w formacie JSON bezpośrednio z zakładki <em>Ustawienia</em>,
              </li>
              <li>Ograniczenia przetwarzania oraz wniesienia sprzeciwu (Art. 18 i 21 RODO),</li>
              <li>
                Wniesienia skargi do organu nadzorczego — Prezesa Urzędu Ochrony Danych Osobowych (UODO, ul. Stawki 2,
                00-193 Warszawa).
              </li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-zinc-300 leading-relaxed">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[#2DD4BF]" />
              <h2 className="text-lg font-semibold text-white">4. Pliki Cookies i technologie śledzące (PKE)</h2>
            </div>
            <p>
              Serwis korzysta wyłącznie z niezbędnych plików cookies i lokalnej pamięci przeglądarki potrzebnych do
              utrzymania bezpiecznej sesji logowania oraz zapamiętania Twojego wyboru zgody cookie. Ewentualne cookies
              analityczne są aktywowane wyłącznie po wyrażeniu wyraźnej zgody w banerze cookies.
            </p>

            <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-zinc-200 border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Nazwa</th>
                    <th className="py-3 px-4 font-semibold">Typ / Cel</th>
                    <th className="py-3 px-4 font-semibold">Czas życia</th>
                    <th className="py-3 px-4 font-semibold">Wymagana zgoda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                  <tr>
                    <td className="py-3 px-4 font-mono text-[#2DD4BF]">basedoctor_session</td>
                    <td className="py-3 px-4">Niezbędne (HttpOnly JWT) — uwierzytelnianie sesji Użytkownika</td>
                    <td className="py-3 px-4">7 dni / sesja</td>
                    <td className="py-3 px-4 text-[#10B981] font-medium">Nie (niezbędne technicznie)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-[#2DD4BF]">basedoctor_cookie_consent</td>
                    <td className="py-3 px-4">Preferencje (localStorage) — zapamiętanie decyzji z banera cookies</td>
                    <td className="py-3 px-4">Bezterminowo (do resetu)</td>
                    <td className="py-3 px-4 text-[#10B981] font-medium">Nie (realizacja PKE/RODO)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-zinc-400">Opcjonalna analityka</td>
                    <td className="py-3 px-4">Statystyki wydajności i diagnostyka UX (jeśli włączone)</td>
                    <td className="py-3 px-4">Zgodnie z wyborem</td>
                    <td className="py-3 px-4 text-amber-300 font-medium">Tak (wyraźna zgoda)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="pt-4 flex flex-wrap gap-4 text-xs text-zinc-400 border-t border-white/[0.08]">
            <Link href="/regulamin" className="text-[#2DD4BF] hover:underline">
              Regulamin Świadczenia Usług (B2B)
            </Link>
            <Link href="/dpa" className="text-[#2DD4BF] hover:underline">
              Umowa Powierzenia Danych (DPA)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
