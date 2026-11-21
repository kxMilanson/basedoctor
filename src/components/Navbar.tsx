"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  LogOut,
  LogIn,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string | null; role: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/connections") ||
    pathname.startsWith("/scans") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#090A0F]/85 backdrop-blur-xl border-b border-white/[0.08] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="transition hover:opacity-90">
            <BrandLogo variant="shield" size={32} theme="dark" />
          </Link>

          {/* Public Navigation Links */}
          {pathname === "/" && (
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <a href="#jak-to-dziala" className="hover:text-white transition">
                Jak to działa
              </a>
              <a href="#bento-funkcje" className="hover:text-white transition">
                Możliwości
              </a>
              <a href="#co-sprawdzamy" className="hover:text-white transition">
                Przykłady błędów
              </a>
              <a href="#kontakt" className="hover:text-white transition">
                Kontakt
              </a>
            </nav>
          )}

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-studio-brand">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Otwórz pulpit</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-zinc-400" />
                  <span>Wyloguj</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-zinc-400" />
                  <span>Zaloguj się</span>
                </Link>
                <Link href="/register" className="btn-studio-brand">
                  <span>Sprawdź swój sklep</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.08] px-4 pt-3 pb-5 space-y-3 bg-[#090A0F]">
          {pathname === "/" && (
            <div className="flex flex-col gap-2 text-sm font-medium text-zinc-300 pb-3 border-b border-white/[0.08]">
              <a href="#jak-to-dziala" onClick={() => setMobileOpen(false)} className="py-1.5">
                Jak to działa
              </a>
              <a href="#bento-funkcje" onClick={() => setMobileOpen(false)} className="py-1.5">
                Możliwości
              </a>
              <a href="#co-sprawdzamy" onClick={() => setMobileOpen(false)} className="py-1.5">
                Przykłady błędów
              </a>
              <a href="#kontakt" onClick={() => setMobileOpen(false)} className="py-1.5">
                Kontakt
              </a>
            </div>
          )}

          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="btn-studio-brand w-full"
              >
                Otwórz pulpit
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-white/[0.06] border border-white/[0.08] w-full"
              >
                Wyloguj się
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-center text-zinc-200 bg-white/[0.06] border border-white/[0.08] w-full"
              >
                Zaloguj się
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-studio-brand w-full"
              >
                Sprawdź swój sklep za darmo
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
