import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { PerformanceCycleManager } from "@/features/performance/components/PerformanceCycleManager";

export const metadata = {
  title: "Performance Review Cycles | Ventura HRIS",
};

export default function PerformanceCyclesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="performance" hideHeader />
        <PerformanceCycleManager />
      </div>
    </AppShell>
  );
}
