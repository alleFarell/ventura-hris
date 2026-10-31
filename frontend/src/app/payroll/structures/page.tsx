import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { SalaryStructureManager } from "@/features/payroll/components/SalaryStructureManager";

export const metadata = {
  title: "Salary Structures | Ventura HRIS",
};

export default function SalaryStructuresPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <SalaryStructureManager />
      </div>
    </AppShell>
  );
}
