import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { AppraisalManager } from "@/features/performance/components/AppraisalManager";

export const metadata = {
  title: "Appraisals & Performance Reviews | Ventura HRIS",
};

export default function AppraisalsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="performance" hideHeader />
        <AppraisalManager />
      </div>
    </AppShell>
  );
}
