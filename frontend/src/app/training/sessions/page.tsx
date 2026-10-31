import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { TrainingSessionManager } from "@/features/training/components/TrainingSessionManager";

export const metadata = {
  title: "Training Sessions | Ventura HRIS",
};

export default function SessionsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="training" hideHeader />
        <TrainingSessionManager />
      </div>
    </AppShell>
  );
}
