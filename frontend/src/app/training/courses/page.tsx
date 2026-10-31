import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { CourseCatalogManager } from "@/features/training/components/CourseCatalogManager";

export const metadata = {
  title: "Course Catalog | Ventura HRIS",
};

export default function CoursesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="training" hideHeader />
        <CourseCatalogManager />
      </div>
    </AppShell>
  );
}
