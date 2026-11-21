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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        Weryfikacja uprawnień i ładowanie panelu administratora...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Odmowa Dostępu</h1>
        <p className="text-sm text-slate-600">{error}</p>
        <p className="text-xs text-slate-500">
          Zaloguj się kontem administratora: <code>admin@basedoctor.pl</code> (Hasło: <code>Admin123!</code>).
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Panel Zarządczy Administratora
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pulpit Administracyjny BaseDoctor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitoruj użytkowników platformy, połączone sklepy i globalny stan audytów
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Użytkownicy
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats?.totalUsers ?? 0}
          </div>
          <p className="text-xs text-slate-500">Zarejestrowane konta w systemie</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Połączenia API
            </span>
            <Key className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats?.totalConnections ?? 0}
          </div>
          <p className="text-xs text-slate-500">Zaszyfrowane tokeny Base.com</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Wykonane Audyty
            </span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats?.totalScans ?? 0}
          </div>
          <p className="text-xs text-slate-500">Zrealizowane skany diagnostyczne</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Wykryte Usterki
            </span>
            <Layers className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats?.totalIssues ?? 0}
          </div>
          <p className="text-xs text-slate-500">Wszystkie wykryte nieprawidłowości</p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            Zarejestrowani Użytkownicy ({users.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Użytkownik / Email</th>
                <th className="py-3 px-6">Rola</th>
                <th className="py-3 px-6">Data Rejestracji</th>
                <th className="py-3 px-6 text-right">Sklepy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-6 font-medium text-slate-900">
                    <div>{u.name || "Użytkownik"}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === "ADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("pl-PL")}
                  </td>
                  <td className="py-3.5 px-6 text-right font-semibold">
                    {u._count?.connections ?? 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Scans Global */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            Ostatnie Audyty w Platformie
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(stats?.recentScans || []).map((scan: any) => (
            <div
              key={scan.id}
              className="p-4 sm:px-6 flex items-center justify-between text-sm hover:bg-slate-50"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  {scan.shopConnection?.name || "Sklep Base.com"}
                </div>
                <div className="text-xs text-slate-400">
                  Użytkownik: {scan.user?.email} • {new Date(scan.startedAt).toLocaleString("pl-PL")}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100">
                  Health: {scan.healthScore}%
                </span>
                <Link
                  href={`/scans/${scan.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Raport <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
