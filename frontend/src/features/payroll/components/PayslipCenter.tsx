"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { Payslip, PayrollRun } from "../types";
import { FileText, RefreshCw, Send, CheckCircle, Eye, X, Download } from "lucide-react";

export function PayslipCenter() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [psData, runsData] = await Promise.all([
        payrollApi.getPayslips(),
        payrollApi.getPayrollRuns(),
      ]);
      setPayslips(psData);
      setRuns(runsData);
      if (runsData.length > 0 && !selectedRunId) {
        setSelectedRunId(runsData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load payslips");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedRunId) return;
    setIsGenerating(true);
    try {
      await payrollApi.generatePayslips(selectedRunId);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to generate payslips");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedRunId) return;
    try {
      await payrollApi.publishPayslips(selectedRunId);
      await loadData();
      alert("All payslips published to employee portal successfully.");
    } catch (err: any) {
      alert(err?.message || "Failed to publish payslips");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payslip Distribution Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate digital payslips from confirmed payroll batches and publish them for employee self-service.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg p-2 bg-white"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.runNumber} ({r.periodName || r.periodCode})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedRunId}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              {isGenerating ? "Generating..." : "Generate Payslips"}
            </button>
            <button
              onClick={handlePublish}
              disabled={!selectedRunId}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Generated Payslips</h2>
          <span className="text-xs text-gray-500">{payslips.length} records</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading payslip documents...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-500">{error}</div>
        ) : payslips.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-900">No payslips generated yet</div>
            <div className="text-xs text-gray-500 mt-1">
              Select a payroll run above and click &quot;Generate Payslips&quot;.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Payslip Number</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Gross Salary</th>
                  <th className="px-6 py-3">Deductions</th>
                  <th className="px-6 py-3">Net Salary</th>
                  <th className="px-6 py-3">Published</th>
                  <th className="px-6 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{p.payslipNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {p.employeeName}
                      <span className="block text-xs text-gray-400">{p.employeeNumber}</span>
                    </td>
                    <td className="px-6 py-4">{p.periodName}</td>
                    <td className="px-6 py-4">{p.issueDate}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(p.grossSalary)}</td>
                    <td className="px-6 py-4 text-rose-600">-{formatCurrency(p.totalDeductions)}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(p.netSalary)}</td>
                    <td className="px-6 py-4">
                      {p.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(p)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded hover:bg-indigo-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Modal Preview */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Payslip Slip Document</h3>
                <p className="text-xs text-gray-400">{selectedPayslip.payslipNumber}</p>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-gray-400 block">Employee:</span>
                  <span className="font-semibold text-gray-900">{selectedPayslip.employeeName}</span>
                  <span className="text-gray-400 block">{selectedPayslip.employeeNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Pay Period:</span>
                  <span className="font-semibold text-gray-900">{selectedPayslip.periodName}</span>
                  <span className="text-gray-400 block">Issue Date: {selectedPayslip.issueDate}</span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 uppercase">
                  Earnings Breakdown
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Earnings</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(selectedPayslip.grossSalary)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 uppercase">
                  Deductions Breakdown
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Deductions (Attendance, Tax, Loans)</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 px-4 py-3 flex justify-between items-center text-sm font-bold border-t border-emerald-100">
                  <span className="text-emerald-900">Net Take-Home Payout</span>
                  <span className="text-emerald-700 text-base">{formatCurrency(selectedPayslip.netSalary)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
