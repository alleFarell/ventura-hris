import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { EmployeeLoanManager } from "@/features/payroll/components/EmployeeLoanManager";

export const metadata = {
  title: "Employee Loans | Ventura HRIS",
};

export default function EmployeeLoansPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <EmployeeLoanManager />
      </div>
    </AppShell>
  );
}
