import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  AuditLogResponse,
  CreateRolePayload,
  CreateUserPayload,
  NotificationResponse,
  PermissionResponse,
  RoleResponse,
  TemplateResponse,
  UnreadCountResponse,
  UpdateRolePayload,
  UpdateTemplatePayload,
  UpdateUserRolesPayload,
  UpdateUserStatusPayload,
  UserSummaryResponse,
} from "./types";

// ==================== PERMISSIONS & ROLES ====================

export async function getPermissions(): Promise<PermissionResponse[]> {
  const response = await apiClient.get<ApiResponse<PermissionResponse[]>>("/permissions");
  return response.data.data ?? [];
}

export async function getRoles(): Promise<RoleResponse[]> {
  const response = await apiClient.get<ApiResponse<RoleResponse[]>>("/roles");
  return response.data.data ?? [];
}

export async function getRole(id: string): Promise<RoleResponse> {
  const response = await apiClient.get<ApiResponse<RoleResponse>>(`/roles/${id}`);
  return response.data.data!;
}

export async function createRole(payload: CreateRolePayload): Promise<ApiResponse<RoleResponse>> {
  const response = await apiClient.post<ApiResponse<RoleResponse>>("/roles", payload);
  return response.data;
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<ApiResponse<RoleResponse>> {
  const response = await apiClient.put<ApiResponse<RoleResponse>>(`/roles/${id}`, payload);
  return response.data;
}

export async function deleteRole(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/roles/${id}`);
  return response.data;
}

// ==================== USERS ====================

export async function getUsers(): Promise<UserSummaryResponse[]> {
  const response = await apiClient.get<ApiResponse<UserSummaryResponse[]>>("/users");
  return response.data.data ?? [];
}

export async function createUser(payload: CreateUserPayload): Promise<ApiResponse<UserSummaryResponse>> {
  const response = await apiClient.post<ApiResponse<UserSummaryResponse>>("/users", payload);
  return response.data;
}

export async function updateUserRoles(id: string, payload: UpdateUserRolesPayload): Promise<ApiResponse<UserSummaryResponse>> {
  const response = await apiClient.put<ApiResponse<UserSummaryResponse>>(`/users/${id}/roles`, payload);
  return response.data;
}

export async function updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<ApiResponse<UserSummaryResponse>> {
  const response = await apiClient.put<ApiResponse<UserSummaryResponse>>(`/users/${id}/status`, payload);
  return response.data;
}

// ==================== AUDIT LOGS ====================

export async function getAuditLogs(params?: {
  entityType?: string;
  action?: string;
  actorUsername?: string;
  page?: number;
  size?: number;
}): Promise<{ logs: AuditLogResponse[]; totalElements?: number }> {
  const response = await apiClient.get<ApiResponse<AuditLogResponse[]>>("/audit-logs", {
    params: { size: 50, ...params },
  });
  return {
    logs: response.data.data ?? [],
    totalElements: response.data.meta?.totalElements as number | undefined,
  };
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(page = 0, size = 20): Promise<NotificationResponse[]> {
  const response = await apiClient.get<ApiResponse<NotificationResponse[]>>("/notifications", {
    params: { page, size },
  });
  return response.data.data ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<ApiResponse<UnreadCountResponse>>("/notifications/unread-count");
  return response.data.data?.unreadCount ?? 0;
}

export async function markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
  const response = await apiClient.put<ApiResponse<void>>("/notifications/read-all");
  return response.data;
}

// ==================== NOTIFICATION TEMPLATES ====================

export async function getNotificationTemplates(): Promise<TemplateResponse[]> {
  const response = await apiClient.get<ApiResponse<TemplateResponse[]>>("/notification-templates");
  return response.data.data ?? [];
}

export async function updateNotificationTemplate(
  id: string,
  payload: UpdateTemplatePayload
): Promise<ApiResponse<TemplateResponse>> {
  const response = await apiClient.put<ApiResponse<TemplateResponse>>(`/notification-templates/${id}`, payload);
  return response.data;
}
