"use client";

import { useEffect, useState } from "react";
import {
  PersonalInformationPayload,
  PersonalInformationResponse,
} from "../types";
import { getPersonalInformation, updatePersonalInformation } from "../api";
import {
  ShieldCheck,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  UserCheck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

type PersonalInformationSectionProps = {
  employeeId: string;
};

export function PersonalInformationSection({
  employeeId,
}: PersonalInformationSectionProps) {
  const [data, setData] = useState<PersonalInformationResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<PersonalInformationPayload>({
    birthDate: "",
    birthPlace: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    identityNumber: "",
    taxNumber: "",
    personalEmail: "",
    personalPhone: "",
    address: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPersonalInformation(employeeId);
      setData(res);
      if (res) {
        setFormData({
          birthDate: res.birthDate || "",
          birthPlace: res.birthPlace || "",
          gender: res.gender || "",
          maritalStatus: res.maritalStatus || "",
          nationality: res.nationality || "",
          identityNumber: res.identityNumber || "",
          taxNumber: res.taxNumber || "",
          personalEmail: res.personalEmail || "",
          personalPhone: res.personalPhone || "",
          address: res.address || "",
        });
      }
    } catch (err: any) {
      // If 404 or empty, data is simply null
      console.log("Personal info not yet created or error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: PersonalInformationPayload = {
        birthDate: formData.birthDate || undefined,
        birthPlace: formData.birthPlace?.trim() || undefined,
        gender: formData.gender?.trim() || undefined,
        maritalStatus: formData.maritalStatus?.trim() || undefined,
        nationality: formData.nationality?.trim() || undefined,
        identityNumber: formData.identityNumber?.trim() || undefined,
        taxNumber: formData.taxNumber?.trim() || undefined,
        personalEmail: formData.personalEmail?.trim() || undefined,
        personalPhone: formData.personalPhone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
      };

      const res = await updatePersonalInformation(employeeId, payload);
      setData(res.data ?? null);
      setIsEditing(false);
      setSuccessMessage("Personal information updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to save personal information"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
        Loading personal information...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900">
        <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-900">Sensitive Personal Information Protection</h4>
          <p className="mt-0.5 text-blue-700/90 leading-relaxed">
            Personal identity records (NIK, NPWP, addresses) are managed under strict role-based access
            controls in compliance with data privacy regulations (UU PDP). Only authorized HR personnel
            may view or modify these records.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Personal & Legal Identity</h3>
            <p className="text-xs text-slate-500">
              Government identification, demographic records, and personal contacts
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              Edit Information
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
            {/* Government ID */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                Government Identification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    National Identity Number (NIK / KTP)
                  </label>
                  <input
                    type="text"
                    placeholder="16-digit NIK"
                    value={formData.identityNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, identityNumber: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tax ID (NPWP)
                  </label>
                  <input
                    type="text"
                    placeholder="15 or 16-digit NPWP"
                    value={formData.taxNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, taxNumber: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                Demographic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Birth Place</label>
                  <input
                    type="text"
                    placeholder="City / Region"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthPlace: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, maritalStatus: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select marital status</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. Indonesian"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Personal Contacts & Address */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                Personal Contact & Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Personal Email
                  </label>
                  <input
                    type="email"
                    placeholder="john.doe@personal.com"
                    value={formData.personalEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, personalEmail: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Personal Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+62 812-3456-7890"
                    value={formData.personalPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, personalPhone: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-medium text-slate-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={3}
                  placeholder="Full street address, city, postal code"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6 text-xs">
            {/* Government ID View */}
            <div>
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-3">
                Government Identification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100 flex items-start gap-3">
                  <UserCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium text-[11px]">
                      National ID (NIK / KTP)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {data?.identityNumber || "-"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100 flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium text-[11px]">
                      Tax ID (NPWP)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {data?.taxNumber || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographics View */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-3">
                Demographics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="block text-slate-400 font-medium text-[11px]">Birth Date</span>
                  <span className="font-semibold text-slate-800">
                    {data?.birthDate || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium text-[11px]">Birth Place</span>
                  <span className="font-semibold text-slate-800">
                    {data?.birthPlace || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium text-[11px]">Gender</span>
                  <span className="font-semibold text-slate-800">
                    {data?.gender || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium text-[11px]">
                    Marital Status
                  </span>
                  <span className="font-semibold text-slate-800">
                    {data?.maritalStatus || "-"}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <span className="block text-slate-400 font-medium text-[11px]">Nationality</span>
                <span className="font-semibold text-slate-800">
                  {data?.nationality || "-"}
                </span>
              </div>
            </div>

            {/* Personal Contacts & Address View */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-3">
                Personal Contact & Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium text-[11px]">
                      Personal Email
                    </span>
                    <span className="font-semibold">{data?.personalEmail || "-"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium text-[11px]">
                      Personal Phone
                    </span>
                    <span className="font-semibold">{data?.personalPhone || "-"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-slate-400 font-medium text-[11px]">
                    Residential Address
                  </span>
                  <span className="font-medium text-slate-800 leading-relaxed">
                    {data?.address || "No residential address provided."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
