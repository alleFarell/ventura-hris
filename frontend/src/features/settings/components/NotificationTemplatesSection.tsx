"use client";

import { useEffect, useState } from "react";
import { TemplateResponse, UpdateTemplatePayload } from "../types";
import { getNotificationTemplates, updateNotificationTemplate } from "../api";
import {
  Bell,
  Mail,
  Edit2,
  Loader2,
  AlertCircle,
  X,
  FileCode,
} from "lucide-react";

export function NotificationTemplatesSection() {
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal
  const [editingTemplate, setEditingTemplate] = useState<TemplateResponse | null>(null);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("IN_APP");
  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotificationTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenEdit = (t: TemplateResponse) => {
    setEditingTemplate(t);
    setName(t.name);
    setChannel(t.channel);
    setSubjectTemplate(t.subjectTemplate);
    setBodyTemplate(t.bodyTemplate);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    setSaving(true);
    setError(null);

    try {
      const payload: UpdateTemplatePayload = {
        name: name.trim(),
        channel: channel.trim(),
        subjectTemplate: subjectTemplate.trim(),
        bodyTemplate: bodyTemplate.trim(),
      };

      await updateNotificationTemplate(editingTemplate.id, payload);
      setEditingTemplate(null);
      await loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Notification & Message Templates</h3>
        <p className="text-slate-500">
          Configure parameterized in-app and email templates for lifecycle event notifications
        </p>
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
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          No notification templates found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                      {t.channel === "EMAIL" ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                        {t.templateCode}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                    title="Edit Template"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3.5 space-y-2">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Subject Format:
                    </span>
                    <span className="font-semibold text-slate-800">{t.subjectTemplate}</span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                    {t.bodyTemplate}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                  {t.channel}
                </span>
                <span>Last modified: {t.updatedAt ? t.updatedAt.split("T")[0] : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <FileCode className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Edit Template: {editingTemplate.templateCode}
                  </h3>
                  <p className="text-xs text-slate-500">Configure message template & placeholders</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none font-semibold"
                >
                  <option value="IN_APP">IN_APP Notification</option>
                  <option value="EMAIL">EMAIL Message</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject Template *
                </label>
                <input
                  type="text"
                  required
                  value={subjectTemplate}
                  onChange={(e) => setSubjectTemplate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Body Template (Supports {"{{param}}"} syntax) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-[11px] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
