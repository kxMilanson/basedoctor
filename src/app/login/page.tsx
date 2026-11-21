"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd logowania.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white mx-auto flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950">
          Zaloguj się do BaseDoctor
        </h1>
        <p className="text-xs text-zinc-500">
          Wprowadź swoje dane, aby uzyskać dostęp do audytów sklepu
        </p>
      </div>

      <div className="bg-white p-7 rounded-2xl border border-zinc-200/80 shadow-card space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-600 mb-1.5">
              Adres E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@twojsklep.pl"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-zinc-50/30 hover:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                Hasło
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-zinc-50/30 hover:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? "Weryfikacja..." : "Zaloguj się"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Fast Demo Logins */}
        <div className="pt-4 border-t border-zinc-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Szybkie logowanie testowe:
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("jan@twojsklep.pl", "User123!")}
              className="text-left text-xs p-2.5 rounded-xl bg-zinc-50 hover:bg-blue-50/50 hover:border-blue-200 border border-zinc-200/80 transition flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-zinc-900 block group-hover:text-blue-700">
                  Konto Demonstracyjne (Sklep)
                </span>
                <span className="text-[11px] text-zinc-500">jan@twojsklep.pl • User123!</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin@basedoctor.pl", "Admin123!")}
              className="text-left text-xs p-2.5 rounded-xl bg-zinc-50 hover:bg-blue-50/50 hover:border-blue-200 border border-zinc-200/80 transition flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-zinc-900 block group-hover:text-blue-700">
                  Administrator Systemu
                </span>
                <span className="text-[11px] text-zinc-500">admin@basedoctor.pl • Admin123!</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Nie posiadasz jeszcze konta?{" "}
        <Link href="/register" className="text-blue-600 font-semibold hover:underline">
          Zarejestruj się bezpłatnie
        </Link>
      </p>
    </div>
  );
}
