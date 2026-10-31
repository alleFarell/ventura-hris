import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { EmployeeReimbursementManager } from "@/features/payroll/components/EmployeeReimbursementManager";

export const metadata = {
  title: "Expense Reimbursements | Ventura HRIS",
};

export default function EmployeeReimbursementsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <EmployeeReimbursementManager />
      </div>
    </AppShell>
  );
}
