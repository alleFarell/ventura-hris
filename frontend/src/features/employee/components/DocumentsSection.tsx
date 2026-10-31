"use client";

import { useEffect, useState } from "react";
import { DocumentPayload, DocumentResponse } from "../types";
import { createDocument, getDocuments } from "../api";
import {
  FileText,
  FileCode,
  Shield,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Calendar,
  Lock,
} from "lucide-react";

type DocumentsSectionProps = {
  employeeId: string;
};

export function DocumentsSection({ employeeId }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [documentType, setDocumentType] = useState("ID_CARD");
  const [fileName, setFileName] = useState("");
  const [storageReference, setStorageReference] = useState("");
  const [accessClassification, setAccessClassification] = useState("RESTRICTED");
  const [retentionCategory, setRetentionCategory] = useState("PERMANENT");
  const [expiresAt, setExpiresAt] = useState("");

  const loadDocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocuments(employeeId);
      setDocuments(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to load document records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [employeeId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: DocumentPayload = {
        documentType: documentType.trim(),
        fileName: fileName.trim(),
        storageReference: storageReference.trim() || undefined,
        accessClassification,
        retentionCategory,
        expiresAt: expiresAt || undefined,
        status: "ACTIVE",
      };

      await createDocument(employeeId, payload);
      setFileName("");
      setStorageReference("");
      setExpiresAt("");
      setShowAddModal(false);
      await loadDocs();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to register document record"
      );
    } finally {
      setSaving(false);
    }
  };

  const getClassificationBadge = (classification?: string) => {
    switch (classification) {
      case "CONFIDENTIAL":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "RESTRICTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "INTERNAL":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PUBLIC":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Document Registry</h3>
          <p className="text-xs text-slate-500">
            Compliance document metadata, access classifications, and retention policies
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Document Record
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Register Employee Document
                  </h3>
                  <p className="text-xs text-slate-500">
                    Attach metadata and governance rules to employee record
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Document Type *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ID_CARD">National ID (KTP / Passport)</option>
                    <option value="CONTRACT">Employment Contract</option>
                    <option value="TAX_RECORD">Tax Card (NPWP)</option>
                    <option value="DIPLOMA_DEGREE">Degree / Diploma</option>
                    <option value="CERTIFICATE">Professional Certificate</option>
                    <option value="RESUME">Resume / CV</option>
                    <option value="OTHER">Other Official Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    File Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ktp_john_doe.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Storage Reference / Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. s3://ventura-docs/employees/emp-001/ktp.pdf"
                  value={storageReference}
                  onChange={(e) => setStorageReference(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Access Classification *
                  </label>
                  <select
                    value={accessClassification}
                    onChange={(e) => setAccessClassification(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="PUBLIC">PUBLIC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Retention Category *
                  </label>
                  <select
                    value={retentionCategory}
                    onChange={(e) => setRetentionCategory(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PERMANENT">Permanent Record</option>
                    <option value="TENURE_PLUS_5YR">Tenure + 5 Years</option>
                    <option value="FINANCIAL_7YR">Tax/Financial (7 Years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expiration Date (if applicable)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading document records...
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FileText className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No document records registered</p>
          <p className="text-xs text-slate-400 mt-1">
            Register compliance IDs, contracts, or credentials for this employee.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-600">
                <th className="py-2.5 px-4">DOCUMENT / FILE</th>
                <th className="py-2.5 px-4">TYPE</th>
                <th className="py-2.5 px-4">CLASSIFICATION</th>
                <th className="py-2.5 px-4">RETENTION</th>
                <th className="py-2.5 px-4">EXPIRES</th>
                <th className="py-2.5 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{doc.fileName}</div>
                        {doc.storageReference && (
                          <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                            {doc.storageReference}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {doc.documentType}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getClassificationBadge(
                        doc.accessClassification
                      )}`}
                    >
                      {doc.accessClassification}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {doc.retentionCategory}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {doc.expiresAt ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {doc.expiresAt}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No Expiry</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      {doc.status || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
