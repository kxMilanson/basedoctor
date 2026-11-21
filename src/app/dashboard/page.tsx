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
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [activeScanMsg, setActiveScanMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/connections").then((res) => (res.ok ? res.json() : { connections: [] })),
      fetch("/api/scans").then((res) => (res.ok ? res.json() : { scans: [] })),
    ])
      .then(([connData, scanData]) => {
        setConnections(connData.connections || []);
        setScans(scanData.scans || []);
      })
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Ładowanie danych diagnostycznych...
      </div>
    );
  }

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
            Status integralności bazy Base.com (Tylko do odczytu)
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
                    <div className="text-sm font-bold text-slate-900">
                      {scan.shopConnection?.name || "Sklep Base.com"}
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
