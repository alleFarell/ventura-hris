import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { InterviewScheduler } from "@/features/recruitment/components/InterviewScheduler";

export const metadata = {
  title: "Interview Scheduling & Scorecards | Ventura HRIS",
};

export default function InterviewSchedulerPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="recruitment" hideHeader />
        <InterviewScheduler />
      </div>
    </AppShell>
  );
}
