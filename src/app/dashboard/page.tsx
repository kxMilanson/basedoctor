"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  Info,
  Key,
  Layers,
  Package,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [activeScanMsg, setActiveScanMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [connRes, scanRes] = await Promise.all([
        fetch("/api/connections").then((res) => (res.ok ? res.json() : { connections: [] })),
        fetch("/api/scans").then((res) => (res.ok ? res.json() : { scans: [] })),
      ]);
      setConnections(connRes.connections || []);
      setScans(scanRes.scans || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latestScan = scans[0];

  const handleRunQuickScan = async () => {
    if (connections.length === 0) {
      router.push("/connections");
      return;
    }

    const targetConnId = connections[0].id;
    setScanning(true);
    setActiveScanMsg("Pobieranie danych z Base.com i uruchamianie silnika reguł...");

    try {
      const res = await fetch(`/api/connections/${targetConnId}/scan`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd wykonania skanu.");
      }
      router.push(`/scans/${data.report.id}`);
    } catch (err: any) {
      alert(err.message);
      setScanning(false);
      setActiveScanMsg(null);
    }
  };

  const handleLoadDemo = async () => {
    setScanning(true);
    setActiveScanMsg("Tworzenie demonstracyjnego połączenia...");
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
        throw new Error(data.error || "Błąd tworzenia demo.");
      }
      // Run scan on demo
      const scanRes = await fetch(`/api/connections/${data.connection.id}/scan`, {
        method: "POST",
      });
      const scanData = await scanRes.json();
      if (!scanRes.ok) {
        throw new Error(scanData.error || "Błąd skanowania demo.");
      }
      router.push(`/scans/${scanData.report.id}`);
    } catch (err: any) {
      alert(err.message);
      setScanning(false);
      setActiveScanMsg(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Ładowanie danych diagnostycznych...
      </div>
    );
  }

  const isDemoActive =
    (latestScan && (latestScan.shopConnection?.name?.toLowerCase().includes("demo") || latestScan.shopConnection?.name?.toLowerCase().includes("syntetyczn") || latestScan.id?.includes("demo"))) ||
    (connections.length > 0 && connections.some((c) => c.name?.toLowerCase().includes("demo") || c.maskedToken?.includes("demo")));

  const score = latestScan?.healthScore ?? 100;
  const scoreColor =
    score >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-rose-600 bg-rose-50 border-rose-200";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pulpit Diagnostyczny Sklepu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Status integralności bazy Base.com (Tylko do odczytu • Szyfrowanie AES-256-GCM)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/connections"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition"
          >
            <Key className="w-4 h-4 text-blue-600" />
            Połączenia API ({connections.length})
          </Link>
          <button
            onClick={handleRunQuickScan}
            disabled={scanning || connections.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            {scanning ? "Skanowanie w toku..." : "Uruchom Nowy Audyt"}
          </button>
        </div>
      </div>

      {/* Demo Notice Banner (if applicable) */}
      {isDemoActive && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <strong className="font-semibold">Tryb Demonstracyjny (Dane Syntetyczne):</strong>{" "}
              Przeglądasz wyniki audytu wygenerowane na podstawie syntetycznego zestawu testowego.
            </div>
          </div>
          <Link
            href="/connections"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shrink-0 transition"
          >
            Podłącz prawdziwy sklep <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Empty State Banner (if no connections) */}
      {connections.length === 0 && (
        <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="max-w-xl mx-auto space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Witaj w BaseDoctor! Rozpocznij diagnostykę swojego sklepu
            </h2>
            <p className="text-xs text-slate-600">
              Podłącz swój token API Base.com w trybie tylko do odczytu, aby wykryć zduplikowane SKU, ujemne stany i zablokowane zamówienia, lub wypróbuj aplikację na danych demonstracyjnych.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/connections"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Key className="w-4 h-4" /> Podłącz sklep Base.com
            </Link>
            <button
              onClick={handleLoadDemo}
              disabled={scanning}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              Wypróbuj w trybie demonstracyjnym
            </button>
          </div>
        </div>
      )}

      {activeScanMsg && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center gap-3 animate-pulse">
          <Activity className="w-5 h-5 text-blue-600 animate-spin" />
          <span>{activeScanMsg}</span>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Health Score Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kondycja Sklepu
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Health Score
              </h2>
            </div>
            {latestScan && (
              <span className="text-xs text-slate-400">
                Ostatni audyt: {new Date(latestScan.completedAt || latestScan.startedAt).toLocaleDateString("pl-PL")}
              </span>
            )}
          </div>

          <div className="my-6 flex items-baseline gap-4">
            <div className={`px-4 py-2 rounded-2xl text-4xl sm:text-5xl font-black border ${scoreColor}`}>
              {latestScan ? `${score}%` : "Brak danych"}
            </div>
            <div className="text-sm text-slate-600">
              {score >= 80 ? (
                <span className="text-emerald-700 font-semibold block">
                  Stan sklepu bardzo dobry
                </span>
              ) : score >= 50 ? (
                <span className="text-amber-700 font-semibold block">
                  Wymaga optymalizacji i napraw
                </span>
              ) : (
                <span className="text-rose-700 font-semibold block">
                  Wykryto krytyczne usterki!
                </span>
              )}
              <span className="text-xs text-slate-500">
                Wyliczany deterministycznie na podstawie 15 reguł audytowych.
              </span>
            </div>
          </div>

          {latestScan && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/scans/${latestScan.id}`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Zobacz szczegółowy raport <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`/api/scans/${latestScan.id}/pdf`}
                download
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Pobierz PDF
              </a>
            </div>
          )}
        </div>

        {/* Severities summary cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Krytyczne
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {latestScan?.criticalCount ?? 0}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Zdublowane SKU, ujemne stany, brakujący tracking, nieopłacone wysyłki.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
            <AlertOctagon className="w-4 h-4" /> Wymaga pilnej reakcji
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Ostrzeżenia
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {latestScan?.warningCount ?? 0}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Brak wagi (0 kg), brakujące zdjęcia, zablokowane zamówienia (&gt; 7 dni).
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
            <AlertTriangle className="w-4 h-4" /> Wpływa na konwersję i koszty
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      {latestScan?.summary && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Kondycja wg Obszarów Sklepu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(latestScan.summary as any[]).map((cat, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">
                    {cat.title}
                  </span>
                  <span className="text-sm font-extrabold text-blue-600">
                    {cat.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Usterki: {cat.totalIssues}</span>
                  <span className="text-rose-600 font-medium">
                    Krytyczne: {cat.criticalCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Scans List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Historia Wykonanych Audytów
            </h2>
            <p className="text-xs text-slate-500">
              Archiwum skanów diagnostycznych z możliwością pobrania raportów PDF
            </p>
          </div>
          <Link
            href="/scans"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Zobacz wszystkie ({scans.length})
          </Link>
        </div>

        {scans.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Brak historii skanów. Dodaj token Base.com i uruchom swój pierwszy audyt.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {scans.slice(0, 5).map((scan) => (
              <div
                key={scan.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      scan.healthScore >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : scan.healthScore >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {scan.healthScore}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {scan.shopConnection?.name || "Sklep Base.com"}
                      </span>
                      {(scan.id?.includes("demo") || scan.shopConnection?.name?.toLowerCase().includes("demo")) && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")} • {scan.issuesCount} wykrytych spraw
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`/api/scans/${scan.id}/pdf`}
                    download
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                    title="Pobierz PDF"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </a>
                  <Link
                    href={`/scans/${scan.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    Szczegóły <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
