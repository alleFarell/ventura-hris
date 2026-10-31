import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { WebClockInOutCard } from "@/features/attendance/components/WebClockInOutCard";

export const metadata: Metadata = {
  title: "Web Clock In/Out - Ventura HRIS",
  description: "Self-service online attendance punch with geolocation and IP verification.",
};

export default function PunchPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="attendance" hideHeader />
        <div className="max-w-4xl mx-auto">
          <WebClockInOutCard />
        </div>
      </div>
    </AppShell>
  );
}
