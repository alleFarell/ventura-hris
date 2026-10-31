import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { AssetInventoryManager } from "@/features/assets/components/AssetInventoryManager";

export const metadata = {
  title: "Company Assets | Ventura HRIS",
};

export default function AssetsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="assets" hideHeader />
        <AssetInventoryManager />
      </div>
    </AppShell>
  );
}
