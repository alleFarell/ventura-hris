import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { PayslipCenter } from "@/features/payroll/components/PayslipCenter";

export const metadata = {
  title: "Payslip Distribution | Ventura HRIS",
};

export default function PayslipsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <PayslipCenter />
      </div>
    </AppShell>
  );
}
