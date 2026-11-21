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
  Settings,
  Lock,
  Database,
  Menu,
  X,
  ChevronRight,
  Radio,
} from "lucide-react";

interface AppSidebarProps {
  connectionsCount?: number;
  activeStoreName?: string;
  isDemo?: boolean;
}

export function AppSidebar({
  connectionsCount = 0,
  activeStoreName = "Brak aktywnego sklepu",
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

  const primaryNav: {
    group: string;
    items: {
      href: string;
      label: string;
      icon: any;
      badge?: string;
      count?: number;
    }[];
  }[] = [
    {
      group: "Diagnostyka i Analiza",
      items: [
        { href: "/dashboard", label: "Pulpit Diagnostyczny", icon: Activity, badge: "Live" },
        { href: "/scans", label: "Rejestr Audytów", icon: FileText },
      ],
    },
    {
      group: "Infrastruktura Danych",
      items: [
        {
          href: "/connections",
          label: "Integracje Base.com",
          icon: Key,
          count: connectionsCount,
        },
        { href: "/settings", label: "Parametry i Bezpieczeństwo", icon: Settings },
      ],
    },
  ];

  if (user?.role === "ADMIN") {
    primaryNav.push({
      group: "Administracja Systemu",
      items: [{ href: "/admin", label: "Nadzór Najemców", icon: Users }],
    });
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between bg-[#F4F2ED] border-r border-[#E5E3DC] text-[#111315] select-none">
      {/* Top Brand & Store Context */}
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#E5E3DC]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-[#111315] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0052FF] transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold tracking-tight text-[#111315] leading-none">
                  BaseDoctor
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider bg-[#FFFFFF] text-[#5C6168] border border-[#E5E3DC] rounded">
                  PCI-2.4
                </span>
              </div>
              <span className="text-[10px] text-[#5C6168] tracking-tight mt-0.5">
                Precision Commerce Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Active Store Workspace Switcher */}
        <div className="p-3 border-b border-[#E5E3DC]">
          <Link
            href="/connections"
            className="block p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E3DC] hover:border-[#CFCBC2] shadow-xs transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C6168] font-semibold">
                Środowisko docelowe
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[#046C4E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                {isDemo ? "DEMO" : "READ-ONLY"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Database className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                <span className="text-xs font-semibold text-[#111315] truncate">
                  {activeStoreName}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#868C94] group-hover:text-[#111315] shrink-0 transition" />
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-5">
          {primaryNav.map((section) => (
            <div key={section.group} className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#868C94]">
                {section.group}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition ${
                      isActive
                        ? "bg-[#FFFFFF] text-[#111315] font-semibold border border-[#E5E3DC] shadow-xs"
                        : "text-[#373B40] hover:text-[#111315] hover:bg-[#EAE7E0]/60 font-medium border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-[#0052FF]" : "text-[#5C6168]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#F4F2ED] text-[#373B40] border border-[#E5E3DC]">
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#EDF2FF] text-[#0052FF] border border-[#C7D7FE]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Telemetry & User Profile */}
      <div className="p-3 space-y-2.5 border-t border-[#E5E3DC] bg-[#EFECE6]/50">
        {/* Telemetry Specification Box */}
        <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E3DC] space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-[#373B40] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#0052FF]" />
              Kryptografia API
            </span>
            <span className="font-mono text-[#046C4E] font-semibold">AES-256-GCM</span>
          </div>
          <div className="w-full bg-[#F2F0EB] h-1 rounded-full overflow-hidden">
            <div className="bg-[#0052FF] h-1 rounded-full w-[88%]" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6168]">
            <span className="flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-[#059669]" />
              Limit: 95 req/min
            </span>
            <span>connector.php</span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E3DC]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-[#111315] text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-[#111315] truncate">
                  {user.name || user.email.split("@")[0]}
                </div>
                <div className="text-[10px] font-mono text-[#5C6168] truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Wyloguj się"
              className="p-1.5 rounded text-[#5C6168] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition shrink-0"
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
      <aside className="hidden lg:block w-[252px] shrink-0 min-h-screen sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-13 bg-[#F4F2ED] border-b border-[#E5E3DC]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#111315] text-white flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#111315]">BaseDoctor</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E3DC] text-[#111315]"
          aria-label="Otwórz nawigację"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full shadow-modal">{renderSidebarContent()}</div>
          <div
            className="flex-1 bg-black/25 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
