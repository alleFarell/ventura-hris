import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { AssetAllocationManager } from "@/features/assets/components/AssetAllocationManager";

export const metadata = {
  title: "Asset Allocations & Returns | Ventura HRIS",
};

export default function AllocationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="assets" hideHeader />
        <AssetAllocationManager />
      </div>
    </AppShell>
  );
}
