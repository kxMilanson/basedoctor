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
  TrendingDown,
  TrendingUp,
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
    setActiveScanMsg("Pobieranie danych z Base.com i ewaluacja reguł audytowych...");

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
    setActiveScanMsg("Inicjalizacja konta demonstracyjnego...");
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-zinc-500 font-medium">
        Ładowanie danych analitycznych...
      </div>
    );
  }

  const isDemoActive =
    (latestScan &&
      (latestScan.shopConnection?.name?.toLowerCase().includes("demo") ||
        latestScan.shopConnection?.name?.toLowerCase().includes("syntetyczn") ||
        latestScan.id?.includes("demo"))) ||
    (connections.length > 0 &&
      connections.some(
        (c) => c.name?.toLowerCase().includes("demo") || c.maskedToken?.includes("demo")
      ));

  const score = latestScan?.healthScore ?? 100;
  const scoreBadgeClass =
    score >= 80 ? "badge-active" : score >= 50 ? "badge-warning" : "badge-critical";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header / Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            Pulpit Diagnostyczny Sklepu
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Integralność bazy Base.com (Tryb Read-Only • Szyfrowanie AES-256-GCM)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/connections"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-xs transition"
          >
            <Key className="w-3.5 h-3.5 text-zinc-400" />
            Połączenia API ({connections.length})
          </Link>
          <button
            onClick={handleRunQuickScan}
            disabled={scanning || connections.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {scanning ? "Skanowanie..." : "Uruchom Nowy Audyt"}
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      {isDemoActive && (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-purple-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-semibold text-purple-900">Tryb Demonstracyjny (Dane Syntetyczne):</span>{" "}
              Przeglądasz wyniki audytu wygenerowane na podstawie syntetycznego zestawu testowego.
            </div>
          </div>
          <Link
            href="/connections"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded-lg shrink-0 transition"
          >
            Podłącz prawdziwy sklep <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Empty State Banner (if no connections) */}
      {connections.length === 0 && (
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-zinc-200/80 shadow-xs text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 mx-auto flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-sm font-bold text-zinc-950">
              Witaj w BaseDoctor! Rozpocznij diagnostykę swojego sklepu
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Podłącz swój token API Base.com w trybie tylko do odczytu, aby sprawdzić stan katalogu i zamówień, lub wypróbuj wersję demonstracyjną.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <Link
              href="/connections"
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> Podłącz sklep Base.com
            </Link>
            <button
              onClick={handleLoadDemo}
              disabled={scanning}
              className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Wypróbuj wersję demo
            </button>
          </div>
        </div>
      )}

      {activeScanMsg && (
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5 animate-pulse">
          <Activity className="w-4 h-4 text-blue-600 animate-spin" />
          <span>{activeScanMsg}</span>
        </div>
      )}

      {/* KPI Row (Linear / Stripe style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Health Score Main Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
                Wskaźnik Integralności
              </span>
              <h2 className="text-base font-bold text-zinc-950 mt-0.5">
                Health Score Sklepu
              </h2>
            </div>
            {latestScan && (
              <span className="text-[11px] text-zinc-400">
                Audyt: {new Date(latestScan.completedAt || latestScan.startedAt).toLocaleDateString("pl-PL")}
              </span>
            )}
          </div>

          <div className="my-6 flex items-baseline gap-4">
            <div className="font-mono text-5xl font-extrabold tracking-tight text-zinc-950">
              {latestScan ? `${score}%` : "—"}
            </div>
            <div className="space-y-0.5 text-xs">
              <span className={scoreBadgeClass}>
                {score >= 80 ? "Stan sklepu bardzo dobry" : score >= 50 ? "Wymaga optymalizacji" : "Krytyczne usterki"}
              </span>
              <p className="text-[11px] text-zinc-500 pt-0.5">
                Wyliczany deterministycznie na podstawie 15 reguł audytowych.
              </p>
            </div>
          </div>

          {latestScan && (
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
              <Link
                href={`/scans/${latestScan.id}`}
                className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Zobacz szczegółowy raport <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`/api/scans/${latestScan.id}/pdf`}
                download
                className="font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Pobierz PDF
              </a>
            </div>
          )}
        </div>

        {/* Severity Count Cards */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold tracking-wider uppercase text-rose-600">
                Krytyczne
              </span>
              <AlertOctagon className="w-4 h-4 text-rose-500" />
            </div>
            <div className="font-mono text-3xl font-bold text-zinc-950 mt-2">
              {latestScan?.criticalCount ?? 0}
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 leading-relaxed">
            Zdublowane SKU, ujemne stany, brak numeru listu przewozowego.
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-600">
                Ostrzeżenia
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-mono text-3xl font-bold text-zinc-950 mt-2">
              {latestScan?.warningCount ?? 0}
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 leading-relaxed">
            Brak wagi (0 kg), brak zdjęć, zablokowane zamówienia (&gt; 7 dni).
          </div>
        </div>
      </div>

      {/* Category Breakdown (Linear / Stripe style progress meters) */}
      {latestScan?.summary && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-600">
            Kondycja wg Obszarów Sklepu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {(latestScan.summary as any[]).map((cat, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs space-y-2.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-800">{cat.title}</span>
                  <span className="font-mono font-bold text-zinc-950">{cat.score}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      cat.score >= 80 ? "bg-emerald-500" : cat.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Wykryte: {cat.totalIssues}</span>
                  {cat.criticalCount > 0 && (
                    <span className="text-rose-600 font-semibold font-mono">
                      {cat.criticalCount} kryt.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Scans Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-700">
              Ostatnie Audyty Diagnostyczne
            </h2>
            <p className="text-[11px] text-zinc-400">
              Historia przeprowadzonych weryfikacji bazy Base.com
            </p>
          </div>
          <Link
            href="/scans"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Wszystkie ({scans.length})
          </Link>
        </div>

        {scans.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs">
            Brak historii skanów. Dodaj token Base.com i uruchom swój pierwszy audyt.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {scans.slice(0, 5).map((scan) => (
              <div
                key={scan.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="font-mono text-sm font-bold text-zinc-900 w-12 text-center py-1 rounded-lg bg-zinc-100 border border-zinc-200">
                    {scan.healthScore}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">
                        {scan.shopConnection?.name || "Sklep Base.com"}
                      </span>
                      {(scan.id?.includes("demo") || scan.shopConnection?.name?.toLowerCase().includes("demo")) && (
                        <span className="badge-demo">DEMO</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")} • {scan.issuesCount} wykrytych spraw
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`/api/scans/${scan.id}/pdf`}
                    download
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs flex items-center gap-1 transition"
                    title="Pobierz PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">PDF</span>
                  </a>
                  <Link
                    href={`/scans/${scan.id}`}
                    className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    Szczegóły <ArrowRight className="w-3 h-3" />
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
