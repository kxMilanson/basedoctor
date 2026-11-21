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

  // Testing connection state
  const [testingId, setTestingId] = useState<string | null>(null);

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

  const handleRunScan = async (id: string) => {
    try {
      const res = await fetch(`/api/connections/${id}/scan`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd uruchomienia audytu.");
      }
      router.push(`/scans/${data.report.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Zarządzanie Połączeniami Base.com
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Podłącz token API ze swojego panelu BaseLinker / Base.com w trybie bezpiecznym
        </p>
      </div>

      {/* Security Info Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Lock className="w-6 h-6 text-blue-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold">
              Bezpieczeństwo Poświadczeń API (AES-256-GCM)
            </h2>
            <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
              Twój token API jest szyfrowany algorytmem AES-256-GCM z unikalnym wektorem IV
              przed zapisem w bazie PostgreSQL. Token nigdy nie jest zwracany do przeglądarki
              w formie otwartego tekstu i jest używany wyłącznie do zapytań tylko do odczytu.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Connection Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Dodaj Nowy Sklep
            </h2>
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
                Nazwa Sklepu / Integracji
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Sklep Główny Base.com"
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
                placeholder="Wklej token z Konta BaseLinker"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Możesz użyć tokenu testowego wpisując <code>demo_token</code>.
              </span>
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
              {submitting ? "Szyfrowanie i zapisywanie..." : "Zapisz i Zaszyfruj"}
            </button>
          </form>
        </div>

        {/* Existing Connections List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Podłączone Sklepy ({connections.length})
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              Ładowanie połączeń...
            </div>
          ) : connections.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              Brak podłączonych sklepów. Wprowadź swój token API Base.com w formularzu obok.
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{conn.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {conn.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Token: <code className="text-slate-600">{conn.maskedToken}</code> • Dodano:{" "}
                        {new Date(conn.createdAt).toLocaleDateString("pl-PL")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestConnection(conn.id)}
                        disabled={testingId === conn.id}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
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
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Uruchom Skan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
