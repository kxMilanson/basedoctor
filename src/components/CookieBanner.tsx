"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";

const CONSENT_STORAGE_KEY = "basedoctor_cookie_consent";

interface CookieConsentState {
  essential: true;
  analytics: boolean;
  updatedAt: string;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }

    const handleOpenSettings = () => {
      setVisible(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenSettings);
    };
  }, []);

  const saveConsent = (analytics: boolean) => {
    const payload: CookieConsentState = {
      essential: true,
      analytics,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write errors in restricted environments
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Ustawienia plików cookies"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl border border-white/[0.12] bg-[#0F1219]/95 backdrop-blur-xl p-5 shadow-2xl text-zinc-200"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Cookie className="w-4 h-4 text-[#2DD4BF]" />
            <span>Szanujemy Twoją prywatność (RODO &amp; PKE)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Używamy wyłącznie niezbędnych plików cookies do utrzymania bezpiecznej sesji logowania oraz opcjonalnej
            analityki działania serwisu. Szczegóły znajdziesz w{" "}
            <Link href="/polityka-prywatnosci" className="text-[#2DD4BF] hover:underline font-medium">
              Polityce Prywatności i Cookies
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => saveConsent(false)}
            className="px-4 py-2.5 rounded-xl border border-white/[0.16] bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold transition cursor-pointer"
          >
            Tylko niezbędne
          </button>
          <button
            type="button"
            onClick={() => saveConsent(true)}
            className="px-4 py-2.5 rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 text-[#2DD4BF] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Akceptuj wszystkie</span>
          </button>
        </div>
      </div>
    </div>
  );
}
