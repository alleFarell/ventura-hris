"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { EmployeeSalaryComponentItem, EmployeeSalaryProfile, SalaryComponent } from "../types";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";
import { Wallet, AlertCircle, CheckCircle2, Plus, Trash2, Save, UserCheck, RefreshCw } from "lucide-react";

export function EmployeeCompensationSection({ initialEmployeeId }: { initialEmployeeId?: string }) {
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || "");
  const [componentsList, setComponentsList] = useState<SalaryComponent[]>([]);
  const [profile, setProfile] = useState<EmployeeSalaryProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form editable state
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [bankName, setBankName] = useState<string>("BCA");
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankAccountHolder, setBankAccountHolder] = useState<string>("");
  const [taxStatus, setTaxStatus] = useState<string>("TK/0");
  const [items, setItems] = useState<EmployeeSalaryComponentItem[]>([]);

  useEffect(() => {
    async function loadInit() {
      try {
        const [empData, compData] = await Promise.all([
          getEmployees(),
          payrollApi.getSalaryComponents(true),
        ]);
        setEmployees(empData);
        setComponentsList(compData);

        if (!selectedEmpId && empData.length > 0) {
          setSelectedEmpId(empData[0].id);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load initial data");
      }
    }
    loadInit();
  }, []);

  useEffect(() => {
    if (!selectedEmpId) return;
    loadProfile(selectedEmpId);
  }, [selectedEmpId]);

  const loadProfile = async (empId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await payrollApi.getEmployeeCompensation(empId);
      setProfile(data);
      setBasicSalary(data.basicSalary || 0);
      setEffectiveDate(data.effectiveDate || new Date().toISOString().split("T")[0]);
      setPaymentMethod(data.paymentMethod || "BANK_TRANSFER");
      setBankName(data.bankName || "BCA");
      setBankAccountNumber(data.bankAccountNumber || "");
      setBankAccountHolder(data.bankAccountHolder || data.employeeName || "");
      setTaxStatus(data.taxStatus || "TK/0");
      setItems(data.components || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load compensation profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComponent = (compId: string) => {
    const found = componentsList.find((c) => c.id === compId);
    if (!found) return;
    if (items.some((i) => i.componentId === compId)) {
      alert("This component is already added");
      return;
    }
    setItems([
      ...items,
      {
        componentId: found.id,
        componentCode: found.code,
        componentName: found.name,
        type: found.type,
        amount: found.defaultAmount || 0,
      },
    ]);
  };

  const handleRemoveComponent = (compId: string) => {
    setItems(items.filter((i) => i.componentId !== compId));
  };

  const handleUpdateItemAmount = (compId: string, amount: number) => {
    setItems(items.map((i) => (i.componentId === compId ? { ...i, amount } : i)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await payrollApi.updateEmployeeCompensation(selectedEmpId, {
        basicSalary,
        currency: "IDR",
        effectiveDate,
        paymentMethod,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        taxStatus,
        components: items,
      });
      setProfile(updated);
      setSuccessMsg("Employee compensation profile saved successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculated totals
  const totalAllowances = items
    .filter((i) => i.type?.startsWith("EARNING"))
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const totalDeductions = items
    .filter((i) => i.type?.startsWith("DEDUCTION"))
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const estimatedTakeHome = Math.max(0, Number(basicSalary || 0) + totalAllowances - totalDeductions);

  const isWithinBounds =
    profile?.gradeMinSalary && profile?.gradeMaxSalary
      ? basicSalary >= profile.gradeMinSalary && basicSalary <= profile.gradeMaxSalary
      : true;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employee Compensation Profiles</h2>
          <p className="text-xs text-slate-500">
            Manage individual base salaries, pay grade benchmarking, bank remittance accounts, and custom allowances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-sm"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.employeeNumber})
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedEmpId && loadProfile(selectedEmpId)}
            className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>}
      {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs">{successMsg}</div>}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base Salary & Grade Benchmarking Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Base Salary & Job Grade Benchmark</h3>
              </div>
              {profile?.gradeName && (
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  Grade: {profile.gradeName}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Basic Salary (IDR) *</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  required
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Grade Band Compliance Indicator */}
            {profile?.gradeMinSalary && profile?.gradeMaxSalary ? (
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  isWithinBounds
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isWithinBounds ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span>
                    Job Grade Band: <strong>IDR {Number(profile.gradeMinSalary).toLocaleString("id-ID")}</strong> -{" "}
                    <strong>IDR {Number(profile.gradeMaxSalary).toLocaleString("id-ID")}</strong>
                  </span>
                </div>
                <span className="font-bold text-[11px]">
                  {isWithinBounds ? "Within Grade Band" : "Out of Band (Warning)"}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">No salary structure defined for employee's grade.</div>
            )}
          </div>

          {/* Payment & Bank Remittance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Remittance & Tax Filing</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. BCA, Mandiri, BNI"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax Status (PTKP)</label>
                <select
                  value={taxStatus}
                  onChange={(e) => setTaxStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                >
                  <option value="TK/0">TK/0 (Single, 0 Dep.)</option>
                  <option value="TK/1">TK/1 (Single, 1 Dep.)</option>
                  <option value="TK/2">TK/2 (Single, 2 Dep.)</option>
                  <option value="TK/3">TK/3 (Single, 3 Dep.)</option>
                  <option value="K/0">K/0 (Married, 0 Dep.)</option>
                  <option value="K/1">K/1 (Married, 1 Dep.)</option>
                  <option value="K/2">K/2 (Married, 2 Dep.)</option>
                  <option value="K/3">K/3 (Married, 3 Dep.)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="e.g. 5240182910"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Matches bank book"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Custom Allowances & Deductions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Custom Salary Components</h3>
                <p className="text-[11px] text-slate-400">Add fixed monthly allowances or recurring deductions.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddComponent(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                >
                  <option value="">+ Add Component...</option>
                  {componentsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">
                No custom components assigned. Only basic salary applies.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.componentId}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{item.componentName}</span>
                      <span className="ml-2 text-[10px] font-mono text-slate-400">{item.componentCode}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[11px]">IDR</span>
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={item.amount}
                          onChange={(e) => handleUpdateItemAmount(item.componentId, Number(e.target.value))}
                          className="w-28 px-2 py-1 border border-slate-300 rounded font-mono text-right font-semibold text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(item.componentId)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Summary Card & Action */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Estimated Monthly Pay Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Basic Salary</span>
                <span className="font-mono font-medium">IDR {Number(basicSalary).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Total Fixed Allowances</span>
                <span className="font-mono font-medium">+ IDR {totalAllowances.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Total Fixed Deductions</span>
                <span className="font-mono font-medium">- IDR {totalDeductions.toLocaleString("id-ID")}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Estimated Take-Home</span>
                <span className="font-mono text-blue-600">IDR {estimatedTakeHome.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50 mt-4"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving Profile..." : "Save Compensation Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
