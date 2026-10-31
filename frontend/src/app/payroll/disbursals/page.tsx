import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { BankDisbursalManager } from "@/features/payroll/components/BankDisbursalManager";

export const metadata = {
  title: "Bank Disbursals | Ventura HRIS",
};

export default function BankDisbursalsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <BankDisbursalManager />
      </div>
    </AppShell>
  );
}
