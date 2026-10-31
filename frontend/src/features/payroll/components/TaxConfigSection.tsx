"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { PtkpConfiguration, TaxCalculationResponse, TaxConfiguration } from "../types";
import { Calculator, Percent, ShieldCheck, RefreshCw, Layers } from "lucide-react";

export function TaxConfigSection() {
  const [brackets, setBrackets] = useState<TaxConfiguration[]>([]);
  const [ptkpList, setPtkpList] = useState<PtkpConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live Calculator State
  const [calcGross, setCalcGross] = useState<number>(120000000);
  const [calcStatus, setCalcStatus] = useState<string>("TK/0");
  const [calcResult, setCalcResult] = useState<TaxCalculationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bData, pData] = await Promise.all([
        payrollApi.getTaxBrackets(2026),
        payrollApi.getPtkpList(),
      ]);
      setBrackets(bData);
      setPtkpList(pData);

      // Initial calculation
      const initialCalc = await payrollApi.calculateTax({
        annualGrossIncome: 120000000,
        taxStatus: "TK/0",
        taxYear: 2026,
      });
      setCalcResult(initialCalc);
    } catch (err: any) {
      setError(err?.message || "Failed to load tax configuration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    try {
      const res = await payrollApi.calculateTax({
        annualGrossIncome: Number(calcGross),
        taxStatus: calcStatus,
        taxYear: 2026,
      });
      setCalcResult(res);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Calculation failed");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tax & Social Security Configuration (PPh 21)</h2>
          <p className="text-xs text-slate-500">
            Statutory progressive tax brackets (UU HPP), non-taxable relief allowances (PTKP), and progressive simulation engine.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>}

      {/* Interactive Simulation Sandbox */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-400">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live PPh 21 Progressive Tax Calculator</h3>
            <p className="text-[11px] text-slate-400">Simulate annualized income tax and monthly withholding deductions in real time.</p>
          </div>
        </div>

        <form onSubmit={handleRunCalculation} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Annual Gross Income (IDR)</label>
            <input
              type="number"
              min="0"
              step="1000000"
              value={calcGross}
              onChange={(e) => setCalcGross(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[10px] text-slate-400">≈ IDR {(Number(calcGross) / 12).toLocaleString("id-ID")} / month</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tax Marital Status (PTKP)</label>
            <select
              value={calcStatus}
              onChange={(e) => setCalcStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-blue-500"
            >
              {ptkpList.map((p) => (
                <option key={p.id} value={p.taxStatus} className="bg-slate-900 text-white">
                  {p.taxStatus} ({p.description || `IDR ${p.annualNonTaxableAmount.toLocaleString("id-ID")}`})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isCalculating ? "Calculating..." : "Recalculate Tax"}
            </button>
          </div>
        </form>

        {calcResult && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-700 pb-3 text-center">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">PTKP Exemption</p>
                <p className="text-xs font-bold text-emerald-400">IDR {Number(calcResult.ptkpAmount).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Taxable Base (PKP)</p>
                <p className="text-xs font-bold text-amber-400">IDR {Number(calcResult.annualTaxableIncome).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Annual Tax (PPh 21)</p>
                <p className="text-xs font-bold text-rose-400">IDR {Number(calcResult.annualTaxAmount).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Monthly Deduction</p>
                <p className="text-sm font-black text-white">IDR {Number(calcResult.monthlyTaxAmount).toLocaleString("id-ID")}</p>
              </div>
            </div>

            {/* Tier Breakdown */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Progressive Bracket Breakdown:</p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {calcResult.breakdown.map((item) => (
                  <div key={item.bracketOrder} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] font-bold text-blue-400">Tier {item.bracketOrder} ({item.taxRatePercent}%)</p>
                    <p className="text-[9px] text-slate-400">
                      {item.maxTaxableIncome ? `≤ ${(item.maxTaxableIncome / 1000000).toFixed(0)}M` : `> ${(item.minTaxableIncome / 1000000).toFixed(0)}M`}
                    </p>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      IDR {Number(item.taxAmountInBracket).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reference Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progressive Brackets Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">Progressive Tax Brackets (UU HPP 2026/2027)</h3>
            </div>
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Tier</th>
                <th className="px-4 py-2.5">Min PKP</th>
                <th className="px-4 py-2.5">Max PKP</th>
                <th className="px-4 py-2.5 text-right">Tax Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brackets.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">Tier {b.bracketOrder}</td>
                  <td className="px-4 py-2.5">IDR {Number(b.minTaxableIncome).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-2.5">
                    {b.maxTaxableIncome ? `IDR ${Number(b.maxTaxableIncome).toLocaleString("id-ID")}` : "Above"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-blue-600">{b.taxRatePercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PTKP Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">Non-Taxable Relief Categories (PTKP)</h3>
            </div>
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5 text-right">Annual Relief (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ptkpList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{p.taxStatus}</td>
                  <td className="px-4 py-2.5 text-slate-500">{p.description}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                    IDR {Number(p.annualNonTaxableAmount).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
