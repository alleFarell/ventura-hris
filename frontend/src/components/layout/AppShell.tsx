"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import {
  Building2,
  LayoutDashboard,
  GitFork,
  Users,
  Calendar,
  Umbrella,
  Banknote,
  UserCheck,
  Target,
  GraduationCap,
  Laptop,
  UserMinus,
  Settings,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Clock,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { NotificationBell } from "@/features/settings/components/NotificationBell";

type AppShellProps = {
  children: ReactNode;
};

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  activeMatch?: string[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, initialize, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navGroups: NavGroup[] = [
    {
      group: "MAIN",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
      ],
    },
    {
      group: "CORE WORKFORCE",
      items: [
        { label: "Setup & Branches", href: "/setup", icon: Building2, activeMatch: ["/setup"] },
        { label: "Organization Units", href: "/organization", icon: GitFork, activeMatch: ["/organization"] },
        { label: "Employee Directory", href: "/employee", icon: Users, activeMatch: ["/employee"] },
      ],
    },
    {
      group: "TIME & ABSENCE",
      items: [
        { label: "Clock In / Out", href: "/attendance/punch", icon: Clock, activeMatch: ["/attendance/punch"] },
        {
          label: "Attendance & Shifts",
          href: "/attendance/roster",
          icon: Calendar,
          activeMatch: [
            "/attendance/roster",
            "/attendance/records",
            "/attendance/shifts",
            "/attendance/overtime",
            "/attendance/wfh",
            "/attendance/monthly-recap",
            "/attendance/holidays",
          ],
        },
        { label: "Leave Management", href: "/leave/my-leave", icon: Umbrella, activeMatch: ["/leave"] },
      ],
    },
    {
      group: "COMPENSATION",
      items: [
        {
          label: "Payroll Processing",
          href: "/payroll/runs",
          icon: Banknote,
          activeMatch: [
            "/payroll/runs",
            "/payroll/periods",
            "/payroll/attendance-integration",
            "/payroll/simulation",
            "/payroll/disbursals",
          ],
        },
        {
          label: "Salary Components",
          href: "/payroll/components",
          icon: Briefcase,
          activeMatch: [
            "/payroll/components",
            "/payroll/structures",
            "/payroll/tax-config",
            "/payroll/compensation",
            "/payroll/benefits",
            "/payroll/bpjs",
            "/payroll/loans",
            "/payroll/reimbursements",
          ],
        },
        {
          label: "My Payslips",
          href: "/payroll/my-payslips",
          icon: Banknote,
          activeMatch: ["/payroll/my-payslips", "/payroll/payslips"],
        },
      ],
    },
    {
      group: "TALENT & GROWTH",
      items: [
        { label: "Recruitment ATS", href: "/recruitment/requisitions", icon: UserCheck, activeMatch: ["/recruitment"] },
        { label: "Performance & OKRs", href: "/performance/goals", icon: Target, activeMatch: ["/performance"] },
        { label: "Training & Courses", href: "/training/courses", icon: GraduationCap, activeMatch: ["/training"] },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        { label: "Company Assets", href: "/assets", icon: Laptop, activeMatch: ["/assets"] },
        { label: "Offboarding & Exits", href: "/offboarding/cases", icon: UserMinus, activeMatch: ["/offboarding"] },
        { label: "System Settings", href: "/settings", icon: Settings, activeMatch: ["/settings"] },
      ],
    },
  ];

  // Helper to check active nav link
  const isLinkActive = (item: NavItem) => {
    if (item.href === "/") return pathname === "/";
    if (item.activeMatch && item.activeMatch.length > 0) {
      return item.activeMatch.some((prefix) => pathname.startsWith(prefix));
    }
    return pathname.startsWith(item.href);
  };

  // Find active item for breadcrumb title
  const activeItem = navGroups
    .flatMap((g) => g.items)
    .find((item) => isLinkActive(item)) || { label: "Overview", href: "/" };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Modern Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xs transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-black text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900">Ventura HRIS</span>
                <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[9px] font-bold text-blue-700 uppercase">
                  v0.20
                </span>
              </div>
              <p className="text-[10.5px] font-medium text-slate-400">Enterprise Workforce</p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Group Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Main Navigation">
          {navGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.group}
              </p>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = isLinkActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "bg-blue-50 text-blue-700 shadow-2xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${
                            active
                              ? "text-blue-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {active && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / User Profile Card */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
                  {(user.fullName || user.username || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {user.fullName || user.username}
                  </p>
                  <p className="truncate text-[10px] font-medium text-slate-500">
                    {user.roles?.[0]?.replace("ROLE_", "") || "USER"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <Link href="/" className="font-medium text-slate-400 hover:text-slate-600">
                Ventura
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-bold text-slate-800">{activeItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Core Systems Active</span>
            </div>

            <NotificationBell />

            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="text-xs font-semibold text-slate-700">
                  {user.fullName || user.username}
                </span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {user.roles?.[0]?.replace("ROLE_", "") || "ADMIN"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Main Content Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
