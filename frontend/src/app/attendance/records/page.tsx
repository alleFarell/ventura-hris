import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { DailyAttendanceRecordsSection } from "@/features/attendance/components/DailyAttendanceRecordsSection";

export const metadata: Metadata = {
  title: "Attendance Records - Ventura HRIS",
  description: "View and filter employee daily attendance, working hours, and punch records.",
};

export default function RecordsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <DailyAttendanceRecordsSection />
      </div>
    </AppShell>
  );
}
