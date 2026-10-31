import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { BpjsCenter } from "@/features/payroll/components/BpjsCenter";

export const metadata = {
  title: "Social Security (BPJS) | Ventura HRIS",
};

export default function BpjsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <BpjsCenter />
      </div>
    </AppShell>
  );
}
