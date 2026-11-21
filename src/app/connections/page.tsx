"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
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
  Database,
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
    return Boolean(isMaskedDemo || isNamedDemo);
  };

  const activeStore = connections[0];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#111315]">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        connectionsCount={connections.length}
        activeStoreName={activeStore?.name || "Brak połączonego sklepu"}
        isDemo={activeStore ? isDemo(activeStore) : false}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Workspace Top Header */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-[#5C6168]">Infrastruktura Danych</span>
            <span className="text-[#CFCBC2]">/</span>
            <h1 className="text-xs sm:text-sm font-semibold text-[#111315] truncate">
              Integracje Base.com
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FAF9F6] border border-[#E5E3DC] text-[#5C6168]">
              {connections.length} {connections.length === 1 ? "sklep" : "sklepy"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://panel.baselinker.com"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary-surface text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#5C6168]" />
              <span className="hidden sm:inline">Panel Base.com</span>
            </a>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Security Specification Card */}
          <div className="pci-card p-5 bg-[#FFFFFF] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] flex items-center justify-center shrink-0 text-[#0052FF]">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111315]">
                    Szyfrowanie Poświadczeń AES-256-GCM
                  </h2>
                  <span className="badge-active text-[10px]">Tryb Read-Only</span>
                </div>
                <p className="text-xs text-[#5C6168] max-w-3xl leading-relaxed">
                  Twój token API jest natychmiast szyfrowany algorytmem AES-256-GCM z losowym wektorem IV
                  i tagiem uwierzytelniającym przed zapisem w bazie. Token nigdy nie trafia do przeglądarki
                  ani logów, a silnik diagnostyczny wykonuje wyłącznie zapytania odczytu.
                </p>
              </div>
            </div>
            <div className="font-mono text-xs text-[#046C4E] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded shrink-0 font-semibold">
              TLS 1.3 • connector.php
            </div>
          </div>

          {/* Step-by-Step Onboarding Guide */}
          <div className="pci-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#111315] font-semibold text-xs">
              <HelpCircle className="w-4 h-4 text-[#0052FF]" />
              <span>Instrukcja generowania tokena API w BaseLinkerze</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-md bg-[#FAF9F6] border border-[#EFECE6] space-y-1">
                <div className="font-mono text-[10px] font-bold text-[#868C94]">KROK 01</div>
                <div className="font-semibold text-[#111315]">Zaloguj się</div>
                <p className="text-[11px] text-[#5C6168] leading-relaxed">
                  Zaloguj się na swoje konto w panel.baselinker.com.
                </p>
              </div>
              <div className="p-3.5 rounded-md bg-[#FAF9F6] border border-[#EFECE6] space-y-1">
                <div className="font-mono text-[10px] font-bold text-[#868C94]">KROK 02</div>
                <div className="font-semibold text-[#111315]">Przejdź do API</div>
                <p className="text-[11px] text-[#5C6168] leading-relaxed">
                  Kliknij profil konta → <strong>Moje konto</strong> → zakładka <strong>API</strong>.
                </p>
              </div>
              <div className="p-3.5 rounded-md bg-[#FAF9F6] border border-[#EFECE6] space-y-1">
                <div className="font-mono text-[10px] font-bold text-[#868C94]">KROK 03</div>
                <div className="font-semibold text-[#111315]">Skopiuj Token</div>
                <p className="text-[11px] text-[#5C6168] leading-relaxed">
                  Skopiuj ciąg znaków tokenu. Rekomendujemy uprawnienia tylko do odczytu.
                </p>
              </div>
              <div className="p-3.5 rounded-md bg-[#FAF9F6] border border-[#EFECE6] space-y-1">
                <div className="font-mono text-[10px] font-bold text-[#868C94]">KROK 04</div>
                <div className="font-semibold text-[#111315]">Wklej i zdiagnozuj</div>
                <p className="text-[11px] text-[#5C6168] leading-relaxed">
                  Wklej token w formularzu poniżej. System zweryfikuje połączenie.
                </p>
              </div>
            </div>
          </div>

          {/* Form and Connections List (1:2 Split) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Connection Card */}
            <div className="pci-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0052FF]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111315]">
                  Podłącz Nowy Sklep
                </h2>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#046C4E]"
                      : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <form onSubmit={handleAddConnection} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                    Nazwa Sklepu / Identyfikator
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Główny Sklep BaseLinker"
                    className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C6168] mb-1">
                    Token API Base.com (X-BLToken)
                  </label>
                  <input
                    type="password"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Wklej token z panelu BaseLinker"
                    className="w-full px-3 py-2 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#373B40]">
                  <input
                    type="checkbox"
                    checked={testBeforeSave}
                    onChange={(e) => setTestBeforeSave(e.target.checked)}
                    className="rounded border-[#E5E3DC] text-[#0052FF] focus:ring-[#0052FF]"
                  />
                  <span>Zweryfikuj ważność tokenu przed zapisem</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-cobalt w-full py-2.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submitting ? "Szyfrowanie i test..." : "Zapisz i Zaszyfruj Token"}</span>
                </button>
              </form>

              {/* 1-Click Synthetic Demo Button */}
              <div className="pt-4 border-t border-[#EFECE6] space-y-2">
                <button
                  type="button"
                  onClick={handleLoadDemoStore}
                  disabled={submitting}
                  className="btn-secondary-surface w-full py-2.5 cursor-pointer text-xs text-[#0052FF] border-[#C7D7FE] bg-[#EDF2FF] hover:bg-[#DBE4FF]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>Załaduj Sklep Demonstracyjny (Demo)</span>
                </button>
                <p className="text-[10px] text-[#868C94] text-center">
                  Tworzy bezpieczne środowisko z syntetycznymi danymi testowymi.
                </p>
              </div>
            </div>

            {/* Existing Connections Roster */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="pci-eyebrow">Zarejestrowane Magazyny Kluczy</span>
                <span className="font-mono text-[11px] text-[#5C6168]">
                  Standard AES-256-GCM
                </span>
              </div>

              {loading ? (
                <div className="pci-card p-12 text-center text-xs text-[#5C6168] font-mono animate-pulse">
                  Ładowanie połączeń...
                </div>
              ) : connections.length === 0 ? (
                <div className="pci-card p-12 text-center space-y-3">
                  <div className="w-10 h-10 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-[#0052FF] mx-auto flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#111315] text-sm">Brak podłączonych sklepów</h3>
                  <p className="text-xs text-[#5C6168] max-w-sm mx-auto">
                    Wklej token API Base.com w formularzu obok lub kliknij przycisk trybu demonstracyjnego.
                  </p>
                  <button
                    onClick={handleLoadDemoStore}
                    className="btn-primary-cobalt inline-flex cursor-pointer mt-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Załaduj Sklep Demonstracyjny</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((conn) => {
                    const demoMode = isDemo(conn);
                    return (
                      <div
                        key={conn.id}
                        className="pci-card p-5 space-y-3 hover:border-[#CFCBC2] transition"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-[#111315] text-sm">{conn.name}</h3>
                              {demoMode ? (
                                <span className="badge-demo">DEMO • SYNTETYCZNE</span>
                              ) : (
                                <span className="badge-active">
                                  <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                                  API AKTYWNE
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-[#5C6168] mt-1">
                              Zaszyfrowany token: <span className="text-[#111315] font-semibold">{conn.maskedToken}</span> • Dodano:{" "}
                              {new Date(conn.createdAt).toLocaleDateString("pl-PL")}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => handleTestConnection(conn.id)}
                              disabled={testingId === conn.id}
                              className="btn-secondary-surface py-1.5 px-3 text-xs cursor-pointer"
                              title="Zweryfikuj komunikację z API"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                  testingId === conn.id ? "animate-spin text-[#0052FF]" : "text-[#5C6168]"
                                }`}
                              />
                              <span>{testingId === conn.id ? "Test..." : "Test Połączenia"}</span>
                            </button>

                            <button
                              onClick={() => handleRunScan(conn.id)}
                              disabled={scanningId === conn.id}
                              className="btn-primary-cobalt py-1.5 px-3 text-xs cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>{scanningId === conn.id ? "Skanowanie..." : "Uruchom Skan"}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteConnection(conn.id, conn.name)}
                              disabled={deletingId === conn.id}
                              className="p-2 rounded-md border border-[#E5E3DC] text-[#868C94] hover:text-[#B91C1C] hover:bg-[#FEF2F2] hover:border-[#FECACA] transition cursor-pointer"
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
      </div>
    </div>
  );
}
