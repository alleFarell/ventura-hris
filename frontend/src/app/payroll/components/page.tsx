import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { SalaryComponentCatalog } from "@/features/payroll/components/SalaryComponentCatalog";

export const metadata = {
  title: "Salary Components | Ventura HRIS",
};

export default function SalaryComponentsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <SalaryComponentCatalog />
      </div>
    </AppShell>
  );
}
