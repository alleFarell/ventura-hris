import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { OvertimeManagementSection } from "@/features/attendance/components/OvertimeManagementSection";

export const metadata: Metadata = {
  title: "Overtime Requests - Ventura HRIS",
  description: "Submit, review, and track employee overtime approvals and compensation rates.",
};

export default function OvertimePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <OvertimeManagementSection />
      </div>
    </AppShell>
  );
}
