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
    <div className="min-h-[calc(100vh-140px)] bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#18181B]">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <BrandLogo variant="shield" size={36} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">
            Załóż darmowe konto
          </h1>
          <p className="text-xs sm:text-sm text-[#52525B]">
            W 30 sekund sprawdź, co wymaga poprawy w Twoim sklepie
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
                Imię i nazwisko lub nazwa sklepu
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Jan Kowalski"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                />
              </div>
            </div>

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
                Hasło (minimum 6 znaków)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] bg-[#FAF8F5] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5 py-1 text-xs text-[#52525B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Bezpieczny podgląd — nic nie zmieniamy w Twoim sklepie</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Gotowy raport z listą wskazówek i eksportem PDF</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-studio-brand w-full py-3 text-xs cursor-pointer"
            >
              <span>{loading ? "Tworzenie konta..." : "Utwórz darmowe konto"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#52525B]">
          Masz już konto?{" "}
          <Link href="/login" className="text-[#0F766E] font-semibold hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
