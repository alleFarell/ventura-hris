import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { EmployeeCompensationSection } from "@/features/payroll/components/EmployeeCompensationSection";

export const metadata = {
  title: "Employee Compensation Profiles | Ventura HRIS",
};

export default function CompensationPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <EmployeeCompensationSection />
      </div>
    </AppShell>
  );
}
