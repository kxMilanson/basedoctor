"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Users,
  Activity,
  Layers,
  Key,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
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
        setLeads(data.leads || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#18181B]">
      <AppSidebar
        connectionsCount={stats?.totalConnections ?? 0}
        activeStoreName="Panel administratora"
        isDemo={false}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#18181B] truncate">
              Panel administratora
            </h1>
            <span className="pill-demo">Administrator</span>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="studio-card p-12 text-center text-xs text-[#71717A] animate-pulse">
              Sprawdzanie uprawnień i ładowanie danych...
            </div>
          ) : error ? (
            <div className="studio-card p-10 max-w-md mx-auto text-center space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#18181B]">Brak dostępu</h2>
              <p className="text-xs text-[#52525B]">{error}</p>
              <Link href="/login" className="btn-studio-brand inline-flex text-xs">
                Zaloguj się ponownie
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="studio-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#71717A]">
                    <span className="text-xs font-medium">Użytkownicy</span>
                    <Users className="w-4 h-4 text-[#0F766E]" />
                  </div>
                  <div className="text-3xl font-bold text-[#18181B] tabular-nums">
                    {stats?.totalUsers ?? 0}
                  </div>
                </div>

                <div className="studio-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#71717A]">
                    <span className="text-xs font-medium">Połączone sklepy</span>
                    <Key className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div className="text-3xl font-bold text-[#18181B] tabular-nums">
                    {stats?.totalConnections ?? 0}
                  </div>
                </div>

                <div className="studio-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#71717A]">
                    <span className="text-xs font-medium">Wykonane raporty</span>
                    <Activity className="w-4 h-4 text-[#0F766E]" />
                  </div>
                  <div className="text-3xl font-bold text-[#18181B] tabular-nums">
                    {stats?.totalScans ?? 0}
                  </div>
                </div>

                <div className="studio-card p-5 space-y-2">
                  <div className="flex justify-between items-center text-[#71717A]">
                    <span className="text-xs font-medium">Wykryte sprawy</span>
                    <Layers className="w-4 h-4 text-[#BE123C]" />
                  </div>
                  <div className="text-3xl font-bold text-[#18181B] tabular-nums">
                    {stats?.totalIssues ?? 0}
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="studio-card overflow-hidden">
                <div className="p-5 border-b border-[#F1EFEA] flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#18181B]">
                    Zarejestrowani użytkownicy ({users.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[11px] font-semibold text-[#71717A]">
                        <th className="py-3 px-5">Użytkownik</th>
                        <th className="py-3 px-5">Uprawnienia</th>
                        <th className="py-3 px-5">Data dołączenia</th>
                        <th className="py-3 px-5 text-right">Sklepy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1EFEA] text-xs">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#FAF8F5] transition">
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-[#18181B]">{u.name || "Użytkownik"}</div>
                            <div className="text-[11px] text-[#71717A]">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={u.role === "ADMIN" ? "pill-demo" : "pill-neutral"}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-[#52525B] tabular-nums">
                            {new Date(u.createdAt).toLocaleDateString("pl-PL")}
                          </td>
                          <td className="py-3.5 px-5 text-right font-semibold text-[#18181B] tabular-nums">
                            {u._count?.connections ?? 1}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Contact Leads */}
              <div className="studio-card overflow-hidden">
                <div className="p-5 border-b border-[#F1EFEA] flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#18181B]">
                    Zgłoszenia z formularza kontaktowego ({leads.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#F1EFEA]">
                  {leads.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#71717A]">
                      Brak zgłoszeń z formularza kontaktowego.
                    </div>
                  ) : (
                    leads.map((lead: any) => (
                      <div key={lead.id} className="p-4 sm:px-5 space-y-1.5 hover:bg-[#FAF8F5] transition">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="font-semibold text-[#18181B]">
                            {lead.name}{" "}
                            <span className="font-normal text-[#0F766E]">({lead.email})</span>
                          </div>
                          <span className="text-[11px] text-[#71717A] tabular-nums">
                            {new Date(lead.createdAt).toLocaleString("pl-PL")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-[#52525B]">
                          {lead.storeUrl && <span>Sklep: {lead.storeUrl}</span>}
                          {lead.monthlyOrders && <span>Zamówienia/msc: {lead.monthlyOrders}</span>}
                        </div>
                        {lead.message && (
                          <p className="text-xs text-[#52525B] bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg p-2.5">
                            {lead.message}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Scans */}
              <div className="studio-card overflow-hidden">
                <div className="p-5 border-b border-[#F1EFEA]">
                  <h2 className="text-sm font-bold text-[#18181B]">
                    Ostatnie sprawdzenia na platformie
                  </h2>
                </div>
                <div className="divide-y divide-[#F1EFEA]">
                  {(stats?.recentScans || []).length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#71717A]">
                      Brak zapisanych raportów.
                    </div>
                  ) : (
                    (stats?.recentScans || []).map((scan: any) => (
                      <div
                        key={scan.id}
                        className="p-4 sm:px-5 flex items-center justify-between text-xs hover:bg-[#FAF8F5] transition"
                      >
                        <div>
                          <div className="font-semibold text-[#18181B]">
                            {scan.shopConnection?.name || "Sklep Base.com"}
                          </div>
                          <div className="text-[11px] text-[#71717A] mt-0.5">
                            {scan.user?.email} • {new Date(scan.startedAt).toLocaleString("pl-PL")}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="pill-neutral font-bold tabular-nums">
                            {scan.healthScore}%
                          </span>
                          <Link
                            href={`/scans/${scan.id}`}
                            className="btn-studio-secondary py-1.5 px-3 text-[11px]"
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
