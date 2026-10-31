import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { JobPostingManager } from "@/features/recruitment/components/JobPostingManager";

export const metadata = {
  title: "Job Postings | Ventura HRIS",
};

export default function JobPostingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="recruitment" hideHeader />
        <JobPostingManager />
      </div>
    </AppShell>
  );
}
