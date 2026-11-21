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
    <div className="min-h-[calc(100vh-140px)] bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#18181B]">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <BrandLogo variant="shield" size={36} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">
            Zaloguj się do swojego sklepu
          </h1>
          <p className="text-xs sm:text-sm text-[#52525B]">
            Sprawdź aktualną kondycję produktów, magazynu i zamówień
          </p>
        </div>

        <div className="studio-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">
                Adres e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan@twojsklep.pl"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">
                Hasło
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-studio-brand w-full py-3 text-xs cursor-pointer"
            >
              <span>{loading ? "Logowanie..." : "Zaloguj się"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Click Fast Demo Logins */}
          <div className="pt-4 border-t border-[#F1EFEA] space-y-2.5">
            <p className="text-xs font-medium text-[#71717A]">
              Chcesz tylko zobaczyć jak działa aplikacja? Kliknij, aby uzupełnić konto testowe:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("jan@twojsklep.pl", "User123!")}
                className="text-left text-xs p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F0FDFA] hover:border-[#99F6E4] border border-[#E8E4DC] transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-[#18181B] block group-hover:text-[#0F766E]">
                    Przykładowe konto sprzedawcy
                  </span>
                  <span className="text-[11px] text-[#71717A]">
                    jan@twojsklep.pl • User123!
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#0F766E] transition" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@basedoctor.pl", "Admin123!")}
                className="text-left text-xs p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F0FDFA] hover:border-[#99F6E4] border border-[#E8E4DC] transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-[#18181B] block group-hover:text-[#0F766E]">
                    Konto administratora
                  </span>
                  <span className="text-[11px] text-[#71717A]">
                    admin@basedoctor.pl • Admin123!
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#0F766E] transition" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#52525B]">
          Nie masz jeszcze konta?{" "}
          <Link href="/register" className="text-[#0F766E] font-semibold hover:underline">
            Załóż darmowe konto
          </Link>
        </p>
      </div>
    </div>
  );
}
