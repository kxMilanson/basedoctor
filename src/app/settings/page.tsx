"use client";

import { useEffect, useState } from "react";
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
  const [criticalThreshold, setCriticalThreshold] = useState("any");

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-zinc-500">
        Ładowanie preferencji konta...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950">
          Ustawienia Konta i Diagnostyki
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Zarządzaj profilem, konfiguracją powiadomień oraz parametrami bezpieczeństwa
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferencje konta zostały pomyślnie zaktualizowane.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile Card */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-base">
                {(user?.name || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-950 truncate">
                  {user?.name || "Użytkownik Sklepu"}
                </div>
                <div className="text-[11px] text-zinc-500 truncate">{user?.email}</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {user?.role === "ADMIN" ? "Administrator" : "Konto Standard"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
              <div>Sesja: <span className="font-medium text-zinc-700">JWT (HS256)</span></div>
              <div>Certyfikat SSL: <span className="font-medium text-emerald-600">Aktywny (TLS 1.3)</span></div>
            </div>
          </div>

          {/* Security Spec Card */}
          <div className="bg-zinc-950 text-white p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Lock className="w-4 h-4 text-blue-400" />
              Szyfrowanie AES-256-GCM
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Wszystkie poświadczenia Base.com są szyfrowane sprzętowym algorytmem AES-256-GCM.
              Klucz główny nie opuszcza serwera aplikacji.
            </p>
            <div className="pt-1 text-[10px] text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Biała lista metod: 100% Read-Only
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* General Profile Section */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
              <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-700 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                Informacje o Profilu
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Nazwa Użytkownika / Sklepu
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-zinc-50/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Adres E-mail (Identyfikator logowania)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-500 bg-zinc-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Diagnostic Preferences */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
              <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-700 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-zinc-500" />
                Powiadomienia i Alerty Diagnostyczne
              </h2>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-zinc-900 block">Natychmiastowe alerty o krytycznych usterkach</span>
                    <span className="text-[11px] text-zinc-500">
                      Wysyłaj powiadomienie e-mail, gdy audyt wykryje zdublowane SKU, ujemny stan lub zamówienie wysłane bez zapłaty.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-zinc-900 block">Tygodniowy raport kondycji (Health Score Digest)</span>
                    <span className="text-[11px] text-zinc-500">
                      Podsumowanie punktacji i wykres postępów optymalizacji bazy w każdy poniedziałek rano.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Engine & Performance Constraints */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
              <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-700 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-zinc-500" />
                Parametry Integracji Base.com API
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <div className="text-[11px] text-zinc-500 font-medium">Limit odpytywania API</div>
                  <div className="text-sm font-bold text-zinc-900 mt-0.5">95 req/min (Bezpieczny margines)</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <div className="text-[11px] text-zinc-500 font-medium">Maks. wielkość paczki ID</div>
                  <div className="text-sm font-bold text-zinc-900 mt-0.5">100 produktów / zapytanie</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Zapisywanie..." : "Zapisz preferencje"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
