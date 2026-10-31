import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { ClearanceChecklistManager } from "@/features/offboarding/components/ClearanceChecklistManager";

export const metadata = {
  title: "Clearance Checklists | Ventura HRIS",
};

export default function ChecklistsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="offboarding" hideHeader />
        <ClearanceChecklistManager />
      </div>
    </AppShell>
  );
}
