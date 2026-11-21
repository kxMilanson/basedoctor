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
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="transition hover:opacity-90">
            <BrandLogo variant="shield" size={32} />
          </Link>

          {/* Public Navigation Links */}
          {pathname === "/" && (
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52525B]">
              <a href="#jak-to-dziala" className="hover:text-[#18181B] transition">
                Jak to działa
              </a>
              <a href="#co-sprawdzamy" className="hover:text-[#18181B] transition">
                Co sprawdzamy
              </a>
              <a href="#dla-kogo" className="hover:text-[#18181B] transition">
                Dla kogo
              </a>
              <a href="#kontakt" className="hover:text-[#18181B] transition">
                Kontakt
              </a>
            </nav>
          )}

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-studio-brand"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Przejdź do panelu</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-studio-secondary text-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#71717A]" />
                  <span>Wyloguj</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-studio-secondary"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#71717A]" />
                  <span>Zaloguj się</span>
                </Link>
                <Link
                  href="/register"
                  className="btn-studio-brand"
                >
                  <span>Sprawdź swój sklep</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#18181B]"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E4DC] px-4 pt-3 pb-5 space-y-3 bg-[#FAF8F5]">
          {pathname === "/" && (
            <div className="flex flex-col gap-1.5 text-xs font-medium text-[#3F3F46] pb-2 border-b border-[#E8E4DC]">
              <a href="#jak-to-dziala" onClick={() => setMobileOpen(false)} className="py-1.5">
                Jak to działa
              </a>
              <a href="#co-sprawdzamy" onClick={() => setMobileOpen(false)} className="py-1.5">
                Co sprawdzamy
              </a>
              <a href="#dla-kogo" onClick={() => setMobileOpen(false)} className="py-1.5">
                Dla kogo
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
                Przejdź do panelu
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="btn-studio-secondary w-full"
              >
                Wyloguj się
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-studio-secondary w-full"
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
