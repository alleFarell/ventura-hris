import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { MyPayslipPortal } from "@/features/payroll/components/MyPayslipPortal";

export const metadata = {
  title: "My Payslips | Ventura HRIS",
};

export default function MyPayslipsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <MyPayslipPortal />
      </div>
    </AppShell>
  );
}
