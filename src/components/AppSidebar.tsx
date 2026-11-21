"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  LayoutDashboard,
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
    <div className="flex flex-col h-full justify-between bg-[#0B0D13] border-r border-white/[0.08] text-zinc-100 select-none">
      {/* Top Brand & Store Context */}
      <div>
        <div className="h-16 px-5 flex items-center border-b border-white/[0.08]">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo variant="shield" size={32} showWordmark={false} theme="dark" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-none">
                Base<span className="text-[#2DD4BF]">Doctor</span>
              </span>
              <span className="text-[11px] text-zinc-400 mt-1">
                Kondycja Twojego sklepu
              </span>
            </div>
          </Link>
        </div>

        {/* Active Store Workspace Card */}
        <div className="p-4 border-b border-white/[0.08]">
          <Link
            href="/connections"
            onClick={() => setMobileOpen(false)}
            className="block p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-400">
                Aktywny sklep
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isDemo
                    ? "bg-[#14B8A6]/15 text-[#5EEAD4] border border-[#14B8A6]/30"
                    : "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDemo ? "bg-[#2DD4BF]" : "bg-[#10B981]"
                  }`}
                />
                {isDemo ? "Sklep przykładowy" : "Tylko odczyt"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white truncate">
                {activeStoreName}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0 transition" />
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition ${
                  isActive
                    ? "bg-white/[0.09] text-white font-semibold border border-white/[0.12] shadow-xs"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04] font-medium border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#2DD4BF]" : "text-zinc-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.08] text-zinc-200 border border-white/[0.1] tabular-nums">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Reassurance & User Profile */}
      <div className="p-4 space-y-3 border-t border-white/[0.08]">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Lock className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
            <span>Bezpieczne sprawdzenie</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Żadne dane w sklepie nie są zmieniane bez Twojego wyraźnego zatwierdzenia.
          </p>
        </div>

        {user && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user.name || user.email.split("@")[0]}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Wyloguj się"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-[264px] shrink-0 min-h-screen sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-[#0B0D13] border-b border-white/[0.08] text-white">
        <Link href="/dashboard">
          <BrandLogo variant="shield" size={28} theme="dark" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white"
          aria-label="Otwórz nawigację"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[264px] h-full shadow-modal">{renderSidebarContent()}</div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
