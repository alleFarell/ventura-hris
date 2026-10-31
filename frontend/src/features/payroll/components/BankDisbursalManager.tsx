"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { BankDisbursalBatch, BankDisbursalItem, PayrollRun } from "../types";
import { Download, RefreshCw, X, Eye, Check, Landmark, FileSpreadsheet } from "lucide-react";

export function BankDisbursalManager() {
  const [batches, setBatches] = useState<BankDisbursalBatch[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [bankCode, setBankCode] = useState("BCA");
  const [isGenerating, setIsGenerating] = useState(false);

  // Selected batch for file preview / items
  const [selectedBatch, setSelectedBatch] = useState<BankDisbursalBatch | null>(null);
  const [batchItems, setBatchItems] = useState<BankDisbursalItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [batchesData, runsData] = await Promise.all([
        payrollApi.getDisbursalBatches(),
        payrollApi.getPayrollRuns(),
      ]);
      setBatches(batchesData);
      setRuns(runsData);
      if (runsData.length > 0 && !selectedRunId) {
        setSelectedRunId(runsData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load bank disbursal batches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRunId) return;
    setIsGenerating(true);
    try {
      await payrollApi.generateDisbursalBatch({
        payrollRunId: selectedRunId,
        bankCode,
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to generate bank transfer file");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewBatch = async (batch: BankDisbursalBatch) => {
    setSelectedBatch(batch);
    setIsLoadingItems(true);
    try {
      const items = await payrollApi.getDisbursalBatchItems(batch.id);
      setBatchItems(items);
    } catch (err: any) {
      alert(err?.message || "Failed to load batch items");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleMarkDisbursed = async (batchId: string) => {
    try {
      await payrollApi.updateDisbursalStatus(batchId, "DISBURSED");
      await loadData();
      if (selectedBatch?.id === batchId) {
        setSelectedBatch((prev) => (prev ? { ...prev, status: "DISBURSED" } : null));
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update disbursal status");
    }
  };

  const downloadTxt = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bank Transfer Disbursals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate and export compliant bulk bank transfer files (BCA, Mandiri, BRI, Generic format) for payroll clearing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Landmark className="w-4 h-4" />
            Create Disbursal Batch
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Disbursal Batches</h2>
          <span className="text-xs text-gray-500">{batches.length} batches</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading disbursal batches...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-500">{error}</div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-900">No bank disbursal batches generated</div>
            <div className="text-xs text-gray-500 mt-1">
              Click &quot;Create Disbursal Batch&quot; to export bank payout files.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Batch Number</th>
                  <th className="px-6 py-3">Bank</th>
                  <th className="px-6 py-3">Run #</th>
                  <th className="px-6 py-3">Records</th>
                  <th className="px-6 py-3">Total Disbursal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{b.batchNumber}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-700">{b.bankCode}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{b.runNumber}</td>
                    <td className="px-6 py-4">{b.totalRecords} employees</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b.status === "DISBURSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewBatch(b)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded hover:bg-indigo-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                      {b.fileContent && (
                        <button
                          onClick={() => downloadTxt(`${b.batchNumber}.csv`, b.fileContent!)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          File
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Create Bank Transfer Batch</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Payroll Batch Run</label>
                <select
                  value={selectedRunId}
                  onChange={(e) => setSelectedRunId(e.target.value)}
                  required
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Payroll Run --</option>
                  {runs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.runNumber} - {r.periodName || r.periodCode} ({r.totalEmployees} employees)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Clearing Bank Format</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="BCA">Bank Central Asia (BCA Payroll File)</option>
                  <option value="MANDIRI">Bank Mandiri (MCM Format)</option>
                  <option value="BRI">Bank Rakyat Indonesia (BRI Cash Mgmt)</option>
                  <option value="BNI">Bank Negara Indonesia (BNI Direct)</option>
                  <option value="GENERIC">Generic CSV Bank Transfer Format</option>
                </select>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isGenerating ? "Exporting..." : "Generate Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Batch: {selectedBatch.batchNumber}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bank: {selectedBatch.bankCode} | Amount: {formatCurrency(selectedBatch.totalAmount)} | Status: {selectedBatch.status}
                </p>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Transfer Records</h4>
                {selectedBatch.status !== "DISBURSED" && (
                  <button
                    onClick={() => handleMarkDisbursed(selectedBatch.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Disbursed
                  </button>
                )}
              </div>

              {isLoadingItems ? (
                <div className="text-center py-8 text-sm text-gray-500">Loading items...</div>
              ) : batchItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">No items in this batch.</div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5">Bank</th>
                        <th className="px-4 py-2.5">Account Number</th>
                        <th className="px-4 py-2.5">Account Holder</th>
                        <th className="px-4 py-2.5 text-right font-bold">Payout Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batchItems.map((it) => (
                        <tr key={it.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-900">{it.employeeName}</td>
                          <td className="px-4 py-2.5">{it.bankName}</td>
                          <td className="px-4 py-2.5 font-mono">{it.accountNumber}</td>
                          <td className="px-4 py-2.5">{it.accountHolder}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                            {formatCurrency(it.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedBatch(null)}
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
