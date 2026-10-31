import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { PayrollRunManager } from "@/features/payroll/components/PayrollRunManager";

export const metadata = {
  title: "Payroll Runs | Ventura HRIS",
};

export default function PayrollRunsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <PayrollRunManager />
      </div>
    </AppShell>
  );
}
