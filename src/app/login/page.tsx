"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

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
        throw new Error(data.error || "Nie udało się zalogować.");
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
    <div className="min-h-[calc(100vh-140px)] bg-obsidian-spotlight flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <BrandLogo variant="shield" size={38} theme="dark" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Zaloguj się do swojego sklepu
          </h1>
          <p className="text-sm text-zinc-400">
            Sprawdź aktualną kondycję produktów, magazynu i zamówień
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
                Hasło
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-white/[0.12] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2DD4BF] bg-white/[0.04] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-studio-brand w-full py-3.5 text-sm cursor-pointer"
            >
              <span>{loading ? "Logowanie..." : "Zaloguj się"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Fast Demo Logins */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            <p className="text-xs font-medium text-zinc-400">
              Chcesz tylko zobaczyć jak działa aplikacja? Kliknij, aby uzupełnić konto testowe:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("jan@twojsklep.pl", "User123!")}
                className="text-left text-xs p-3 rounded-xl bg-white/[0.04] hover:bg-[#0F766E]/20 hover:border-[#14B8A6]/40 border border-white/[0.08] transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-white block group-hover:text-[#5EEAD4]">
                    Przykładowe konto sprzedawcy
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    jan@twojsklep.pl • User123!
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#5EEAD4] transition" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@basedoctor.pl", "Admin123!")}
                className="text-left text-xs p-3 rounded-xl bg-white/[0.04] hover:bg-[#0F766E]/20 hover:border-[#14B8A6]/40 border border-white/[0.08] transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-white block group-hover:text-[#5EEAD4]">
                    Konto administratora
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    admin@basedoctor.pl • Admin123!
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#5EEAD4] transition" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-400">
          Nie masz jeszcze konta?{" "}
          <Link href="/register" className="text-[#2DD4BF] font-semibold hover:underline">
            Załóż darmowe konto
          </Link>
        </p>
      </div>
    </div>
  );
}
