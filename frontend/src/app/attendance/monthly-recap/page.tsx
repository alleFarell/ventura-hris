import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { MonthlyRecapSection } from "@/features/attendance/components/MonthlyRecapDashboard";

export const metadata: Metadata = {
  title: "Monthly Attendance Recap - Ventura HRIS",
  description: "Monthly aggregation of attendance, workdays, late hours, overtime, and unpaid absences.",
};

export default function MonthlyRecapPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <MonthlyRecapSection />
      </div>
    </AppShell>
  );
}
