"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-zinc-500 text-sm">
        <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Weryfikacja uprawnień i ładowanie panelu zarządczego...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl mx-auto flex items-center justify-center border border-rose-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-semibold text-zinc-950">Odmowa Dostępu</h1>
        <p className="text-xs text-zinc-600">{error}</p>
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-600 text-left font-mono">
          <p className="text-zinc-400 mb-1 font-sans">Konto z uprawnieniami ROOT:</p>
          <p>Login: <span className="text-zinc-900">admin@basedoctor.pl</span></p>
          <p>Hasło: <span className="text-zinc-900">Admin123!</span></p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition"
        >
          Przejdź do formularza logowania
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Panel Zarządczy Administratora</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
          Pulpit Administracyjny BaseDoctor
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Globalny rejestr kont najemców, stan szyfrowanych magazynów kluczy i syntetyczny przegląd audytów.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Konta Użytkowników
            </span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-950">
            {stats?.totalUsers ?? 0}
          </div>
          <p className="text-xs text-zinc-500">Zarejestrowane profile w bazie</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Połączenia API
            </span>
            <Key className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-950">
            {stats?.totalConnections ?? 0}
          </div>
          <p className="text-xs text-zinc-500">Tokeny w magazynie AES-256</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Zrealizowane Audyty
            </span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-950">
            {stats?.totalScans ?? 0}
          </div>
          <p className="text-xs text-zinc-500">Skany diagnostyczne catalog/order</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Wykryte Usterki
            </span>
            <Layers className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-semibold font-mono text-zinc-950">
            {stats?.totalIssues ?? 0}
          </div>
          <p className="text-xs text-zinc-500">Skatalogowane nieprawidłowości</p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">
              Zarejestrowani Użytkownicy ({users.length})
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Najemcy z uprawnieniami dostępu do platformy</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Tenant Isolation Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/75 text-zinc-500 text-xs font-medium uppercase border-b border-zinc-100 font-mono">
              <tr>
                <th className="py-3 px-5">Użytkownik / Email</th>
                <th className="py-3 px-5">Rola</th>
                <th className="py-3 px-5">Data Rejestracji</th>
                <th className="py-3 px-5 text-right">Sklepy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50 transition">
                  <td className="py-3.5 px-5 font-medium text-zinc-900">
                    <div className="font-semibold text-sm">{u.name || "Użytkownik"}</div>
                    <div className="text-xs text-zinc-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-mono ${
                        u.role === "ADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-zinc-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString("pl-PL")}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-semibold text-zinc-900">
                    {u._count?.connections ?? 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Global Scans */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-950">
            Ostatnie Audyty w Platformie
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Log wykonanych operacji diagnostycznych w obrębie wszystkich instancji</p>
        </div>
        <div className="divide-y divide-zinc-100">
          {(stats?.recentScans || []).length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-mono">Brak zarejestrowanych audytów.</div>
          ) : (
            (stats?.recentScans || []).map((scan: any) => (
              <div
                key={scan.id}
                className="p-4 sm:px-5 flex items-center justify-between text-sm hover:bg-zinc-50/50 transition"
              >
                <div>
                  <div className="font-medium text-zinc-950 text-sm">
                    {scan.shopConnection?.name || "Sklep Base.com"}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">
                    Tenant: {scan.user?.email} • {new Date(scan.startedAt).toLocaleString("pl-PL")}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800">
                    Health: {scan.healthScore}%
                  </span>
                  <Link
                    href={`/scans/${scan.id}`}
                    className="text-xs font-medium text-zinc-900 hover:text-blue-600 flex items-center gap-1 transition"
                  >
                    <span>Raport</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
