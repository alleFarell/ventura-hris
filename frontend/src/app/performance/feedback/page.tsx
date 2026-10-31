import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { Feedback360Manager } from "@/features/performance/components/Feedback360Manager";

export const metadata = {
  title: "360-Degree Peer Feedback | Ventura HRIS",
};

export default function FeedbackPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="performance" hideHeader />
        <Feedback360Manager />
      </div>
    </AppShell>
  );
}
