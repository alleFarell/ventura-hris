import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { PayrollAttendanceCutoffsSection } from "@/features/payroll/components/PayrollAttendanceCutoffsSection";

export const metadata = {
  title: "Attendance Integration | Ventura HRIS",
};

export default function AttendanceIntegrationPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="payroll" hideHeader />
        <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading attendance cutoffs...</div>}>
          <PayrollAttendanceCutoffsSection />
        </Suspense>
      </div>
    </AppShell>
  );
}
