"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import {
  User,
  Lock,
  Bell,
  CheckCircle2,
  Save,
  ShieldCheck,
  Download,
  Trash2,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [rodoError, setRodoError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
          setName(data.user.name || "");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 500);
  };

  const handleExportData = async () => {
    setRodoError(null);
    setExporting(true);
    try {
      const res = await fetch("/api/auth/account");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Nie udało się pobrać eksportu danych.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "basedoctor-rodo-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setRodoError(err instanceof Error ? err.message : "Błąd eksportu danych");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setRodoError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Nie udało się usunąć konta.");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setRodoError(err instanceof Error ? err.message : "Błąd usuwania konta");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#18181B]">
      <AppSidebar
        connectionsCount={1}
        activeStoreName={user?.name || "Twoje konto"}
        isDemo={false}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <h1 className="text-sm sm:text-base font-semibold text-[#18181B] truncate">
            Ustawienia konta
          </h1>
        </header>

        <div className="p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#18181B]">
              Twój profil i powiadomienia
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B]">
              Zarządzaj swoimi danymi i ustaw, kiedy chcesz dostawać informacje o problemach w sklepie.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Zmiany zostały zapisane.</span>
            </div>
          )}

          {loading ? (
            <div className="studio-card p-12 text-center text-xs text-[#71717A] animate-pulse">
              Ładowanie ustawień...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Profile & Security Reassurance */}
              <div className="space-y-4">
                <div className="studio-card p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-base">
                      {(user?.name || user?.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#18181B] truncate">
                        {user?.name || "Właściciel sklepu"}
                      </div>
                      <div className="text-xs text-[#71717A] truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="studio-card p-5 space-y-2.5 bg-[#F0FDFA]/50 border-[#99F6E4]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E]">
                    <Lock className="w-4 h-4" />
                    <span>Gwarancja bezpieczeństwa</span>
                  </div>
                  <p className="text-xs text-[#3F3F46] leading-relaxed">
                    Twoje klucze dostępu są szyfrowane i nigdy nie są udostępniane na zewnątrz. BaseDoctor działa wyłącznie w trybie odczytu.
                  </p>
                  <div className="pt-2 border-t border-[#CCFBF1] text-[11px] text-[#047857] flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zero zmian w cenach i zamówieniach</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Settings Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="studio-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0F766E]" />
                      <span>Dane podstawowe</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">
                          Twoje imię lub nazwa firmy
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">
                          Adres e-mail do logowania
                        </label>
                        <input
                          type="email"
                          disabled
                          value={user?.email || ""}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#71717A] bg-[#F3F0EA] cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="studio-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#0F766E]" />
                      <span>Powiadomienia o sklepie</span>
                    </h3>

                    <div className="space-y-3.5 text-xs">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailAlerts}
                          onChange={(e) => setEmailAlerts(e.target.checked)}
                          className="mt-0.5 rounded border-[#E8E4DC] text-[#0F766E] focus:ring-[#0F766E]"
                        />
                        <div>
                          <span className="font-semibold text-[#18181B] block">
                            Powiadamiaj mnie od razu o pilnych błędach
                          </span>
                          <span className="text-[#71717A]">
                            Otrzymasz wiadomość, jeśli wykryjemy zdublowane produkty, ujemne stany lub wysłane nieopłacone paczki.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={weeklyDigest}
                          onChange={(e) => setWeeklyDigest(e.target.checked)}
                          className="mt-0.5 rounded border-[#E8E4DC] text-[#0F766E] focus:ring-[#0F766E]"
                        />
                        <div>
                          <span className="font-semibold text-[#18181B] block">
                            Cotygodniowe podsumowanie kondycji sklepu
                          </span>
                          <span className="text-[#71717A]">
                            Krótki raport w każdy poniedziałek rano z ogólnym wynikiem Twojego sklepu.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-studio-brand py-2.5 px-6 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? "Zapisywanie..." : "Zapisz ustawienia"}</span>
                    </button>
                  </div>
                </form>

                {/* Prywatność, RODO i Zarządzanie Danymi */}
                <div className="studio-card p-6 space-y-5 border border-[#E8E4DC]">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E4DC]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                      <h3 className="text-sm font-semibold text-[#18181B]">
                        Prywatność, RODO i Zarządzanie Danymi
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium text-[#71717A]">
                      Art. 17 &amp; Art. 20 RODO
                    </span>
                  </div>

                  {rodoError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      {rodoError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs">
                    <Link
                      href="/regulamin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E4DC] bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#18181B] font-medium transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Regulamin B2B</span>
                    </Link>
                    <Link
                      href="/polityka-prywatnosci"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E4DC] bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#18181B] font-medium transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Polityka Prywatności</span>
                    </Link>
                    <Link
                      href="/dpa"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E4DC] bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#18181B] font-medium transition"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Umowa Powierzenia (DPA)</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-semibold text-[#18181B] mb-1">
                          Eksport danych konta (Art. 20 RODO)
                        </h4>
                        <p className="text-[11px] text-[#71717A] leading-relaxed">
                          Pobierz pełną kopię swoich danych, połączeń i historii raportów w formacie JSON.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportData}
                        disabled={exporting}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-[#0F766E]/30 bg-white hover:bg-[#CCFBF1]/40 text-[#0F766E] text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{exporting ? "Generowanie JSON..." : "Pobierz moje dane (JSON)"}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-semibold text-red-900 mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Usuń konto (Art. 17 RODO)</span>
                        </h4>
                        <p className="text-[11px] text-red-800/80 leading-relaxed">
                          Trwale usuwa konto, zaszyfrowane tokeny API oraz wszystkie raporty skanów.
                        </p>
                      </div>

                      {!deleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(true)}
                          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-red-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Usuń konto i dane</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                          >
                            <span>{deleting ? "Usuwanie..." : "Potwierdź trwałe usunięcie"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(false)}
                            disabled={deleting}
                            className="px-3 py-2 rounded-lg border border-[#E8E4DC] bg-white text-[#18181B] text-xs font-medium cursor-pointer"
                          >
                            Anuluj
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
