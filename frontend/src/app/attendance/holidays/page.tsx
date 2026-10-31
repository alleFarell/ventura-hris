import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { HolidayManagementSection } from "@/features/attendance/components/HolidayManagementSection";

export const metadata: Metadata = {
  title: "Company Public Holidays - Ventura HRIS",
  description: "Configure statutory holidays, collective leave, and enterprise non-working days.",
};

export default function HolidaysPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <HolidayManagementSection />
      </div>
    </AppShell>
  );
}
