import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { WfhManagementSection } from "@/features/attendance/components/WfhManagementSection";

export const metadata: Metadata = {
  title: "Work From Home Requests - Ventura HRIS",
  description: "Submit remote work applications, manage supervisor approvals, and audit remote days.",
};

export default function WfhPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <WfhManagementSection />
      </div>
    </AppShell>
  );
}
