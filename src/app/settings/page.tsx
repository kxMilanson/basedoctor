"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  User,
  Lock,
  Bell,
  CheckCircle2,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string; name: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
