import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { JobOfferManager } from "@/features/recruitment/components/JobOfferManager";

export const metadata = {
  title: "Job Offers & Formal Hiring | Ventura HRIS",
};

export default function JobOfferManagerPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="recruitment" hideHeader />
        <JobOfferManager />
      </div>
    </AppShell>
  );
}
