"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

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
        throw new Error(data.error || "Nie udało się utworzyć konta.");
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
    <div className="min-h-[calc(100vh-140px)] bg-obsidian-spotlight flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <BrandLogo variant="shield" size={38} theme="dark" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Załóż darmowe konto
          </h1>
          <p className="text-sm text-zinc-400">
            W 30 sekund sprawdź, co wymaga poprawy w Twoim sklepie
          </p>
        </div>

        <div className="bento-dark-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Imię i nazwisko lub nazwa sklepu
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Jan Kowalski"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Adres e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan@twojsklep.pl"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Hasło (minimum 6 znaków)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
                />
              </div>
            </div>

            <div className="space-y-2 py-1 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Bezpieczny podgląd — nic nie zmieniamy bez Twojej zgody</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Gotowy raport z listą wskazówek i eksportem PDF/CSV</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-studio-brand w-full py-3.5 text-sm cursor-pointer"
            >
              <span>{loading ? "Tworzenie konta..." : "Utwórz darmowe konto"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-400">
          Masz już konto?{" "}
          <Link href="/login" className="text-[#2DD4BF] font-semibold hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
