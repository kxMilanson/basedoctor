"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Key,
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
        throw new Error(data.error || "Nie udało się zapisać połączenia.");
      }

      setFeedback({
        type: "success",
        text: "Sklep został bezpiecznie połączony! Możesz teraz uruchomić sprawdzenie.",
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
          name: "Sklep Przykładowy (Podgląd)",
          token: "demo_bl_token_8899aabbcc",
          testBeforeSave: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się przygotować sklepu przykładowego.");
      }
      setFeedback({
        type: "success",
        text: "Sklep przykładowy jest gotowy! Kliknij „Sprawdź sklep teraz”, aby zobaczyć raport.",
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
        throw new Error(data.error || "Nie udało się połączyć ze sklepem.");
      }
      alert(`Połączenie działa poprawnie: ${data.message}`);
    } catch (err: any) {
      alert(`Problem z połączeniem: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteConnection = async (id: string, shopName: string) => {
    if (!confirm(`Czy na pewno chcesz odłączyć sklep "${shopName}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/connections/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się usunąć połączenia.");
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
        throw new Error(data.error || "Nie udało się uruchomić sprawdzenia.");
      }
      router.push(`/scans/${data.report.id}`);
    } catch (err: any) {
      alert(err.message);
      setScanningId(null);
    }
  };

  const isDemo = (conn: any) => {
    const isMaskedDemo =
      conn.maskedToken &&
      (conn.maskedToken.startsWith("demo_") || conn.maskedToken.includes("demo"));
    const isNamedDemo =
      conn.name &&
      (conn.name.toLowerCase().includes("demo") ||
        conn.name.toLowerCase().includes("syntetyczn") ||
        conn.name.toLowerCase().includes("przykładow"));
    return Boolean(isMaskedDemo || isNamedDemo);
  };

  const activeStore = connections[0];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#18181B]">
      <AppSidebar
        connectionsCount={connections.length}
        activeStoreName={activeStore?.name || "Brak połączonego sklepu"}
        isDemo={activeStore ? isDemo(activeStore) : false}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#18181B] truncate">
              Połączone sklepy
            </h1>
            <span className="pill-neutral">
              {connections.length} {connections.length === 1 ? "sklep" : "sklepy"}
            </span>
          </div>

          <a
            href="https://panel.baselinker.com"
            target="_blank"
            rel="noreferrer"
            className="btn-studio-secondary text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Otwórz Base.com</span>
          </a>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Calm Read-Only Reassurance Banner */}
          <div className="studio-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center shrink-0 text-[#0F766E]">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#18181B]">
                    Połączenie bezpieczne — tylko do odczytu + Asystent Napraw z potwierdzeniem
                  </h2>
                  <span className="pill-healthy">Bez zmian bez Twojej zgody</span>
                </div>
                <p className="text-xs text-[#52525B] max-w-2xl leading-relaxed">
                  Twój klucz dostępu jest bezpiecznie zaszyfrowany. BaseDoctor wyłącznie przegląda
                  produkty, stany i zamówienia, aby przygotować raport — nigdy nie modyfikuje cen ani
                  ofert.
                </p>
              </div>
            </div>
          </div>

          {/* 4-Step Guide */}
          <div className="studio-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#18181B] font-semibold text-sm">
              <HelpCircle className="w-4 h-4 text-[#0F766E]" />
              <span>Jak w 1 minutę pobrać klucz dostępu z Base.com?</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-[11px] font-bold text-[#0F766E]">Krok 1</div>
                <div className="font-semibold text-[#18181B]">Zaloguj się do Base.com</div>
                <p className="text-[#52525B] leading-relaxed">
                  Wejdź na swoje konto w panelu BaseLinker / Base.com.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-[11px] font-bold text-[#0F766E]">Krok 2</div>
                <div className="font-semibold text-[#18181B]">Otwórz zakładkę API</div>
                <p className="text-[#52525B] leading-relaxed">
                  Kliknij ikonę profilu w rogu → <strong>Moje konto</strong> → <strong>API</strong>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-[11px] font-bold text-[#0F766E]">Krok 3</div>
                <div className="font-semibold text-[#18181B]">Skopiuj swój token</div>
                <p className="text-[#52525B] leading-relaxed">
                  Zaznacz i skopiuj wygenerowany ciąg znaków (token).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-[11px] font-bold text-[#0F766E]">Krok 4</div>
                <div className="font-semibold text-[#18181B]">Wklej obok i sprawdź</div>
                <p className="text-[#52525B] leading-relaxed">
                  Wklej klucz w formularzu poniżej i uruchom pierwsze badanie sklepu.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Connection Form */}
            <div className="studio-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0F766E]" />
                <h2 className="text-sm font-bold text-[#18181B]">
                  Dodaj nowy sklep
                </h2>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]"
                      : "bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C]"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <form onSubmit={handleAddConnection} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">
                    Nazwa sklepu (dla Twojej wygody)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Mój Sklep Główny"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">
                    Klucz dostępu (Token z Base.com)
                  </label>
                  <input
                    type="password"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Wklej skopiowany klucz..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#52525B]">
                  <input
                    type="checkbox"
                    checked={testBeforeSave}
                    onChange={(e) => setTestBeforeSave(e.target.checked)}
                    className="rounded border-[#E8E4DC] text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span>Sprawdź od razu, czy klucz działa poprawnie</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-studio-brand w-full py-2.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submitting ? "Zapisywanie..." : "Połącz sklep bezpiecznie"}</span>
                </button>
              </form>

              {/* 1-Click Demo Card */}
              <div className="pt-4 border-t border-[#F1EFEA] space-y-2">
                <button
                  type="button"
                  onClick={handleLoadDemoStore}
                  disabled={submitting}
                  className="btn-studio-secondary w-full py-2.5 cursor-pointer border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E] hover:bg-[#CCFBF1]/50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Wypróbuj na sklepie przykładowym</span>
                </button>
                <p className="text-[11px] text-[#71717A] text-center">
                  Jedno kliknięcie tworzy sklep testowy, aby zobaczyć jak działa raport.
                </p>
              </div>
            </div>

            {/* Connected Stores List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#18181B]">
                  Twoje sklepy ({connections.length})
                </h2>
              </div>

              {loading ? (
                <div className="studio-card p-12 text-center text-xs text-[#71717A] animate-pulse">
                  Ładowanie listy sklepów...
                </div>
              ) : connections.length === 0 ? (
                <div className="studio-card p-12 text-center space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] mx-auto flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#18181B] text-sm">
                    Nie masz jeszcze podłączonego żadnego sklepu
                  </h3>
                  <p className="text-xs text-[#52525B] max-w-sm mx-auto leading-relaxed">
                    Wklej swój klucz z Base.com w formularzu obok lub kliknij poniżej, aby obejrzeć
                    gotowy sklep przykładowy.
                  </p>
                  <button
                    onClick={handleLoadDemoStore}
                    className="btn-studio-brand inline-flex cursor-pointer mt-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Załaduj sklep przykładowy</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((conn) => {
                    const demoMode = isDemo(conn);
                    return (
                      <div
                        key={conn.id}
                        className="studio-card-hover p-5 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-[#18181B] text-sm">{conn.name}</h3>
                              {demoMode ? (
                                <span className="pill-demo">Sklep przykładowy</span>
                              ) : (
                                <span className="pill-healthy">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Połączony i bezpieczny
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#71717A] mt-1">
                              Klucz ukryty: <code className="font-mono text-[#3F3F46]">{conn.maskedToken}</code> • Dodano{" "}
                              {new Date(conn.createdAt).toLocaleDateString("pl-PL")}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => handleTestConnection(conn.id)}
                              disabled={testingId === conn.id}
                              className="btn-studio-secondary py-2 px-3 text-xs cursor-pointer"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                  testingId === conn.id ? "animate-spin text-[#0F766E]" : "text-[#71717A]"
                                }`}
                              />
                              <span>{testingId === conn.id ? "Sprawdzam..." : "Testuj"}</span>
                            </button>

                            <button
                              onClick={() => handleRunScan(conn.id)}
                              disabled={scanningId === conn.id}
                              className="btn-studio-brand py-2 px-3.5 text-xs cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>{scanningId === conn.id ? "Sprawdzanie..." : "Sprawdź sklep"}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteConnection(conn.id, conn.name)}
                              disabled={deletingId === conn.id}
                              className="p-2 rounded-xl border border-[#E8E4DC] text-[#71717A] hover:text-[#BE123C] hover:bg-[#FFF1F2] hover:border-[#FECDD3] transition cursor-pointer"
                              title="Odłącz sklep"
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
