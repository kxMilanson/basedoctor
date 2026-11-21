"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd podczas rejestracji.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            Utwórz konto BaseDoctor
          </h1>
          <p className="text-xs text-[#5C6168]">
            Rozpocznij automatyczny audyt integralności bazy Base.com
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
                Imię i Nazwisko / Nazwa Sklepu
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#868C94] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jan Kowalski (E-Commerce)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                />
              </div>
            </div>

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
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#5C6168] mb-1.5">
                Hasło dostępowe (min. 6 znaków)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#868C94] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] bg-[#FAF9F6] focus:bg-[#FFFFFF] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5 py-1 text-[11px] text-[#5C6168]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>100% tryb bezpieczny tylko do odczytu (Read-Only)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Szyfrowanie poświadczeń kluczem AES-256-GCM</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-cobalt w-full py-2.5 text-xs font-semibold cursor-pointer"
            >
              <span>{loading ? "Rejestracja..." : "Utwórz konto"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#5C6168]">
          Posiadasz już konto?{" "}
          <Link href="/login" className="text-[#0052FF] font-semibold hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
