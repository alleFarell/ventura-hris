import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { AtsCandidatePipeline } from "@/features/recruitment/components/AtsCandidatePipeline";

export const metadata = {
  title: "Candidate Pipeline (ATS) | Ventura HRIS",
};

export default function AtsCandidatePipelinePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="recruitment" hideHeader />
        <AtsCandidatePipeline />
      </div>
    </AppShell>
  );
}
