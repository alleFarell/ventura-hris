import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { TaxConfigSection } from "@/features/payroll/components/TaxConfigSection";

export const metadata = {
  title: "Tax Configuration (PPh 21 / TER) | Ventura HRIS",
};

export default function TaxConfigPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <TaxConfigSection />
      </div>
    </AppShell>
  );
}
