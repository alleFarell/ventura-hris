import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { BenefitManager } from "@/features/payroll/components/BenefitManager";

export const metadata = {
  title: "Corporate Benefits | Ventura HRIS",
};

export default function BenefitsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <BenefitManager />
      </div>
    </AppShell>
  );
}
