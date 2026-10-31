"use client";

import { useEffect, useState } from "react";
import { performanceApi } from "../api";
import { PerformanceCycle, PerformanceGoal, PerformanceGoalKeyResult } from "../types";
import { Target, TrendingUp, CheckCircle, Plus, RefreshCw, X, Edit3, Award } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function PerformanceGoalManager() {
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Goal Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cycleId, setCycleId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("INDIVIDUAL");
  const [weight, setWeight] = useState(100);
  const [keyResults, setKeyResults] = useState<PerformanceGoalKeyResult[]>([
    { description: "Achieve Key Result #1", metricType: "PERCENTAGE", targetValue: 100, currentValue: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check-In Modal
  const [checkInGoalId, setCheckInGoalId] = useState<string | null>(null);
  const [checkInKr, setCheckInKr] = useState<PerformanceGoalKeyResult | null>(null);
  const [newCurrentValue, setNewCurrentValue] = useState<number>(0);
  const [checkInNotes, setCheckInNotes] = useState("");

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cycleList, empList] = await Promise.all([
        performanceApi.getCycles(),
        getEmployees(),
      ]);
      setCycles(cycleList);
      setEmployees(empList);

      const activeCycle = cycleList.find((c) => c.status === "ACTIVE") || cycleList[0];
      const cycleToUse = selectedCycleId || (activeCycle ? activeCycle.id : "");
      if (cycleToUse && !selectedCycleId) {
        setSelectedCycleId(cycleToUse);
        setCycleId(cycleToUse);
      }
      if (empList.length > 0 && !employeeId) {
        setEmployeeId(empList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load performance goals");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoals = async (cId: string) => {
    if (!cId) {
      setGoals([]);
      return;
    }
    try {
      const goalList = await performanceApi.getGoals(cId);
      setGoals(goalList);
    } catch (err: any) {
      setError(err?.message || "Failed to load performance goals");
    }
  };

  const loadData = async () => {
    await loadInitialData();
    if (selectedCycleId) {
      await loadGoals(selectedCycleId);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      loadGoals(selectedCycleId);
    }
  }, [selectedCycleId]);

  const handleAddKrField = () => {
    setKeyResults([
      ...keyResults,
      { description: "", metricType: "PERCENTAGE", targetValue: 100, currentValue: 0 },
    ]);
  };

  const handleRemoveKrField = (index: number) => {
    setKeyResults(keyResults.filter((_, i) => i !== index));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleId || !employeeId || !title) return;
    setIsSubmitting(true);
    try {
      await performanceApi.createGoal({
        cycleId,
        employeeId,
        title,
        description: description || undefined,
        category,
        weight: Number(weight),
        keyResults,
      });
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setKeyResults([{ description: "Achieve Key Result #1", metricType: "PERCENTAGE", targetValue: 100, currentValue: 0 }]);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInGoalId || !checkInKr || !checkInKr.id) return;
    setIsSubmitting(true);
    try {
      await performanceApi.updateKeyResultProgress(checkInGoalId, checkInKr.id, {
        currentValue: Number(newCurrentValue),
        notes: checkInNotes || undefined,
      });
      setCheckInGoalId(null);
      setCheckInKr(null);
      setCheckInNotes("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to record check-in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgProgress =
    goals.length > 0
      ? (goals.reduce((acc, g) => acc + Number(g.progressPercent), 0) / goals.length).toFixed(1)
      : "0.0";
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Goals & OKRs Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Establish cascading Objectives & Key Results, track milestone progress, and record regular check-ins.
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Set New Goal / OKR
          </button>
        </div>
      </div>

      {/* Cycle Selector & Metrics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase text-gray-500">Active Cycle:</span>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-xs text-gray-500 block">Total Goals</span>
            <strong className="text-gray-900 text-base">{goals.length}</strong>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Avg Achievement</span>
            <strong className="text-indigo-600 text-base">{avgProgress}%</strong>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Completed</span>
            <strong className="text-emerald-600 text-base">{completedCount}</strong>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Goals List */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading goals and OKRs...</div>
      ) : goals.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <Target className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No goals found for this cycle</h3>
          <p className="text-sm text-gray-500 mt-1">Add OKRs or performance milestones for your team members.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-indigo-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        goal.category === "COMPANY"
                          ? "bg-purple-100 text-purple-800"
                          : goal.category === "DEPARTMENT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {goal.category}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        goal.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {goal.status}
                    </span>
                    <span className="text-xs text-gray-400">Weight: {goal.weight}%</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1.5">{goal.title}</h3>
                  <p className="text-xs text-gray-500">
                    Owner: <strong className="text-gray-700">{goal.employeeName}</strong> ({goal.employeeNumber})
                  </p>
                </div>

                {/* Overall Goal Progress Bar */}
                <div className="sm:text-right min-w-[160px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Overall Goal: <span className="text-indigo-600 font-bold">{goal.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        Number(goal.progressPercent) >= 100
                          ? "bg-emerald-500"
                          : Number(goal.progressPercent) >= 50
                          ? "bg-indigo-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, Number(goal.progressPercent))}%` }}
                    />
                  </div>
                </div>
              </div>

              {goal.description && (
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {goal.description}
                </p>
              )}

              {/* Key Results Section */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Key Results & Deliverables</span>
                <div className="grid grid-cols-1 gap-2">
                  {goal.keyResults.map((kr) => (
                    <div
                      key={kr.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{kr.description}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-3">
                          <span>
                            Target: <strong>{kr.targetValue}</strong> ({kr.metricType})
                          </span>
                          <span>
                            Current: <strong>{kr.currentValue || 0}</strong>
                          </span>
                          {kr.notes && <span className="italic text-gray-400">Last note: {kr.notes}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, Number(kr.progressPercent || 0))}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 min-w-[40px] text-right">
                          {kr.progressPercent || 0}%
                        </span>
                        <button
                          onClick={() => {
                            setCheckInGoalId(goal.id);
                            setCheckInKr(kr);
                            setNewCurrentValue(kr.currentValue || 0);
                            setCheckInNotes(kr.notes || "");
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          Check-In
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Set Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Set Objective & Key Results (OKR)</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Review Cycle *
                  </label>
                  <select
                    required
                    value={cycleId}
                    onChange={(e) => setCycleId(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {cycles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Goal Assignee / Employee *
                  </label>
                  <select
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Objective Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modernize Microservices Infrastructure"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Goal Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="INDIVIDUAL">Individual Contribution</option>
                    <option value="DEPARTMENT">Department Milestone</option>
                    <option value="COMPANY">Company Strategic OKR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Weight (% in review)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed context and deliverables for this objective..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Key Results Builder */}
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-gray-700">Measurable Key Results</span>
                  <button
                    type="button"
                    onClick={handleAddKrField}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    + Add Key Result
                  </button>
                </div>

                {keyResults.map((kr, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600">Key Result #{idx + 1}</span>
                      {keyResults.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKrField(idx)}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deploy 10 services or reach 95% SLA"
                      value={kr.description}
                      onChange={(e) => {
                        const copy = [...keyResults];
                        copy[idx].description = e.target.value;
                        setKeyResults(copy);
                      }}
                      className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={kr.metricType}
                        onChange={(e) => {
                          const copy = [...keyResults];
                          copy[idx].metricType = e.target.value as any;
                          setKeyResults(copy);
                        }}
                        className="text-xs border border-gray-300 rounded-md p-1.5 bg-white"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="NUMBER">Numeric Count</option>
                        <option value="CURRENCY">Currency Amount</option>
                        <option value="BOOLEAN">Binary Done/Not Done</option>
                      </select>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Target value"
                        value={kr.targetValue}
                        onChange={(e) => {
                          const copy = [...keyResults];
                          copy[idx].targetValue = Number(e.target.value);
                          setKeyResults(copy);
                        }}
                        className="text-xs border border-gray-300 rounded-md p-1.5 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Check-In Modal */}
      {checkInKr && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Key Result Check-In</h3>
              <button
                onClick={() => setCheckInKr(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">{checkInKr.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: <strong>{checkInKr.targetValue}</strong> ({checkInKr.metricType})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  New Current Achieved Value *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={newCurrentValue}
                  onChange={(e) => setNewCurrentValue(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Progress Check-In Notes
                </label>
                <textarea
                  rows={3}
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="Summarize recent milestones reached or impediments encountered..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCheckInKr(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Record Progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
