"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  FileText,
  Key,
  Users,
  LogOut,
  LogIn,
  Menu,
  X,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string | null; role: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    setUserMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/dashboard", label: "Pulpit", icon: Activity, auth: true },
    { href: "/connections", label: "Połączenia API", icon: Key, auth: true },
    { href: "/scans", label: "Historia Audytów", icon: FileText, auth: true },
    { href: "/settings", label: "Ustawienia", icon: Settings, auth: true },
    { href: "/admin", label: "Panel Admina", icon: Users, auth: true, adminOnly: true },
  ];

  const visibleLinks = navLinks.filter((item) => {
    if (!item.auth) return true;
    if (!user) return false;
    if (item.adminOnly && user.role !== "ADMIN") return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-15 py-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold shadow-xs transition group-hover:bg-blue-600">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-zinc-950 tracking-tight">
                  Base<span className="text-blue-600">Doctor</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-100 rounded-full border border-zinc-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  v1.0 Beta
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            {user && (
              <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-200/80">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? "bg-zinc-100 text-zinc-950 font-semibold"
                          : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* User Profile / Auth State */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-2.5 pr-2 py-1 rounded-full border border-zinc-200/80 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/50 transition text-xs font-medium text-zinc-800"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <span className="max-w-[130px] truncate">{user.name || user.email.split("@")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-zinc-200 shadow-dropdown py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-zinc-100">
                      <div className="text-xs font-semibold text-zinc-950 truncate">{user.name || "Użytkownik"}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-100 text-zinc-700">
                        {user.role === "ADMIN" ? "Administrator" : "Konto Standardowe"}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition"
                      >
                        <Settings className="w-3.5 h-3.5 text-zinc-400" />
                        Ustawienia konta
                      </Link>
                      <Link
                        href="/connections"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition"
                      >
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                        Klucze API Base.com
                      </Link>
                    </div>

                    <div className="border-t border-zinc-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Wyloguj się
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                  Logowanie
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg shadow-xs transition"
                >
                  Darmowy audyt
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 px-4 pt-2 pb-4 space-y-1 bg-white">
          {user ? (
            <>
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                      isActive ? "bg-zinc-100 text-zinc-950 font-semibold" : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-zinc-500" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between px-3">
                <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Wyloguj
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2 text-xs font-medium text-zinc-700 bg-zinc-50 rounded-lg"
              >
                Logowanie
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg"
              >
                Darmowy audyt
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
