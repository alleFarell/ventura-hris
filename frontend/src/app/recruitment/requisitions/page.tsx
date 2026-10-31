import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { JobRequisitionManager } from "@/features/recruitment/components/JobRequisitionManager";

export const metadata = {
  title: "Job Requisitions | Ventura HRIS",
};

export default function JobRequisitionsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="recruitment" hideHeader />
        <JobRequisitionManager />
      </div>
    </AppShell>
  );
}
