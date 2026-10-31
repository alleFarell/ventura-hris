import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { OffboardingCaseManager } from "@/features/offboarding/components/OffboardingCaseManager";

export const metadata = {
  title: "Offboarding Cases | Ventura HRIS",
};

export default function CasesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="offboarding" hideHeader />
        <OffboardingCaseManager />
      </div>
    </AppShell>
  );
}
