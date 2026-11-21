"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  ShieldCheck,
  Plus,
  Play,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Info,
} from "lucide-react";

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New connection form state
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [testBeforeSave, setTestBeforeSave] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Actions state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, token, testBeforeSave }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd dodawania połączenia.");
      }

      setFeedback({
        type: "success",
        text: "Klucz API Base.com został pomyślnie zaszyfrowany i zapisany!",
      });
      setName("");
      setToken("");
      fetchConnections();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadDemoStore = async () => {
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Sklep Demonstracyjny (Dane Syntetyczne)",
          token: "demo_bl_token_8899aabbcc",
          testBeforeSave: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd ładowania sklepu demo.");
      }
      setFeedback({
        type: "success",
        text: "Załadowano sklep demonstracyjny z syntetycznymi danymi!",
      });
      fetchConnections();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/connections/${id}/test`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Test połączenia nie powiódł się.");
      }
      alert(`Sukces: ${data.message}`);
    } catch (err: any) {
      alert(`Błąd: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteConnection = async (id: string, shopName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć połączenie ze sklepem "${shopName}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/connections/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd usuwania połączenia.");
      }
      fetchConnections();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRunScan = async (id: string) => {
    setScanningId(id);
    try {
      const res = await fetch(`/api/connections/${id}/scan`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd uruchomienia audytu.");
      }
      router.push(`/scans/${data.report.id}`);
    } catch (err: any) {
      alert(err.message);
      setScanningId(null);
    }
  };

  const isDemo = (conn: any) => {
    const isMaskedDemo = conn.maskedToken && (conn.maskedToken.startsWith("demo_") || conn.maskedToken.includes("demo"));
    const isNamedDemo = conn.name && (conn.name.toLowerCase().includes("demo") || conn.name.toLowerCase().includes("syntetyczn"));
    return isMaskedDemo || isNamedDemo;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Zarządzanie Połączeniami Base.com
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Podłącz swój sklep BaseLinker / Base.com w trybie bezpiecznym tylko do odczytu
        </p>
      </div>

      {/* Security Info Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl shrink-0">
            <Lock className="w-6 h-6 text-blue-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              Szyfrowanie Poświadczeń AES-256-GCM
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-medium">
                Tryb Tylko do Odczytu
              </span>
            </h2>
            <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
              Twój token API jest natychmiast szyfrowany algorytmem AES-256-GCM z unikalnym wektorem IV
              i kluczem uwierzytelniającym TAG przed zapisem w bazie. Token nigdy nie jest zwracany do przeglądarki
              ani logów, a silnik diagnostyczny wykonuje wyłącznie operacje odczytu (brak metod modyfikujących).
            </p>
          </div>
        </div>
        <a
          href="https://panel.baselinker.com"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition"
        >
          Panel Base.com <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Step-by-Step Onboarding Guide */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Instrukcja krok po kroku: Jak bezpiecznie pobrać token z BaseLinkera?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">1</div>
            <div className="font-bold text-slate-900">Zaloguj się</div>
            <p className="text-slate-500">Wejdź na panel.baselinker.com i zaloguj się na swoje konto administracyjne.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</div>
            <div className="font-bold text-slate-900">Przejdź do API</div>
            <p className="text-slate-500">W lewym dolnym menu kliknij swoje imię/nazwę konta → <strong>Moje konto</strong> → zakładka <strong>API</strong>.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">3</div>
            <div className="font-bold text-slate-900">Skopiuj Token</div>
            <p className="text-slate-500">Skopiuj ciąg znaków tokenu (np. <code>1000123-1004567-xyz...</code>). Rekomendujemy profil z uprawnieniami do odczytu.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">4</div>
            <div className="font-bold text-slate-900">Wklej i audytuj</div>
            <p className="text-slate-500">Wklej token w formularzu poniżej. Skaner rozpocznie audyt bez modyfikowania żadnych danych sklepu.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Connection Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Podłącz Nowy Sklep
              </h2>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleAddConnection} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nazwa Sklepu / Identyfikator
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Mój Sklep Allegro / WooCommerce"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Token API Base.com (X-BLToken)
              </label>
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Wklej token z panelu BaseLinker"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="testConn"
                checked={testBeforeSave}
                onChange={(e) => setTestBeforeSave(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="testConn" className="text-xs text-slate-600 select-none">
                Zweryfikuj ważność tokenu przed zapisem
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition"
            >
              {submitting ? "Szyfrowanie i weryfikacja..." : "Zapisz i Zaszyfruj Token"}
            </button>
          </form>

          {/* 1-Click Demo Button */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 mb-2 font-medium">Nie masz pod ręką tokenu BaseLinkera?</div>
            <button
              type="button"
              onClick={handleLoadDemoStore}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Wypróbuj w trybie demonstracyjnym (Demo Store)
            </button>
            <span className="text-[11px] text-slate-400 mt-1.5 block text-center">
              Tworzy konto demonstracyjne z realistycznymi danymi testowymi.
            </span>
          </div>
        </div>

        {/* Existing Connections List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Podłączone Sklepy ({connections.length})
            </h2>
            {connections.length > 0 && (
              <span className="text-xs text-slate-400">
                Wszystkie poświadczenia są zaszyfrowane kluczem AES-256-GCM
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              Ładowanie połączeń...
            </div>
          ) : connections.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Brak podłączonych sklepów</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Aby uruchomić swój pierwszy audyt, wklej token API Base.com w formularzu po lewej stronie
                lub kliknij przycisk trybu demonstracyjnego.
              </p>
              <button
                onClick={handleLoadDemoStore}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Załaduj Sklep Demonstracyjny
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((conn) => {
                const demoMode = isDemo(conn);
                return (
                  <div
                    key={conn.id}
                    className={`bg-white p-5 rounded-2xl border shadow-sm space-y-4 transition ${
                      demoMode ? "border-purple-200 bg-purple-50/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{conn.name}</h3>
                          {demoMode ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-600" /> TRYB DEMO (Dane syntetyczne)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AKTYWNE (Oficjalne API Base.com)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Zaszyfrowany token: <code className="text-slate-600">{conn.maskedToken}</code> • Dodano:{" "}
                          {new Date(conn.createdAt).toLocaleDateString("pl-PL")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleTestConnection(conn.id)}
                          disabled={testingId === conn.id}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
                          title="Sprawdź poprawność komunikacji z API"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              testingId === conn.id ? "animate-spin text-blue-600" : ""
                            }`}
                          />
                          {testingId === conn.id ? "Test..." : "Test Połączenia"}
                        </button>

                        <button
                          onClick={() => handleRunScan(conn.id)}
                          disabled={scanningId === conn.id}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          {scanningId === conn.id ? "Skanowanie..." : "Uruchom Skan"}
                        </button>

                        <button
                          onClick={() => handleDeleteConnection(conn.id, conn.name)}
                          disabled={deletingId === conn.id}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition"
                          title="Usuń połączenie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
