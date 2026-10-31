import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { RosterScheduleGrid } from "@/features/attendance/components/RosterScheduleGrid";

export const metadata: Metadata = {
  title: "Employee Roster - Ventura HRIS",
  description: "Interactive shift scheduling grid and cyclical pattern assignments.",
};

export default function RosterPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <RosterScheduleGrid />
      </div>
    </AppShell>
  );
}
