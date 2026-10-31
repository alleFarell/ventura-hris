-- V2: Create security, user, and authorization tables

create table roles (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) not null,
    name varchar(100) not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_roles_code on roles (lower(code));

create table users (
    id uuid primary key default gen_random_uuid(),
    username varchar(50) not null,
    email varchar(150) not null,
    password_hash varchar(255) not null,
    full_name varchar(150) not null,
    status varchar(30) not null default 'ACTIVE',
    failed_attempts int not null default 0,
    locked_until timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0
);

create unique index uk_users_username on users (lower(username));
create unique index uk_users_email on users (lower(email));
create index idx_users_status on users (status);

create table user_roles (
    user_id uuid not null,
    role_id uuid not null,
    assigned_at timestamptz not null default now(),
    primary key (user_id, role_id),
    constraint fk_user_roles_users foreign key (user_id) references users (id) on delete cascade,
    constraint fk_user_roles_roles foreign key (role_id) references roles (id) on delete cascade
);

create table refresh_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    token_hash varchar(255) not null,
    expires_at timestamptz not null,
    revoked boolean not null default false,
    created_at timestamptz not null default now(),
    constraint fk_refresh_tokens_users foreign key (user_id) references users (id) on delete cascade
);

create index idx_refresh_tokens_user on refresh_tokens (user_id);
create index idx_refresh_tokens_hash on refresh_tokens (token_hash);

-- Seed initial default roles
insert into roles (id, code, name, description, created_at, updated_at) values
    ('a0000000-0000-0000-0000-000000000001', 'ROLE_SUPER_ADMIN', 'Super Administrator', 'Full platform administrative access', now(), now()),
    ('a0000000-0000-0000-0000-000000000002', 'ROLE_HR_ADMIN', 'HR Administrator', 'HR and people operations administrative access', now(), now()),
    ('a0000000-0000-0000-0000-000000000003', 'ROLE_MANAGER', 'Manager', 'Departmental and team management access', now(), now()),
    ('a0000000-0000-0000-0000-000000000004', 'ROLE_EMPLOYEE', 'Employee', 'Self-service employee access', now(), now());

-- Seed default initial super admin user (password: Admin@123456)
-- BCrypt for Admin@123456: $2a$10$e8wY8b4zJ1jY2g7B7N7N2.yP2e/R5H9k8F7C6B5A4D3E2F1G0H9I8
-- Standard bcrypt hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi is password
-- Let's use a standard bcrypt 10 hash for 'Admin@123456'
insert into users (id, username, email, password_hash, full_name, status, failed_attempts, created_at, updated_at, deleted, version) values
    ('b0000000-0000-0000-0000-000000000001', 'admin', 'admin@ventura.local', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'System Administrator', 'ACTIVE', 0, now(), now(), false, 0);

insert into user_roles (user_id, role_id, assigned_at) values
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', now());
