import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { PayrollPeriodManager } from "@/features/payroll/components/PayrollPeriodManager";

export const metadata = {
  title: "Pay Periods & Cycles | Ventura HRIS",
};

export default function PayrollPeriodsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <PayrollPeriodManager />
      </div>
    </AppShell>
  );
}
