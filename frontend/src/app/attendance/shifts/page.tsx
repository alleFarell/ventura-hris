import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { ShiftManagementSection } from "@/features/attendance/components/ShiftManagementSection";

export const metadata: Metadata = {
  title: "Shifts & Working Hours - Ventura HRIS",
  description: "Configure work shifts, grace periods, overnight flags, and cyclical schedules.",
};

export default function ShiftsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <ShiftManagementSection />
      </div>
    </AppShell>
  );
}
