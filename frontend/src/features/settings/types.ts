export type PermissionResponse = {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
};

export type RoleResponse = {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions: PermissionResponse[];
};

export type CreateRolePayload = {
  code: string;
  name: string;
  description?: string;
  permissionIds?: string[];
};

export type UpdateRolePayload = {
  name: string;
  description?: string;
  permissionIds?: string[];
};

export type UserSummaryResponse = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  status: string;
  createdAt: string;
  roles: string[];
};

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleCodes?: string[];
};

export type UpdateUserRolesPayload = {
  roleCodes: string[];
};

export type UpdateUserStatusPayload = {
  status: "ACTIVE" | "SUSPENDED";
};

export type AuditLogResponse = {
  id: string;
  userId?: string;
  actorUsername: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
};

export type NotificationResponse = {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
};

export type UnreadCountResponse = {
  unreadCount: number;
};

export type TemplateResponse = {
  id: string;
  templateCode: string;
  name: string;
  channel: string;
  subjectTemplate: string;
  bodyTemplate: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateTemplatePayload = {
  name: string;
  channel: string;
  subjectTemplate: string;
  bodyTemplate: string;
};
