import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { EmployeeCertificationManager } from "@/features/training/components/EmployeeCertificationManager";

export const metadata = {
  title: "Employee Certifications | Ventura HRIS",
};

export default function CertificationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="training" hideHeader />
        <EmployeeCertificationManager />
      </div>
    </AppShell>
  );
}
