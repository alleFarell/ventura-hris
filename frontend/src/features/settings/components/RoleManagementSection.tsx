"use client";

import { useEffect, useState } from "react";
import {
  CreateRolePayload,
  PermissionResponse,
  RoleResponse,
  UpdateRolePayload,
} from "../types";
import {
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
} from "../api";
import {
  Shield,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  X,
  Lock,
} from "lucide-react";

export function RoleManagementSection() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [roleCode, setRoleCode] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rList, pList] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(rList);
      setPermissions(pList);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isSystemRole = (code: string) => {
    return [
      "ROLE_SUPER_ADMIN",
      "ROLE_HR_ADMIN",
      "ROLE_MANAGER",
      "ROLE_EMPLOYEE",
    ].includes(code.toUpperCase());
  };

  const handleOpenAdd = () => {
    setRoleCode("");
    setRoleName("");
    setRoleDesc("");
    setSelectedPermissionIds([]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (role: RoleResponse) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description || "");
    setSelectedPermissionIds(role.permissions.map((p) => p.id));
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: CreateRolePayload = {
        code: roleCode.trim().toUpperCase(),
        name: roleName.trim(),
        description: roleDesc.trim() || undefined,
        permissionIds: selectedPermissionIds,
      };

      await createRole(payload);
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setSaving(true);
    setError(null);

    try {
      const payload: UpdateRolePayload = {
        name: roleName.trim(),
        description: roleDesc.trim() || undefined,
        permissionIds: selectedPermissionIds,
      };

      await updateRole(editingRole.id, payload);
      setEditingRole(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete role "${roleName}"?`)) return;
    setError(null);

    try {
      await deleteRole(roleId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to delete role");
    }
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce<Record<string, PermissionResponse[]>>(
    (acc, p) => {
      acc[p.category] = acc[p.category] || [];
      acc[p.category].push(p);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Roles & Permissions (RBAC)</h3>
          <p className="text-slate-500">
            Define custom organizational roles and attach granular functional permissions
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-blue-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Custom Role
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role list */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading roles...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const isSystem = isSystemRole(role.code);

            return (
              <div
                key={role.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{role.name}</h4>
                        {isSystem ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                            <Lock className="h-2.5 w-2.5" />
                            SYSTEM
                          </span>
                        ) : (
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-slate-500 mt-0.5">
                        {role.code}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        title="Edit Role"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {!isSystem && (
                        <button
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Role"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-slate-600 text-xs leading-relaxed">
                    {role.description || "No description provided."}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Granted Permissions ({role.permissions.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((p) => (
                        <span
                          key={p.id}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                        >
                          {p.code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-slate-400">
                  Last updated: {role.updatedAt ? role.updatedAt.split("T")[0] : "-"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Role Modal */}
      {(showAddModal || editingRole) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Role"}
                  </h3>
                  <p className="text-xs text-slate-500">Configure access rights and functional grants</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRole(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {!editingRole && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Role Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AUDIT_OFFICER"
                      value={roleCode}
                      onChange={(e) => setRoleCode(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono uppercase focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Prefix "ROLE_" will be added automatically.</span>
                  </div>
                )}
                <div className={editingRole ? "col-span-2" : ""}>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Internal Auditor"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Operational scope of this role"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Permissions Selector */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Permissions Matrix ({selectedPermissionIds.length} Selected)
                </label>
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 max-h-60 overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="space-y-1.5">
                      <h5 className="font-bold text-slate-600 text-[10px] uppercase tracking-wider">
                        {category}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = selectedPermissionIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2 rounded-md p-2 border cursor-pointer select-none transition ${
                                isChecked
                                  ? "border-blue-300 bg-blue-50/60"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.id)}
                                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                              />
                              <div>
                                <span className="block font-semibold text-slate-800 text-xs">
                                  {p.name}
                                </span>
                                <span className="block font-mono text-[10px] text-slate-400">
                                  {p.code}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRole(null);
                  }}
                  className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
