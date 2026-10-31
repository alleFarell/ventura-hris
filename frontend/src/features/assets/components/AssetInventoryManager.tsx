"use client";

import { useEffect, useState } from "react";
import { assetApi } from "../api";
import { CompanyAsset, AssetCategory } from "../types";
import {
  Laptop,
  Plus,
  RefreshCw,
  FolderPlus,
  Pencil,
  Trash2,
  Building2,
  AlertCircle,
} from "lucide-react";
import { getCompanies, CompanyResponse } from "@/features/setup/api";
import { AssetModal } from "./AssetModal";
import { CategoryModal } from "./CategoryModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

export function AssetInventoryManager() {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Asset Modal states
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CompanyAsset | null>(null);

  // Category Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Delete Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<CompanyAsset | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadCompaniesList = async () => {
    try {
      const compList = await getCompanies();
      setCompanies(compList);
      if (compList.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(compList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load companies");
    }
  };

  const loadAssetsAndCategories = async (companyId: string, status: string) => {
    if (!companyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [assetList, catList] = await Promise.all([
        assetApi.getAssets(companyId, undefined, status === "ALL" ? undefined : status),
        assetApi.getCategories(companyId),
      ]);
      setAssets(assetList);
      setCategories(catList);
    } catch (err: any) {
      setError(err?.message || "Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = () => {
    if (selectedCompanyId) {
      loadAssetsAndCategories(selectedCompanyId, filterStatus);
    }
  };

  useEffect(() => {
    loadCompaniesList();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadAssetsAndCategories(selectedCompanyId, filterStatus);
    }
  }, [selectedCompanyId, filterStatus]);

  const handleOpenCreateAsset = () => {
    setSelectedAsset(null);
    setAssetModalOpen(true);
  };

  const handleOpenEditAsset = (asset: CompanyAsset) => {
    setSelectedAsset(asset);
    setAssetModalOpen(true);
  };

  const handleOpenDeleteAsset = (asset: CompanyAsset) => {
    setAssetToDelete(asset);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await assetApi.deleteAsset(assetToDelete.id);
      setDeleteModalOpen(false);
      setAssetToDelete(null);
      loadData();
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to delete company asset."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
              Physical Assets
            </span>
            <span className="text-xs text-slate-400">Inventory & Custody</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Company Asset Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardware ledger, equipment assignments, condition tracking, and lifecycle decommission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Company Selector */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            <Building2 className="h-4 w-4 text-slate-500 shrink-0" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition"
            title="Refresh Assets"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <FolderPlus className="h-3.5 w-3.5 text-indigo-600" />
            Category
          </button>

          <button
            onClick={handleOpenCreateAsset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Register Asset
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["ALL", "AVAILABLE", "ALLOCATED", "MAINTENANCE", "DECOMMISSIONED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterStatus === st
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Asset Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-200 shadow-2xs">
          <Laptop className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-700 font-bold text-sm">No assets found</p>
          <p className="text-slate-400 text-xs mt-0.5">Add devices and company assets to maintain your ledger.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Asset Tag & Device</th>
                  <th className="px-5 py-3">Category & Model</th>
                  <th className="px-5 py-3">Serial Number</th>
                  <th className="px-5 py-3">Purchase Info</th>
                  <th className="px-5 py-3">Status & Custodian</th>
                  <th className="px-5 py-3">Condition</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-indigo-600 font-bold text-xs">{a.assetTag}</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">{a.name}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {a.categoryName || "General"}
                      </span>
                      <div className="text-slate-500 text-[11px] mt-0.5">{a.model || "-"}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {a.serialNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>Date: <span className="font-medium text-slate-900">{a.purchaseDate}</span></div>
                      <div>Cost: <span className="font-medium text-slate-900">IDR {a.purchaseCost?.toLocaleString()}</span></div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700"
                            : a.status === "ALLOCATED"
                            ? "bg-blue-50 text-blue-700"
                            : a.status === "MAINTENANCE"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {a.status}
                      </span>
                      {a.assignedToEmployeeName && (
                        <div className="text-[11px] text-slate-700 font-medium mt-1">
                          👤 {a.assignedToEmployeeName} ({a.assignedToEmployeeNumber})
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800 text-[11px] uppercase">{a.conditionGrade}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditAsset(a)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          title="Edit Asset"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteAsset(a)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete Asset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Standard Asset Modal (Create / Edit) */}
      <AssetModal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onSuccess={loadData}
        asset={selectedAsset}
        companies={companies}
        categories={categories}
        defaultCompanyId={selectedCompanyId}
      />

      {/* Standard Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
        companyId={selectedCompanyId}
      />

      {/* Standard Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Company Asset"
        itemName={assetToDelete ? `${assetToDelete.name} (${assetToDelete.assetTag})` : undefined}
        error={deleteError}
        loading={deleting}
      />
    </div>
  );
}
