"use client";

import { useEffect, useState } from "react";
import {
  CreateUserPayload,
  RoleResponse,
  UserSummaryResponse,
} from "../types";
import {
  createUser,
  getRoles,
  getUsers,
  updateUserRoles,
  updateUserStatus,
} from "../api";
import {
  Users,
  UserPlus,
  Shield,
  Loader2,
  AlertCircle,
  X,
  Lock,
  UserCheck,
  UserX,
  Mail,
  Calendar,
} from "lucide-react";

export function UserManagementSection() {
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserRoles, setEditingUserRoles] = useState<UserSummaryResponse | null>(null);
  const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uList, rList] = await Promise.all([getUsers(), getRoles()]);
      setUsers(uList);
      setRoles(rList);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setUsername("");
    setFullName("");
    setEmail("");
    setPassword("");
    setSelectedRoleCodes(["ROLE_EMPLOYEE"]);
    setShowAddModal(true);
  };

  const handleOpenRoleModal = (user: UserSummaryResponse) => {
    setEditingUserRoles(user);
    setSelectedRoleCodes(user.roles);
  };

  const toggleRole = (code: string) => {
    setSelectedRoleCodes((prev) =>
      prev.includes(code) ? prev.filter((r) => r !== code) : [...prev, code]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: CreateUserPayload = {
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        roleCodes: selectedRoleCodes,
      };

      await createUser(payload);
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUserRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserRoles) return;
    setSaving(true);
    setError(null);

    try {
      await updateUserRoles(editingUserRoles.id, { roleCodes: selectedRoleCodes });
      setEditingUserRoles(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to update roles");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: UserSummaryResponse) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!confirm(`Are you sure you want to change ${user.username}'s status to ${newStatus}?`)) return;

    setError(null);
    try {
      await updateUserStatus(user.id, { status: newStatus });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">User Accounts & Access</h3>
          <p className="text-slate-500">
            Manage system user logins, account lifecycle states, and security role assignments
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-blue-500 transition"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add User Account
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading users...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-600">
                <th className="py-2.5 px-4">USER</th>
                <th className="py-2.5 px-4">EMAIL</th>
                <th className="py-2.5 px-4">ASSIGNED ROLES</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4">CREATED</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isActive = user.status === "ACTIVE";

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-slate-900">{user.fullName}</div>
                        <div className="font-mono text-[11px] text-slate-500">@{user.username}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {r.replace("ROLE_", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {user.createdAt ? user.createdAt.split("T")[0] : "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                        >
                          Roles
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`rounded-md px-2.5 py-1 font-semibold transition ${
                            isActive
                              ? "text-rose-600 hover:bg-rose-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {isActive ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create User Account</h3>
                  <p className="text-xs text-slate-500">Provide credentials and role assignments</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. jdoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-[11px] mb-1.5">
                  Assigned Roles
                </label>
                <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50/50 p-2 max-h-36 overflow-y-auto">
                  {roles.map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 text-slate-700 cursor-pointer select-none p-1 hover:bg-slate-100 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoleCodes.includes(r.code)}
                        onChange={() => toggleRole(r.code)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span className="font-semibold text-xs">{r.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({r.code})</span>
                    </label>
                  ))}
                </div>
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
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Roles Modal */}
      {editingUserRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assign Roles: {editingUserRoles.username}
                  </h3>
                  <p className="text-xs text-slate-500">Configure role grants for this user</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUserRoles(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserRoles} className="mt-4 space-y-3">
              <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-3 max-h-56 overflow-y-auto">
                {roles.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-2 text-slate-700 cursor-pointer select-none p-1.5 hover:bg-slate-100 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleCodes.includes(r.code)}
                      onChange={() => toggleRole(r.code)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-xs text-slate-900 block">{r.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{r.code}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUserRoles(null)}
                  className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || selectedRoleCodes.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Roles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
