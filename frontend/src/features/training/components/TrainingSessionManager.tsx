"use client";

import { useEffect, useState } from "react";
import { trainingApi } from "../api";
import { TrainingCourse, TrainingSession, TrainingEnrollment } from "../types";
import { Calendar, Users, Plus, RefreshCw, X, MapPin, User, CheckCircle, Award } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function TrainingSessionManager() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Session Modal
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [instructorName, setInstructorName] = useState("");
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Enroll Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [employeeIdToEnroll, setEmployeeIdToEnroll] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Update Status Modal
  const [updatingEnrollment, setUpdatingEnrollment] = useState<TrainingEnrollment | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState("COMPLETED");
  const [updateScore, setUpdateScore] = useState("100");
  const [updateCertUrl, setUpdateCertUrl] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionList, courseList, empList] = await Promise.all([
        trainingApi.getSessions(),
        trainingApi.getCourses(),
        getEmployees(),
      ]);
      setSessions(sessionList);
      setCourses(courseList);
      setEmployees(empList);

      if (courseList.length > 0 && !courseId) {
        setCourseId(courseList[0].id);
      }
      if (empList.length > 0 && !employeeIdToEnroll) {
        setEmployeeIdToEnroll(empList[0].id);
      }

      // If a session was selected, refresh its roster
      if (selectedSession) {
        const found = sessionList.find((s) => s.id === selectedSession.id);
        if (found) {
          setSelectedSession(found);
          const roster = await trainingApi.getEnrollments(found.id);
          setEnrollments(roster);
        }
      } else if (sessionList.length > 0) {
        setSelectedSession(sessionList[0]);
        const roster = await trainingApi.getEnrollments(sessionList[0].id);
        setEnrollments(roster);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSession = async (s: TrainingSession) => {
    setSelectedSession(s);
    try {
      const roster = await trainingApi.getEnrollments(s.id);
      setEnrollments(roster);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !sessionName || !startTime || !endTime) return;
    setIsSubmittingSession(true);
    try {
      await trainingApi.createSession({
        courseId,
        sessionName,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        location: location || undefined,
        capacity: Number(capacity),
        status: "SCHEDULED",
        instructorName: instructorName || undefined,
      });
      setShowSessionModal(false);
      setSessionName("");
      setLocation("");
      setInstructorName("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create session");
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleEnrollEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !employeeIdToEnroll) return;
    setIsEnrolling(true);
    try {
      await trainingApi.enrollEmployee({
        sessionId: selectedSession.id,
        employeeId: employeeIdToEnroll,
        status: "APPROVED",
      });
      setShowEnrollModal(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to enroll employee");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingEnrollment) return;
    setIsUpdatingStatus(true);
    try {
      await trainingApi.updateEnrollmentStatus(updatingEnrollment.id, {
        status: updateStatusVal,
        score: updateScore ? parseFloat(updateScore) : undefined,
        certificateUrl: updateCertUrl || undefined,
      });
      setUpdatingEnrollment(null);
      if (selectedSession) {
        const roster = await trainingApi.getEnrollments(selectedSession.id);
        setEnrollments(roster);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update enrollment");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Training Sessions & Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule cohorts, monitor seat availability, enroll candidates, and track completion scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSessionModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Session
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading sessions...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Scheduled Sessions</h2>
            {sessions.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-xl border border-gray-200 text-gray-500 text-sm">
                No sessions found. Click &quot;Schedule Session&quot; to begin.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = selectedSession?.id === s.id;
                const percentFull = Math.min(100, Math.round(((s.enrolledCount || 0) / s.capacity) * 100));
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-50/50 border-indigo-500 shadow-sm"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {s.status}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{s.courseCode}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">{s.sessionName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.courseTitle}</p>

                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(s.startTime).toLocaleDateString()}</span>
                      </div>
                      {s.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{s.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Seats filled</span>
                        <span className="font-semibold text-gray-700">
                          {s.enrolledCount} / {s.capacity} ({percentFull}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            percentFull >= 100 ? "bg-red-500" : percentFull >= 75 ? "bg-amber-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Session Details & Attendee Roster */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSession ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {selectedSession.courseCode} - {selectedSession.courseTitle}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedSession.sessionName}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Instructor: <strong>{selectedSession.instructorName || "TBD"}</strong> | Location: <strong>{selectedSession.location || "Virtual"}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    disabled={selectedSession.enrolledCount >= selectedSession.capacity}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg font-medium text-xs shadow-sm self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Enroll Employee
                  </button>
                </div>

                {/* Attendee Roster */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-800">
                      Enrolled Attendees ({enrollments.length} / {selectedSession.capacity})
                    </h3>
                  </div>

                  {enrollments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border border-dashed rounded-xl">
                      No employees enrolled in this cohort yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                      <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-3">Employee</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {enrollments.map((e) => (
                            <tr key={e.id} className="hover:bg-gray-50/60">
                              <td className="px-4 py-3 font-medium text-gray-900">
                                <div>{e.employeeName || "N/A"}</div>
                                <div className="text-gray-400 font-mono text-[10px]">{e.employeeNumber}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    e.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : e.status === "APPROVED"
                                      ? "bg-blue-100 text-blue-800"
                                      : e.status === "CANCELLED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {e.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-800">
                                {e.score !== undefined && e.score !== null ? `${e.score}%` : "-"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => {
                                    setUpdatingEnrollment(e);
                                    setUpdateStatusVal(e.status);
                                    setUpdateScore(e.score?.toString() || "");
                                    setUpdateCertUrl(e.certificateUrl || "");
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                  Update Status
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-400">
                Select a session to inspect attendees and roster
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Schedule Training Session</h2>
              <button
                onClick={() => setShowSessionModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Course *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Session / Cohort Name *</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. 2027 Cohort 1 - Weekend Intensive"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Capacity (Seats) *</label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Instructor / Trainer</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="e.g. John Doe, M.Sc."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Room / Link</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Auditorium B / Zoom URL"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSession}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSubmittingSession ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Enroll Employee in Session</h2>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Employee *</label>
                <select
                  value={employeeIdToEnroll}
                  onChange={(e) => setEmployeeIdToEnroll(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeNumber}] {emp.firstName} {emp.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isEnrolling ? "Enrolling..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updatingEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Update Attendance & Grade</h2>
              <button
                onClick={() => setUpdatingEnrollment(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status *</label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="ATTENDED">ATTENDED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Final Score (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={updateScore}
                  onChange={(e) => setUpdateScore(e.target.value)}
                  placeholder="e.g. 95.0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Certificate URL</label>
                <input
                  type="url"
                  value={updateCertUrl}
                  onChange={(e) => setUpdateCertUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUpdatingEnrollment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
