"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CompanyAsset, AssetCategory, CompanyAssetRequest } from "../types";
import { assetApi } from "../api";
import { CompanyResponse } from "@/features/setup/api";
import { Laptop, AlertCircle } from "lucide-react";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset?: CompanyAsset | null;
  companies: CompanyResponse[];
  categories: AssetCategory[];
  defaultCompanyId: string;
}

export function AssetModal({
  isOpen,
  onClose,
  onSuccess,
  asset,
  companies,
  categories,
  defaultCompanyId,
}: AssetModalProps) {
  const isEditing = Boolean(asset);

  const [companyId, setCompanyId] = useState(defaultCompanyId);
  const [categoryId, setCategoryId] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("0");
  const [conditionGrade, setConditionGrade] = useState("EXCELLENT");
  const [status, setStatus] = useState("AVAILABLE");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setCompanyId(asset.companyId || defaultCompanyId);
      setCategoryId(asset.categoryId || (categories[0]?.id ?? ""));
      setAssetTag(asset.assetTag);
      setName(asset.name);
      setModel(asset.model || "");
      setSerialNumber(asset.serialNumber || "");
      setPurchaseDate(asset.purchaseDate || "");
      setPurchaseCost(asset.purchaseCost !== undefined ? String(asset.purchaseCost) : "0");
      setConditionGrade(asset.conditionGrade || "EXCELLENT");
      setStatus(asset.status || "AVAILABLE");
      setNotes(asset.notes || "");
    } else {
      setCompanyId(defaultCompanyId);
      setCategoryId(categories[0]?.id ?? "");
      setAssetTag("");
      setName("");
      setModel("");
      setSerialNumber("");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setPurchaseCost("0");
      setConditionGrade("EXCELLENT");
      setStatus("AVAILABLE");
      setNotes("");
    }
    setError(null);
  }, [asset, isOpen, defaultCompanyId, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !categoryId || !assetTag || !name || !purchaseDate) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CompanyAssetRequest = {
      companyId,
      categoryId,
      assetTag: assetTag.trim().toUpperCase(),
      name: name.trim(),
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      purchaseDate,
      purchaseCost: purchaseCost ? Number(purchaseCost) : undefined,
      conditionGrade,
      status,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEditing && asset) {
        await assetApi.updateAsset(asset.id, payload);
      } else {
        await assetApi.createAsset(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to ${isEditing ? "update" : "register"} company asset.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Company Asset" : "Register Company Asset"}
      subtitle={
        isEditing
          ? `Modify asset configuration for ${asset?.assetTag}`
          : "Add inventory hardware, workstations, or equipment to company asset ledger"
      }
      icon={<Laptop className="h-5 w-5 text-indigo-600" />}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Company */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Entity <span className="text-rose-500">*</span>
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
              required
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asset Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  [{cat.code}] {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Asset Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asset Tag / Barcode <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
              placeholder="e.g. AST-MBP-001"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition"
            />
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asset / Device Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MacBook Pro 16 M3 Pro"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Model */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Model / Specification
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. 36GB RAM / 1TB SSD"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. C02G456XYZ"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Purchase Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purchase Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Purchase Cost */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purchase Cost (IDR)
            </label>
            <input
              type="number"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder="35000000"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Condition Grade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition Grade <span className="text-rose-500">*</span>
            </label>
            <select
              value={conditionGrade}
              onChange={(e) => setConditionGrade(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="EXCELLENT">EXCELLENT (Like New)</option>
              <option value="GOOD">GOOD (Minor wear)</option>
              <option value="FAIR">FAIR (Functional with wear)</option>
              <option value="POOR">POOR (Needs repair)</option>
              <option value="DAMAGED">DAMAGED (Non-functional)</option>
            </select>
          </div>
        </div>

        {/* Status (if editing) */}
        {isEditing && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lifecycle Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="AVAILABLE">AVAILABLE (In Stock)</option>
              <option value="ALLOCATED">ALLOCATED (Assigned to Employee)</option>
              <option value="MAINTENANCE">MAINTENANCE (Repair)</option>
              <option value="DECOMMISSIONED">DECOMMISSIONED (Retired)</option>
              <option value="LOST">LOST / STOLEN</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Vendor Details
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Warranty expiry, vendor invoice number, or peripherals included..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Register Asset"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
