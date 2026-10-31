"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { BpjsConfiguration, BpjsCalculationResult, EmployeeBpjsEnrollment } from "../types";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";
import { Shield, RefreshCw, Calculator, UserCheck, Edit3, X, Check } from "lucide-react";

export function BpjsCenter() {
  const [activeTab, setActiveTab] = useState<"configs" | "calculator" | "enrollment">("configs");
  const [configs, setConfigs] = useState<BpjsConfiguration[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit config modal
  const [editingConfig, setEditingConfig] = useState<BpjsConfiguration | null>(null);
  const [editEmployerRate, setEditEmployerRate] = useState<number>(0);
  const [editEmployeeRate, setEditEmployeeRate] = useState<number>(0);
  const [editWageCeiling, setEditWageCeiling] = useState<number | undefined>(undefined);

  // Calculator state
  const [calcWage, setCalcWage] = useState<number>(10000000);
  const [calcRiskGrade, setCalcRiskGrade] = useState<number>(1);
  const [calcResults, setCalcResults] = useState<BpjsCalculationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Enrollment state
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [enrollment, setEnrollment] = useState<EmployeeBpjsEnrollment | null>(null);
  const [bpjsKesNumber, setBpjsKesNumber] = useState("");
  const [bpjsTkNumber, setBpjsTkNumber] = useState("");
  const [jkkGrade, setJkkGrade] = useState(1);
  const [isSavingEnrollment, setIsSavingEnrollment] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [configsData, empsData] = await Promise.all([
        payrollApi.getBpjsConfigurations(),
        getEmployees(),
      ]);
      setConfigs(configsData);
      setEmployees(empsData);
      if (empsData.length > 0 && !selectedEmpId) {
        setSelectedEmpId(empsData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load BPJS data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunCalculation = async () => {
    setIsCalculating(true);
    try {
      const res = await payrollApi.calculateBpjs(calcWage, calcRiskGrade);
      setCalcResults(res);
    } catch (err: any) {
      alert(err?.message || "Calculation failed");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleOpenEdit = (c: BpjsConfiguration) => {
    setEditingConfig(c);
    setEditEmployerRate(c.employerRate);
    setEditEmployeeRate(c.employeeRate);
    setEditWageCeiling(c.wageCeiling);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;
    try {
      await payrollApi.updateBpjsConfiguration(editingConfig.id, {
        employerRate: Number(editEmployerRate),
        employeeRate: Number(editEmployeeRate),
        wageCeiling: editWageCeiling ? Number(editWageCeiling) : undefined,
      });
      setEditingConfig(null);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update configuration");
    }
  };

  const handleLoadEnrollment = async (empId: string) => {
    setSelectedEmpId(empId);
    try {
      const enr = await payrollApi.getEmployeeBpjsEnrollment(empId);
      setEnrollment(enr);
      setBpjsKesNumber(enr.bpjsKesNumber || "");
      setBpjsTkNumber(enr.bpjsTkNumber || "");
      setJkkGrade(enr.jkkRiskGrade || 1);
    } catch {
      setEnrollment(null);
      setBpjsKesNumber("");
      setBpjsTkNumber("");
      setJkkGrade(1);
    }
  };

  const handleSaveEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    setIsSavingEnrollment(true);
    try {
      await payrollApi.enrollEmployeeBpjs({
        employeeId: selectedEmpId,
        bpjsKesNumber,
        bpjsTkNumber,
        jkkRiskGrade: Number(jkkGrade),
      });
      await handleLoadEnrollment(selectedEmpId);
      alert("Employee BPJS details saved successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to save enrollment");
    } finally {
      setIsSavingEnrollment(false);
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Social Security & Statutory Benefits (BPJS)
          </h1>
          <p className="text-sm text-gray-500">
            Manage Indonesian BPJS statutory contribution rates, simulate deductions, and administer employee enrollments
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab("configs")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "configs"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Statutory Schemes & Rates
        </button>
        <button
          onClick={() => {
            setActiveTab("calculator");
            if (calcResults.length === 0) handleRunCalculation();
          }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "calculator"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Contribution Simulator
        </button>
        <button
          onClick={() => {
            setActiveTab("enrollment");
            if (selectedEmpId) handleLoadEnrollment(selectedEmpId);
          }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "enrollment"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Employee BPJS Cards
        </button>
      </div>

      {/* TAB 1: Configs */}
      {activeTab === "configs" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="py-3.5 px-4">Program</th>
                <th className="py-3.5 px-4">Employer Rate</th>
                <th className="py-3.5 px-4">Employee Rate</th>
                <th className="py-3.5 px-4">Wage Ceiling</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No BPJS configurations found.
                  </td>
                </tr>
              ) : (
                configs.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {c.programType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">
                        {(c.employerRate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                        {(c.employeeRate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      {formatCurrency(c.wageCeiling)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 max-w-xs truncate">
                      {c.description}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Simulator */}
      {activeTab === "calculator" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              BPJS Statutory Contribution Calculator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Base Wage (IDR)</label>
                <input
                  type="number"
                  value={calcWage}
                  onChange={(e) => setCalcWage(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">JKK Risk Grade (1 - 5)</label>
                <select
                  value={calcRiskGrade}
                  onChange={(e) => setCalcRiskGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value={1}>Grade 1 (Very Low - 0.24%)</option>
                  <option value={2}>Grade 2 (Low - 0.54%)</option>
                  <option value={3}>Grade 3 (Medium - 0.89%)</option>
                  <option value={4}>Grade 4 (High - 1.27%)</option>
                  <option value={5}>Grade 5 (Very High - 1.74%)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRunCalculation}
                  disabled={isCalculating}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"
                >
                  {isCalculating ? "Calculating..." : "Recalculate"}
                </button>
              </div>
            </div>
          </div>

          {calcResults.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                  <tr>
                    <th className="py-3.5 px-4">Scheme</th>
                    <th className="py-3.5 px-4">Basis Wage</th>
                    <th className="py-3.5 px-4">Employer Share</th>
                    <th className="py-3.5 px-4">Employee Share</th>
                    <th className="py-3.5 px-4">Total Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {calcResults.map((r) => (
                    <tr key={r.programType}>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{r.programType}</td>
                      <td className="py-3.5 px-4 font-mono">{formatCurrency(r.basisWage)}</td>
                      <td className="py-3.5 px-4 text-green-700 font-medium">
                        {formatCurrency(r.employerAmount)} ({(r.employerRate * 100).toFixed(2)}%)
                      </td>
                      <td className="py-3.5 px-4 text-blue-700 font-medium">
                        {formatCurrency(r.employeeAmount)} ({(r.employeeRate * 100).toFixed(2)}%)
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{formatCurrency(r.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Enrollment */}
      {activeTab === "enrollment" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 max-w-xl">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Employee BPJS Card Registration
          </h2>
          <form onSubmit={handleSaveEnrollment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Select Employee</label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleLoadEnrollment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeNumber} - {emp.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">BPJS Kesehatan Card Number</label>
              <input
                type="text"
                value={bpjsKesNumber}
                onChange={(e) => setBpjsKesNumber(e.target.value)}
                placeholder="e.g. 0001234567890"
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">BPJS Ketenagakerjaan (KPJ) Number</label>
              <input
                type="text"
                value={bpjsTkNumber}
                onChange={(e) => setBpjsTkNumber(e.target.value)}
                placeholder="e.g. 0009876543210"
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">JKK Risk Grade</label>
              <select
                value={jkkGrade}
                onChange={(e) => setJkkGrade(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value={1}>Grade 1 (0.24%)</option>
                <option value={2}>Grade 2 (0.54%)</option>
                <option value={3}>Grade 3 (0.89%)</option>
                <option value={4}>Grade 4 (1.27%)</option>
                <option value={5}>Grade 5 (1.74%)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSavingEnrollment}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              {isSavingEnrollment ? "Saving..." : "Save BPJS Enrollment"}
            </button>
          </form>
        </div>
      )}

      {/* Edit Config Modal */}
      {editingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit {editingConfig.programType}</h3>
              <button onClick={() => setEditingConfig(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employer Rate (e.g. 0.04 for 4%)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editEmployerRate}
                  onChange={(e) => setEditEmployerRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee Rate (e.g. 0.01 for 1%)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editEmployeeRate}
                  onChange={(e) => setEditEmployeeRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Wage Ceiling (IDR, optional)</label>
                <input
                  type="number"
                  value={editWageCeiling || ""}
                  onChange={(e) => setEditWageCeiling(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
