"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Store,
  Users,
  LogOut,
  Settings,
  Lock,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface AppSidebarProps {
  connectionsCount?: number;
  activeStoreName?: string;
  isDemo?: boolean;
}

export function AppSidebar({
  connectionsCount = 0,
  activeStoreName = "Nie wybrano sklepu",
  isDemo = false,
}: AppSidebarProps) {
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
        }
      })
      .catch(() => null);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems: {
    href: string;
    label: string;
    icon: any;
    count?: number;
  }[] = [
    { href: "/dashboard", label: "Przegląd sklepu", icon: LayoutDashboard },
    { href: "/scans", label: "Wyniki i historia", icon: FileText },
    {
      href: "/connections",
      label: "Połączone sklepy",
      icon: Store,
      count: connectionsCount,
    },
    { href: "/settings", label: "Ustawienia konta", icon: Settings },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Panel administratora", icon: Users });
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between bg-[#F3F0EA] border-r border-[#E8E4DC] text-[#18181B] select-none">
      {/* Top Brand & Store Context */}
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center border-b border-[#E8E4DC]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs group-hover:bg-[#115E59] transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#18181B] leading-none">
                BaseDoctor
              </span>
              <span className="text-[11px] text-[#71717A] mt-1">
                Kondycja Twojego sklepu
              </span>
            </div>
          </Link>
        </div>

        {/* Active Store Workspace Card */}
        <div className="p-4 border-b border-[#E8E4DC]">
          <Link
            href="/connections"
            onClick={() => setMobileOpen(false)}
            className="block p-3 rounded-xl bg-[#FFFFFF] border border-[#E8E4DC] hover:border-[#D6D1C7] shadow-xs transition group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#71717A]">
                Aktywny sklep
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isDemo
                    ? "bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]"
                    : "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDemo ? "bg-[#0F766E]" : "bg-[#10B981]"
                  }`}
                />
                {isDemo ? "Sklep przykładowy" : "Tylko odczyt"}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#18181B] truncate">
                {activeStoreName}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#18181B] shrink-0 transition" />
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="p-3.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition ${
                  isActive
                    ? "bg-[#FFFFFF] text-[#18181B] font-semibold border border-[#E8E4DC] shadow-xs"
                    : "text-[#3F3F46] hover:text-[#18181B] hover:bg-[#EAE6DF]/60 font-medium border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#0F766E]" : "text-[#71717A]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF8F5] text-[#3F3F46] border border-[#E8E4DC] tabular-nums">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Reassurance & User Profile */}
      <div className="p-4 space-y-3 border-t border-[#E8E4DC]">
        <div className="p-3 rounded-xl bg-[#FFFFFF]/80 border border-[#E8E4DC] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#18181B]">
            <Lock className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span>Bezpieczne sprawdzenie</span>
          </div>
          <p className="text-[11px] text-[#71717A] leading-relaxed">
            Twoje dane są bezpieczne. BaseDoctor nigdy nie zmienia cen, stanów ani zamówień w Twoim sklepie.
          </p>
        </div>

        {user && (
          <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8E4DC]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#18181B] truncate">
                  {user.name || user.email.split("@")[0]}
                </div>
                <div className="text-[11px] text-[#71717A] truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Wyloguj się"
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#BE123C] hover:bg-[#FFF1F2] transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 min-h-screen sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-[#F3F0EA] border-b border-[#E8E4DC]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0F766E] text-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-[#18181B]">BaseDoctor</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[#FFFFFF] border border-[#E8E4DC] text-[#18181B]"
          aria-label="Otwórz nawigację"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[260px] h-full shadow-modal">{renderSidebarContent()}</div>
          <div
            className="flex-1 bg-black/25 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
