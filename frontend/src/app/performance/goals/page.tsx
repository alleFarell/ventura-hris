import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { PerformanceGoalManager } from "@/features/performance/components/PerformanceGoalManager";

export const metadata = {
  title: "Goals & OKRs Management | Ventura HRIS",
};

export default function PerformanceGoalsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="performance" hideHeader />
        <PerformanceGoalManager />
      </div>
    </AppShell>
  );
}
