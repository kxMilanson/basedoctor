"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Users,
  ShieldCheck,
  Activity,
  Layers,
  Key,
  Calendar,
  Lock,
  ArrowRight,
  AlertCircle,
  Database,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Brak uprawnień administratora.");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setUsers(data.users || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#111315]">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        connectionsCount={stats?.totalConnections ?? 0}
        activeStoreName="Panel Zarządczy Root"
        isDemo={false}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Workspace Top Header */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-[#5C6168]">System</span>
            <span className="text-[#CFCBC2]">/</span>
            <h1 className="text-xs sm:text-sm font-semibold text-[#111315] truncate">
              Nadzór Najemców i Bezpieczeństwo
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EDF2FF] border border-[#C7D7FE] text-[#0052FF]">
              ADMIN ROOT
            </span>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <div className="border-b border-[#E5E3DC] pb-4">
            <span className="pci-eyebrow">Administracja Centralna</span>
            <h2 className="text-base font-semibold text-[#111315] mt-0.5">
              Pulpit Administracyjny Platformy
            </h2>
            <p className="text-xs text-[#5C6168] mt-0.5">
              Rejestr kont najemców, wolumen zaszyfrowanych magazynów kluczy oraz globalna telemetria audytów.
            </p>
          </div>

          {loading ? (
            <div className="pci-card p-12 text-center text-xs text-[#5C6168] font-mono animate-pulse">
              Weryfikacja uprawnień i ładowanie panelu zarządczego...
            </div>
          ) : error ? (
            <div className="pci-card p-10 max-w-md mx-auto text-center space-y-4">
              <div className="w-10 h-10 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#111315]">Odmowa Dostępu</h3>
              <p className="text-xs text-[#5C6168]">{error}</p>
              <div className="p-3 bg-[#FAF9F6] rounded-md border border-[#E5E3DC] text-xs font-mono text-left">
                <div className="text-[10px] text-[#868C94] uppercase mb-1">Konto Administratora:</div>
                <div>Login: admin@basedoctor.pl</div>
                <div>Hasło: Admin123!</div>
              </div>
              <Link href="/login" className="btn-primary-cobalt inline-flex text-xs">
                Przejdź do logowania
              </Link>
            </div>
          ) : (
            <>
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="pci-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#5C6168]">
                    <span className="pci-eyebrow">Konta Użytkowników</span>
                    <Users className="w-4 h-4 text-[#5C6168]" />
                  </div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-[#111315] tabular-nums">
                    {stats?.totalUsers ?? 0}
                  </div>
                  <p className="text-[11px] text-[#5C6168]">Zarejestrowane profile w bazie</p>
                </div>

                <div className="pci-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#5C6168]">
                    <span className="pci-eyebrow">Magazyny Kluczy API</span>
                    <Key className="w-4 h-4 text-[#059669]" />
                  </div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-[#111315] tabular-nums">
                    {stats?.totalConnections ?? 0}
                  </div>
                  <p className="text-[11px] text-[#5C6168]">Zaszyfrowane tokeny AES-256</p>
                </div>

                <div className="pci-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#5C6168]">
                    <span className="pci-eyebrow">Wykonane Audyty</span>
                    <Activity className="w-4 h-4 text-[#0052FF]" />
                  </div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-[#111315] tabular-nums">
                    {stats?.totalScans ?? 0}
                  </div>
                  <p className="text-[11px] text-[#5C6168]">Przeprowadzone skany diagnostyczne</p>
                </div>

                <div className="pci-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#5C6168]">
                    <span className="pci-eyebrow text-[#B91C1C]">Wykryte Usterki</span>
                    <Layers className="w-4 h-4 text-[#B91C1C]" />
                  </div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-[#111315] tabular-nums">
                    {stats?.totalIssues ?? 0}
                  </div>
                  <p className="text-[11px] text-[#5C6168]">Skatalogowane nieprawidłowości</p>
                </div>
              </div>

              {/* Users List Table */}
              <div className="pci-card overflow-hidden">
                <div className="p-5 border-b border-[#E5E3DC] flex items-center justify-between">
                  <div>
                    <span className="pci-eyebrow">Rejestr Najemców</span>
                    <h3 className="text-sm font-semibold text-[#111315] mt-0.5">
                      Zarejestrowani Użytkownicy ({users.length})
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-[#046C4E] font-semibold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded">
                    Tenant Isolation Active
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F6] border-b border-[#E5E3DC] text-[10px] font-mono uppercase tracking-wider text-[#5C6168]">
                        <th className="py-2.5 px-4">Użytkownik / Email</th>
                        <th className="py-2.5 px-4">Rola Uprawnień</th>
                        <th className="py-2.5 px-4">Data Rejestracji</th>
                        <th className="py-2.5 px-4 text-right">Sklepy API</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-xs">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#FAF9F6] transition">
                          <td className="py-3 px-4 font-semibold text-[#111315]">
                            <div>{u.name || "Użytkownik"}</div>
                            <div className="text-[11px] font-mono text-[#5C6168]">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                u.role === "ADMIN"
                                  ? "bg-[#EDF2FF] text-[#0052FF] border-[#C7D7FE]"
                                  : "bg-[#F4F2ED] text-[#373B40] border-[#E5E3DC]"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#5C6168]">
                            {new Date(u.createdAt).toLocaleDateString("pl-PL")}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-[#111315]">
                            {u._count?.connections ?? 1}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Global Scans */}
              <div className="pci-card overflow-hidden">
                <div className="p-5 border-b border-[#E5E3DC]">
                  <span className="pci-eyebrow">Dziennik Zdarzeń</span>
                  <h3 className="text-sm font-semibold text-[#111315] mt-0.5">
                    Ostatnie Audyty w Platformie
                  </h3>
                </div>
                <div className="divide-y divide-[#EFECE6]">
                  {(stats?.recentScans || []).length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#868C94] font-mono">
                      Brak zarejestrowanych audytów.
                    </div>
                  ) : (
                    (stats?.recentScans || []).map((scan: any) => (
                      <div
                        key={scan.id}
                        className="p-4 sm:px-5 flex items-center justify-between text-xs hover:bg-[#FAF9F6] transition"
                      >
                        <div>
                          <div className="font-semibold text-[#111315]">
                            {scan.shopConnection?.name || "Sklep Base.com"}
                          </div>
                          <div className="text-[11px] font-mono text-[#5C6168] mt-0.5">
                            Najemca: {scan.user?.email} • {new Date(scan.startedAt).toLocaleString("pl-PL")}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E5E3DC] text-[#111315]">
                            Health: {scan.healthScore}%
                          </span>
                          <Link
                            href={`/scans/${scan.id}`}
                            className="btn-secondary-surface py-1 px-2.5 text-[11px]"
                          >
                            <span>Raport</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
