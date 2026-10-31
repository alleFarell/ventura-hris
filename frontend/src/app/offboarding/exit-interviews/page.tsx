import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { ExitInterviewManager } from "@/features/offboarding/components/ExitInterviewManager";

export const metadata = {
  title: "Exit Interviews | Ventura HRIS",
};

export default function ExitInterviewsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="offboarding" hideHeader />
        <ExitInterviewManager />
      </div>
    </AppShell>
  );
}
