-- V5: Create RBAC permissions, audit log, notifications, and notification templates

create table permissions (
    id uuid primary key default gen_random_uuid(),
    code varchar(100) not null,
    name varchar(150) not null,
    category varchar(50) not null,
    description text,
    created_at timestamptz not null default now()
);

create unique index uk_permissions_code on permissions (lower(code));
create index idx_permissions_category on permissions (category);

create table role_permissions (
    role_id uuid not null,
    permission_id uuid not null,
    granted_at timestamptz not null default now(),
    primary key (role_id, permission_id),
    constraint fk_role_permissions_role foreign key (role_id) references roles (id) on delete cascade,
    constraint fk_role_permissions_permission foreign key (permission_id) references permissions (id) on delete cascade
);

create table audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    actor_username varchar(100) not null,
    action varchar(50) not null,
    entity_type varchar(50) not null,
    entity_id varchar(100),
    details text,
    ip_address varchar(50),
    created_at timestamptz not null default now()
);

create index idx_audit_logs_actor on audit_logs (actor_username);
create index idx_audit_logs_entity on audit_logs (entity_type, entity_id);
create index idx_audit_logs_action on audit_logs (action);
create index idx_audit_logs_created_at on audit_logs (created_at desc);

create table notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    title varchar(200) not null,
    message text not null,
    category varchar(50) not null default 'SYSTEM',
    is_read boolean not null default false,
    read_at timestamptz,
    created_at timestamptz not null default now(),
    constraint fk_notifications_user foreign key (user_id) references users (id) on delete cascade
);

create index idx_notifications_user_unread on notifications (user_id, is_read);
create index idx_notifications_created_at on notifications (created_at desc);

create table notification_templates (
    id uuid primary key default gen_random_uuid(),
    template_code varchar(50) not null,
    name varchar(150) not null,
    channel varchar(20) not null default 'IN_APP',
    subject_template varchar(255) not null,
    body_template text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_notification_templates_code on notification_templates (lower(template_code));

-- Seed permissions
insert into permissions (id, code, name, category, description, created_at) values
    ('c0000000-0000-0000-0000-000000000001', 'SETUP_READ', 'View Company Setup', 'SETUP', 'View tenant companies, branches, and system parameters', now()),
    ('c0000000-0000-0000-0000-000000000002', 'SETUP_WRITE', 'Manage Company Setup', 'SETUP', 'Create, update, and configure companies and branches', now()),
    ('c0000000-0000-0000-0000-000000000003', 'ORG_READ', 'View Organization Structures', 'ORGANIZATION', 'View departments, divisions, positions, and org chart', now()),
    ('c0000000-0000-0000-0000-000000000004', 'ORG_WRITE', 'Manage Organization Structures', 'ORGANIZATION', 'Create and modify departments, positions, grades, and hierarchy', now()),
    ('c0000000-0000-0000-0000-000000000005', 'EMPLOYEE_READ', 'View Employee Directory', 'EMPLOYEE', 'Search and view employee master records', now()),
    ('c0000000-0000-0000-0000-000000000006', 'EMPLOYEE_WRITE', 'Manage Employee Records', 'EMPLOYEE', 'Create employees, change assignments, manage contracts and status', now()),
    ('c0000000-0000-0000-0000-000000000007', 'EMPLOYEE_SENSITIVE_READ', 'View Sensitive Employee Data', 'EMPLOYEE', 'View national identity numbers (NIK), tax numbers, and personal addresses', now()),
    ('c0000000-0000-0000-0000-000000000008', 'SECURITY_READ', 'View Roles & Users', 'SECURITY', 'View RBAC roles, permissions, and user accounts', now()),
    ('c0000000-0000-0000-0000-000000000009', 'SECURITY_WRITE', 'Manage Roles & Users', 'SECURITY', 'Create custom roles, assign permissions, and manage user roles', now()),
    ('c0000000-0000-0000-0000-000000000010', 'AUDIT_READ', 'View System Audit Trail', 'AUDIT', 'Inspect immutable audit logs across platform entities', now()),
    ('c0000000-0000-0000-0000-000000000011', 'NOTIFICATION_MANAGE', 'Manage Notification Templates', 'NOTIFICATION', 'Configure templates and notification dispatches', now());

-- Map permissions to default roles:
-- 1. ROLE_SUPER_ADMIN gets all permissions
insert into role_permissions (role_id, permission_id, granted_at) values
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', now()),
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000011', now());

-- 2. ROLE_HR_ADMIN permissions
insert into role_permissions (role_id, permission_id, granted_at) values
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', now()),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', now()),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', now()),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', now()),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006', now()),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', now()),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', now());

-- 3. ROLE_MANAGER permissions
insert into role_permissions (role_id, permission_id, granted_at) values
    ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', now()),
    ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', now());

-- 4. ROLE_EMPLOYEE permissions
insert into role_permissions (role_id, permission_id, granted_at) values
    ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', now());

-- Seed default notification templates
insert into notification_templates (id, template_code, name, channel, subject_template, body_template, created_at, updated_at) values
    ('d0000000-0000-0000-0000-000000000001', 'WELCOME_USER', 'Welcome New User', 'IN_APP', 'Welcome to Ventura HRIS', 'Hello {{name}}, your account has been set up with username {{username}}.', now(), now()),
    ('d0000000-0000-0000-0000-000000000002', 'STATUS_CHANGE', 'Employment Status Updated', 'IN_APP', 'Status Change Notification', 'Your employment status has changed to {{newStatus}} effective from {{effectiveDate}}.', now(), now()),
    ('d0000000-0000-0000-0000-000000000003', 'ROLE_ASSIGNED', 'Security Role Assigned', 'IN_APP', 'Role Assignment Updated', 'You have been granted new role access: {{roleName}}.', now(), now());
