# Sprint 4: Role-Based Access Control (RBAC), Audit Trails & Notification Engine

## 1. Sprint Overview

- **Sprint Number:** Sprint 4
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-10-26 to 2026-11-08 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-10-26
  - **End Date:** 2026-11-08
- **Target Phase:** Phase 1 – Foundation & Core HR (Final Sprint of Phase 1)
- **Primary Domains:** [features/Settings](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Settings), [features/Workflow](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Workflow), Security Infrastructure

---

## 2. Sprint Goals

1. **Granular Role-Based Access Control (RBAC):** Extend existing role/user baseline with a normalized permissions catalog, role-permission mappings, system role protection, and user role assignment capabilities.
2. **Centralized Immutable Audit Logging:** Implement an append-only audit logging mechanism capturing security and data manipulation events (`CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`, `ASSIGN_ROLE`) with queryable REST APIs.
3. **In-App Notification Center & Templates:** Deliver user-level in-app notification center (unread counts, mark-as-read, read-all) alongside configurable communication notification templates.
4. **Interactive Settings & Governance UI:** Build interactive Next.js views for Role & Permission management, User Role assignments, Audit Log investigation, and In-App notification drawer in `AppShell`.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V5__create_rbac_audit_notification_tables.sql`:
    - Table `permissions` and `role_permissions` join table with seeded system permissions.
    - Table `audit_logs` with indexes on actor, action, entity type, and timestamp.
    - Table `notifications` with user scoping, read status, and category tags.
    - Table `notification_templates` with channel and parameterized placeholders.
- **Backend Services & APIs:**
  - Permissions & Roles: `GET /api/v1/permissions`, `GET /api/v1/roles`, `POST /api/v1/roles`, `GET /api/v1/roles/{id}`, `PUT /api/v1/roles/{id}`, `DELETE /api/v1/roles/{id}`.
  - User Management: `GET /api/v1/users`, `POST /api/v1/users`, `PUT /api/v1/users/{id}/roles`, `PUT /api/v1/users/{id}/status`.
  - Centralized Audit Logging: `AuditLogService` and `GET /api/v1/audit-logs` (filtered & paginated).
  - Notification Engine: `NotificationService`, `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PUT /api/v1/notifications/{id}/read`, `PUT /api/v1/notifications/read-all`, `GET/PUT /api/v1/notification-templates`.
- **Frontend Applications & Views:**
  - In-App Notification Bell & Dropdown in `AppShell`.
  - Settings Management Dashboard (`/settings`):
    - Tab 1: Roles & Permission Matrix (`RoleManagementTable`, `RoleEditDialog`).
    - Tab 2: User Role Assignments (`UserManagementTable`, `UserRoleDialog`).
    - Tab 3: System Audit Trail (`AuditLogTable` with filter drawer).
    - Tab 4: Notification Templates (`NotificationTemplateTable`).
- **Testing & Quality:**
  - Integration tests for RBAC role-permission assignment, system role protection, audit log immutability, user status changes, and notification read lifecycles.
  - 100% backend test pass rate (`mvn test`).
  - Zero TypeScript/build errors on Next.js production build (`next build`).
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.4.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V5 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V5**
  - Create `permissions` table and `role_permissions` table.
  - Seed system permissions across Setup, Organization, Employee, and Settings.
  - Map default permissions to `ROLE_SUPER_ADMIN`, `ROLE_HR_ADMIN`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`.
  - Create `audit_logs` table (append-only, immutable).
  - Create `notifications` and `notification_templates` tables with initial seed templates.
- [x] **Checkpoint 1:** Flyway migration V5 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & Security DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `Permission`, `AuditLog`, `Notification`, and `NotificationTemplate` entities.
  - Update `Role` entity to map `Set<Permission> permissions`.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement `PermissionRepository`, `AuditLogRepository`, `NotificationRepository`, `NotificationTemplateRepository`.
  - Implement request records and response envelopes.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Controllers (Days 5–7)
- [x] **Task 3.1: RBAC & User Management Services**
  - Role management service with system role immutability protection (`ROLE_SUPER_ADMIN` cannot be deleted).
  - User creation & role assignment with audit logging.
- [x] **Task 3.2: Centralized Audit Logging Service**
  - Append-only audit logger capturing actor, action, entity, IP, and details.
- [x] **Task 3.3: Notification Engine & Templates**
  - Notification dispatch and read state transitions.
- [x] **Task 3.4: REST Controllers & Security Rules**
  - `RbacController`, `AuditLogController`, `NotificationController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Settings & Notification Center (Days 8–9)
- [x] **Task 4.1: Settings & Notification API Client & Types**
  - Types and Axios methods for RBAC, users, audit, notifications.
- [x] **Task 4.2: In-App Notification Bell & Popover in `AppShell`**
  - Unread count badge, real-time unread list, mark-as-read actions.
- [x] **Task 4.3: `/settings` Management Pages & Components**
  - Role table & permission matrix modal.
  - User directory & role assignment modal.
  - Audit trail log explorer.
  - Notification templates viewer & editor.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.4.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Execute full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 4 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **RBAC Permissions** | Permissions catalog is defined and mapped to roles; custom roles can be created and modified. | Integration tests |
| **AC-02** | **System Role Protection** | Built-in system roles (`ROLE_SUPER_ADMIN`) cannot be deleted or renamed. | Integration tests |
| **AC-03** | **User Role Assignment** | Users can be assigned multiple roles; changes are immediately reflected in their security profile. | Integration tests |
| **AC-04** | **Audit Trail** | System events generate immutable audit records; logs can be filtered by entity, actor, and date. | Integration tests |
| **AC-05** | **Notifications** | Users receive notifications, view unread counts, and mark notifications as read. | Integration tests & UI |
| **AC-06** | **Frontend Quality** | Settings portal and notification popover render responsively; 0 TypeScript or build errors. | `npm run build` |
