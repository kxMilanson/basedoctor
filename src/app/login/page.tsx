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
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#111315]">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-8 h-8 rounded-md bg-[#111315] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0052FF] transition-colors">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-bold text-[#111315] tracking-tight">
              Base<span className="text-[#0052FF]">Doctor</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#111315]">
            Zaloguj się do BaseDoctor
          </h1>
          <p className="text-xs text-[#5C6168]">
            Dostęp do audytów katalogu SKU, magazynu i zamówień Base.com
          </p>
        </div>

        <div className="pci-card p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#5C6168] mb-1.5">
                Adres E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#868C94] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan@twojsklep.pl"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#5C6168]">
                  Hasło
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#868C94] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-cobalt w-full py-2.5 text-xs font-semibold cursor-pointer"
            >
              <span>{loading ? "Weryfikacja..." : "Zaloguj się"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Click Fast Demo Logins */}
          <div className="pt-4 border-t border-[#EFECE6] space-y-2">
            <span className="pci-eyebrow block">Szybkie konta testowe:</span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("jan@twojsklep.pl", "User123!")}
                className="text-left text-xs p-2.5 rounded-md bg-[#FAF9F6] hover:bg-[#EDF2FF] hover:border-[#C7D7FE] border border-[#E5E3DC] transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-[#111315] block group-hover:text-[#0052FF]">
                    Konto Demonstracyjne (Sklep)
                  </span>
                  <span className="text-[11px] font-mono text-[#5C6168]">
                    jan@twojsklep.pl • User123!
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#868C94] group-hover:text-[#0052FF] transition" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@basedoctor.pl", "Admin123!")}
                className="text-left text-xs p-2.5 rounded-md bg-[#FAF9F6] hover:bg-[#EDF2FF] hover:border-[#C7D7FE] border border-[#E5E3DC] transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-[#111315] block group-hover:text-[#0052FF]">
                    Administrator Systemu
                  </span>
                  <span className="text-[11px] font-mono text-[#5C6168]">
                    admin@basedoctor.pl • Admin123!
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#868C94] group-hover:text-[#0052FF] transition" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#5C6168]">
          Nie posiadasz jeszcze konta?{" "}
          <Link href="/register" className="text-[#0052FF] font-semibold hover:underline">
            Zarejestruj się bezpłatnie
          </Link>
        </p>
      </div>
    </div>
  );
}
