"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { LeaveCalendarSection } from "@/features/leave/components/LeaveCalendarSection";
import { getLeaveCalendar } from "@/features/leave/api";
import { LeaveRequest } from "@/features/leave/types";

export default function LeaveCalendarPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLeaveCalendar();
      setLeaves(data);
    } catch {
      console.error("Failed to load leave calendar");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ModuleNav module="leave" />
        <LeaveCalendarSection leaves={leaves} isLoading={isLoading} />
      </div>
    </AppShell>
  );
}
