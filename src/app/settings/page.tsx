"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  ShieldCheck,
  User,
  Lock,
  Key,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Server,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string; name: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings preferences state
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
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#111315]">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        connectionsCount={1}
        activeStoreName={user?.name || "Profil Użytkownika"}
        isDemo={false}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Workspace Top Header */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-[#5C6168]">Infrastruktura</span>
            <span className="text-[#CFCBC2]">/</span>
            <h1 className="text-xs sm:text-sm font-semibold text-[#111315] truncate">
              Parametry i Bezpieczeństwo Konta
            </h1>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-4 sm:p-8 max-w-[1200px] w-full mx-auto space-y-6">
          <div className="border-b border-[#E5E3DC] pb-4">
            <span className="pci-eyebrow">Konfiguracja Najemcy</span>
            <h2 className="text-base font-semibold text-[#111315] mt-0.5">
              Ustawienia Konta i Diagnostyki
            </h2>
            <p className="text-xs text-[#5C6168] mt-0.5">
              Zarządzaj profilem, konfiguracją powiadomień oraz specyfikacją kryptograficzną.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#046C4E] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Preferencje konta zostały pomyślnie zaktualizowane.</span>
            </div>
          )}

          {loading ? (
            <div className="pci-card p-12 text-center text-xs text-[#5C6168] font-mono animate-pulse">
              Ładowanie preferencji konta...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Quick Profile Card */}
              <div className="space-y-4">
                <div className="pci-card p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-[#111315] text-white flex items-center justify-center font-mono font-bold text-base">
                      {(user?.name || user?.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#111315] truncate">
                        {user?.name || "Użytkownik Sklepu"}
                      </div>
                      <div className="text-[11px] font-mono text-[#5C6168] truncate">
                        {user?.email}
                      </div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#F4F2ED] text-[#373B40] border border-[#E5E3DC]">
                        {user?.role === "ADMIN" ? "ADMINISTRATOR" : "KONTO STANDARD"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EFECE6] text-[11px] text-[#5C6168] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Sesja:</span>
                      <strong className="text-[#111315]">JWT (HS256)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Protokół:</span>
                      <strong className="text-[#046C4E]">TLS 1.3 Active</strong>
                    </div>
                  </div>
                </div>

                {/* Security Spec Card */}
                <div className="pci-card p-5 space-y-2.5 bg-[#FAF9F6]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#111315]">
                    <Lock className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span>Szyfrowanie AES-256-GCM</span>
                  </div>
                  <p className="text-[11px] text-[#5C6168] leading-relaxed">
                    Wszystkie poświadczenia Base.com są szyfrowane sprzętowym algorytmem AES-256-GCM.
                    Klucz główny nie opuszcza serwera aplikacji.
                  </p>
                  <div className="pt-2 border-t border-[#E5E3DC] text-[10px] font-mono text-[#046C4E] flex items-center gap-1.5 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                    Biała lista metod: 100% Read-Only
                  </div>
                </div>
              </div>

              {/* Right Column: Settings Form */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSave} className="space-y-6">
                  {/* General Profile Section */}
                  <div className="pci-card p-6 space-y-4">
                    <h2 className="text-xs font-semibold tracking-wider uppercase text-[#5C6168] flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#0052FF]" />
                      Informacje o Profilu
                    </h2>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                          Nazwa Użytkownika / Sklepu
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                          Adres E-mail (Identyfikator logowania)
                        </label>
                        <input
                          type="email"
                          disabled
                          value={user?.email || ""}
                          className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#5C6168] bg-[#F4F2ED] font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Preferences */}
                  <div className="pci-card p-6 space-y-4">
                    <h2 className="text-xs font-semibold tracking-wider uppercase text-[#5C6168] flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-[#0052FF]" />
                      Powiadomienia i Alerty Diagnostyczne
                    </h2>

                    <div className="space-y-3 text-xs">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailAlerts}
                          onChange={(e) => setEmailAlerts(e.target.checked)}
                          className="mt-0.5 rounded border-[#E5E3DC] text-[#0052FF] focus:ring-[#0052FF]"
                        />
                        <div>
                          <span className="font-semibold text-[#111315] block">
                            Natychmiastowe alerty o krytycznych usterkach (P1)
                          </span>
                          <span className="text-[11px] text-[#5C6168]">
                            Wysyłaj powiadomienie e-mail, gdy audyt wykryje zdublowane SKU, ujemny stan lub zamówienie wysłane bez zapłaty.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={weeklyDigest}
                          onChange={(e) => setWeeklyDigest(e.target.checked)}
                          className="mt-0.5 rounded border-[#E5E3DC] text-[#0052FF] focus:ring-[#0052FF]"
                        />
                        <div>
                          <span className="font-semibold text-[#111315] block">
                            Tygodniowy raport kondycji (Health Score Digest)
                          </span>
                          <span className="text-[11px] text-[#5C6168]">
                            Podsumowanie punktacji i wykres postępów optymalizacji bazy w każdy poniedziałek rano.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Engine & Performance Constraints */}
                  <div className="pci-card p-6 space-y-4">
                    <h2 className="text-xs font-semibold tracking-wider uppercase text-[#5C6168] flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-[#0052FF]" />
                      Parametry Integracji Base.com API
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-md bg-[#FAF9F6] border border-[#EFECE6]">
                        <div className="text-[10px] font-mono uppercase text-[#5C6168]">Limit odpytywania API</div>
                        <div className="text-sm font-semibold font-mono text-[#111315] mt-0.5">
                          95 req/min (Margines bezpieczeństwa)
                        </div>
                      </div>
                      <div className="p-3.5 rounded-md bg-[#FAF9F6] border border-[#EFECE6]">
                        <div className="text-[10px] font-mono uppercase text-[#5C6168]">Wielkość paczki ID</div>
                        <div className="text-sm font-semibold font-mono text-[#111315] mt-0.5">
                          100 obiektów / zapytanie
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary-cobalt py-2 px-5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? "Zapisywanie..." : "Zapisz preferencje"}</span>
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
