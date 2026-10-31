import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { PayrollSimulationDashboard } from "@/features/payroll/components/PayrollSimulationDashboard";

export const metadata = {
  title: "Payroll Simulation & Calc | Ventura HRIS",
};

export default function SimulationPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading payroll simulation...</div>}>
          <PayrollSimulationDashboard />
        </Suspense>
      </div>
    </AppShell>
  );
}
