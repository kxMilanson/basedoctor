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
  ChevronRight,
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
      {/* Page Header */}
      <div className="pb-4 border-b border-zinc-200/80">
        <h1 className="text-xl font-bold tracking-tight text-zinc-950">
          Zarządzanie Połączeniami Base.com
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Podłącz swój sklep BaseLinker / Base.com w trybie bezpiecznym tylko do odczytu
        </p>
      </div>

      {/* Security Guarantee Notice */}
      <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Szyfrowanie Poświadczeń AES-256-GCM
              </h2>
              <span className="text-[10px] bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full font-medium">
                Tryb Read-Only
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Twój token API jest natychmiast szyfrowany algorytmem AES-256-GCM z losowym wektorem IV
              i tagiem uwierzytelniającym przed zapisem w bazie. Token nigdy nie trafia do przeglądarki
              ani logów, a silnik diagnostyczny wykonuje wyłącznie zapytania odczytu.
            </p>
          </div>
        </div>
        <a
          href="https://panel.baselinker.com"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium text-white transition"
        >
          Panel Base.com <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </a>
      </div>

      {/* Step-by-Step Onboarding Guide */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Instrukcja krok po kroku: Jak bezpiecznie wygenerować token w BaseLinkerze?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
            <div className="font-mono text-[11px] font-bold text-zinc-400">KROK 01</div>
            <div className="font-bold text-zinc-900 text-xs">Zaloguj się</div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Wejdź na panel.baselinker.com i zaloguj się na swoje konto.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
            <div className="font-mono text-[11px] font-bold text-zinc-400">KROK 02</div>
            <div className="font-bold text-zinc-900 text-xs">Przejdź do API</div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              W menu kliknij profil konta → <strong>Moje konto</strong> → zakładka <strong>API</strong>.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
            <div className="font-mono text-[11px] font-bold text-zinc-400">KROK 03</div>
            <div className="font-bold text-zinc-900 text-xs">Skopiuj Token</div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Skopiuj ciąg znaków tokenu. Rekomendujemy profil tylko do odczytu.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1">
            <div className="font-mono text-[11px] font-bold text-zinc-400">KROK 04</div>
            <div className="font-bold text-zinc-900 text-xs">Wklej i audytuj</div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Wklej token w formularzu obok. System rozpocznie audyt bez edycji bazy.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Connection Form */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Podłącz Nowy Sklep
            </h2>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleAddConnection} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                Nazwa Sklepu / Identyfikator
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Sklep Główny Allegro"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-zinc-50/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                Token API Base.com (X-BLToken)
              </label>
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Wklej token z panelu BaseLinker"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-zinc-50/30"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={testBeforeSave}
                onChange={(e) => setTestBeforeSave(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Zweryfikuj ważność tokenu przed zapisem</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              {submitting ? "Szyfrowanie i test..." : "Zapisz i Zaszyfruj Token"}
            </button>
          </form>

          {/* 1-Click Demo Button */}
          <div className="pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleLoadDemoStore}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100/70 text-purple-800 border border-purple-200/80 font-semibold text-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Wypróbuj w trybie demo (Demo Store)
            </button>
            <span className="text-[11px] text-zinc-400 mt-1.5 block text-center">
              Tworzy konto demonstracyjne z realistycznymi danymi testowymi.
            </span>
          </div>
        </div>

        {/* Existing Connections List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Podłączone Sklepy ({connections.length})
            </h2>
            {connections.length > 0 && (
              <span className="text-[11px] text-zinc-400">
                Szyfrowanie AES-256-GCM
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-400 text-xs bg-white rounded-2xl border border-zinc-200/80">
              Ładowanie połączeń...
            </div>
          ) : connections.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-zinc-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 mx-auto flex items-center justify-center font-bold">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-zinc-900 text-sm">Brak podłączonych sklepów</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Wklej token API Base.com w formularzu obok lub kliknij przycisk trybu demonstracyjnego.
              </p>
              <button
                onClick={handleLoadDemoStore}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Załaduj Sklep Demonstracyjny
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => {
                const demoMode = isDemo(conn);
                return (
                  <div
                    key={conn.id}
                    className={`bg-white p-5 rounded-2xl border shadow-xs space-y-3 transition ${
                      demoMode ? "border-purple-200/90 bg-purple-50/20" : "border-zinc-200/80 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-zinc-950 text-xs">{conn.name}</h3>
                          {demoMode ? (
                            <span className="badge-demo">
                              <Sparkles className="w-3 h-3 text-purple-600" /> TRYB DEMO
                            </span>
                          ) : (
                            <span className="badge-active">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> API AKTYWNE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1">
                          Zaszyfrowany token: <code className="font-mono text-zinc-600">{conn.maskedToken}</code> • Dodano:{" "}
                          {new Date(conn.createdAt).toLocaleDateString("pl-PL")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleTestConnection(conn.id)}
                          disabled={testingId === conn.id}
                          className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Sprawdź poprawność komunikacji z API"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              testingId === conn.id ? "animate-spin text-blue-600" : "text-zinc-400"
                            }`}
                          />
                          {testingId === conn.id ? "Test..." : "Test Połączenia"}
                        </button>

                        <button
                          onClick={() => handleRunScan(conn.id)}
                          disabled={scanningId === conn.id}
                          className="px-3.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          {scanningId === conn.id ? "Skanowanie..." : "Uruchom Skan"}
                        </button>

                        <button
                          onClick={() => handleDeleteConnection(conn.id, conn.name)}
                          disabled={deletingId === conn.id}
                          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition cursor-pointer"
                          title="Usuń połączenie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
