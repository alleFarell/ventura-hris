"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Calendar,
  Umbrella,
  Banknote,
  Briefcase,
  UserCheck,
  Target,
  GraduationCap,
  Laptop,
  UserMinus,
  Building2,
  FileSpreadsheet,
  FileCheck,
  Award,
  Layers,
  CheckCircle2,
  DollarSign,
  Receipt,
  ShieldCheck,
  Building,
  Users,
  Compass,
  FileText,
} from "lucide-react";

export type ModuleNavType =
  | "attendance"
  | "payroll"
  | "recruitment"
  | "performance"
  | "training"
  | "assets"
  | "offboarding"
  | "setup"
  | "leave";

interface TabItem {
  label: string;
  href: string;
  icon?: any;
}

const MODULE_TABS: Record<ModuleNavType, { title: string; subtitle: string; tabs: TabItem[] }> = {
  attendance: {
    title: "Time & Attendance",
    subtitle: "Real-time clock punch, shift scheduling, roster planning, overtime, and WFH management",
    tabs: [
      { label: "Punch Clock", href: "/attendance/punch", icon: Clock },
      { label: "Daily Records", href: "/attendance/records", icon: FileText },
      { label: "Roster Grid", href: "/attendance/roster", icon: Calendar },
      { label: "Shifts & Working Hours", href: "/attendance/shifts", icon: Briefcase },
      { label: "Overtime Requests", href: "/attendance/overtime", icon: Clock },
      { label: "WFH Requests", href: "/attendance/wfh", icon: Laptop },
      { label: "Monthly Recap", href: "/attendance/monthly-recap", icon: FileSpreadsheet },
      { label: "Public Holidays", href: "/attendance/holidays", icon: Calendar },
    ],
  },
  payroll: {
    title: "Compensation & Payroll",
    subtitle: "Enterprise payroll processing, salary structures, tax calculations, BPJS, and payslip disbursals",
    tabs: [
      { label: "Payroll Runs", href: "/payroll/runs", icon: Banknote },
      { label: "Pay Periods", href: "/payroll/periods", icon: Calendar },
      { label: "Salary Components", href: "/payroll/components", icon: Briefcase },
      { label: "Salary Structures", href: "/payroll/structures", icon: Layers },
      { label: "Tax Configuration", href: "/payroll/tax-config", icon: Receipt },
      { label: "Attendance Sync", href: "/payroll/attendance-integration", icon: Clock },
      { label: "Simulation & Calc", href: "/payroll/simulation", icon: Compass },
      { label: "Employee Compensation", href: "/payroll/compensation", icon: DollarSign },
      { label: "Payslip Distribution", href: "/payroll/payslips", icon: FileText },
      { label: "My Payslips", href: "/payroll/my-payslips", icon: Banknote },
      { label: "Bank Disbursals", href: "/payroll/disbursals", icon: CheckCircle2 },
      { label: "Reimbursements", href: "/payroll/reimbursements", icon: Receipt },
      { label: "Benefit Plans", href: "/payroll/benefits", icon: ShieldCheck },
      { label: "BPJS Health & Employment", href: "/payroll/bpjs", icon: ShieldCheck },
      { label: "Employee Loans", href: "/payroll/loans", icon: DollarSign },
    ],
  },
  recruitment: {
    title: "Talent Acquisition & ATS",
    subtitle: "Manage recruitment requisitions, open job postings, candidate pipelines, interview workflows, and offers",
    tabs: [
      { label: "Job Requisitions", href: "/recruitment/requisitions", icon: UserCheck },
      { label: "Job Postings", href: "/recruitment/postings", icon: Briefcase },
      { label: "Candidate Pipeline", href: "/recruitment/candidates", icon: Users },
      { label: "Interviews", href: "/recruitment/interviews", icon: Calendar },
      { label: "Job Offers", href: "/recruitment/offers", icon: Award },
    ],
  },
  performance: {
    title: "Performance & OKRs",
    subtitle: "Goal management, appraisal review cycles, employee evaluations, 360 feedback, and competency frameworks",
    tabs: [
      { label: "OKRs & Goals", href: "/performance/goals", icon: Target },
      { label: "Review Cycles", href: "/performance/cycles", icon: Calendar },
      { label: "Employee Appraisals", href: "/performance/appraisals", icon: FileCheck },
      { label: "360 Feedback", href: "/performance/feedback", icon: Users },
      { label: "Competencies", href: "/performance/competencies", icon: Award },
    ],
  },
  training: {
    title: "Learning & Development",
    subtitle: "Internal training courses, session schedules, employee enrollments, and professional certifications",
    tabs: [
      { label: "Course Catalog", href: "/training/courses", icon: GraduationCap },
      { label: "Training Sessions", href: "/training/sessions", icon: Calendar },
      { label: "Certifications", href: "/training/certifications", icon: Award },
    ],
  },
  assets: {
    title: "Asset Management",
    subtitle: "Hardware inventory, electronic devices, equipment assignments, and allocation lifecycles",
    tabs: [
      { label: "Asset Inventory", href: "/assets", icon: Laptop },
      { label: "Allocations & Returns", href: "/assets/allocations", icon: Layers },
    ],
  },
  offboarding: {
    title: "Offboarding & Exit Operations",
    subtitle: "Employee departures, clearance checklists, asset returns, and exit interview management",
    tabs: [
      { label: "Exit Cases", href: "/offboarding/cases", icon: UserMinus },
      { label: "Clearance Checklists", href: "/offboarding/checklists", icon: FileCheck },
      { label: "Exit Interviews", href: "/offboarding/exit-interviews", icon: FileText },
    ],
  },
  setup: {
    title: "System & Enterprise Foundation",
    subtitle: "Configure corporate entities, operating branches, local defaults, and multi-entity organizational structure",
    tabs: [
      { label: "Setup Overview", href: "/setup", icon: Building2 },
      { label: "Legal Companies", href: "/setup/company", icon: Building },
      { label: "Operating Branches", href: "/setup/branches", icon: Building2 },
    ],
  },
  leave: {
    title: "Time Off & Leave Management",
    subtitle: "Apply for annual and emergency leave, review manager approvals, and view company holiday calendar",
    tabs: [
      { label: "My Leave", href: "/leave/my-leave", icon: Umbrella },
      { label: "Pending Approvals", href: "/leave/approvals", icon: CheckCircle2 },
      { label: "Leave Calendar", href: "/leave/calendar", icon: Calendar },
    ],
  },
};

export function ModuleNav({
  module,
  title,
  subtitle,
  actions,
  hideHeader = false,
}: {
  module: ModuleNavType;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const config = MODULE_TABS[module];
  if (!config) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Optional Header row */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {title || config.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle || config.subtitle}
            </p>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Modern horizontal pill tabs bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/80">
        {config.tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
              }`}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
