import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { CompetencyManager } from "@/features/performance/components/CompetencyManager";

export const metadata = {
  title: "Competency Framework & Matrix | Ventura HRIS",
};

export default function CompetenciesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="performance" hideHeader />
        <CompetencyManager />
      </div>
    </AppShell>
  );
}
