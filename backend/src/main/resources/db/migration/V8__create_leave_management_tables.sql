-- V8: Create leave management tables, entitlements, balances, requests, and approvals

create table leave_types (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) not null,
    name varchar(100) not null,
    description varchar(255),
    default_quota integer not null default 0,
    is_paid boolean not null default true,
    requires_attachment boolean not null default false,
    max_consecutive_days integer not null default 30,
    carry_forward_allowed boolean not null default false,
    max_carry_forward integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_leave_types_code on leave_types (lower(code));

create table leave_balances (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    leave_type_id uuid not null references leave_types (id) on delete cascade,
    balance_year integer not null,
    total_quota integer not null default 0,
    carried_over integer not null default 0,
    used integer not null default 0,
    pending integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_leave_balances_emp_type_year on leave_balances (employee_id, leave_type_id, balance_year);
create index idx_leave_balances_emp_year on leave_balances (employee_id, balance_year);

create table leave_requests (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    leave_type_id uuid not null references leave_types (id) on delete restrict,
    start_date date not null,
    end_date date not null,
    total_days integer not null,
    reason varchar(500) not null,
    attachment_url varchar(500),
    status varchar(30) not null default 'PENDING',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_leave_requests_employee on leave_requests (employee_id);
create index idx_leave_requests_status on leave_requests (status);
create index idx_leave_requests_dates on leave_requests (start_date, end_date);

create table leave_approvals (
    id uuid primary key default gen_random_uuid(),
    leave_request_id uuid not null references leave_requests (id) on delete cascade,
    approver_id uuid not null references employees (id) on delete cascade,
    step_order integer not null default 1,
    status varchar(30) not null default 'PENDING',
    comments varchar(500),
    actioned_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_leave_approvals_request on leave_approvals (leave_request_id);
create index idx_leave_approvals_approver_status on leave_approvals (approver_id, status);

-- Seed standard leave types
insert into leave_types (id, code, name, description, default_quota, is_paid, requires_attachment, max_consecutive_days, carry_forward_allowed, max_carry_forward, is_active)
values
    ('30000000-0000-0000-0000-000000000001', 'ANNUAL', 'Annual Leave', 'Standard statutory annual leave allowance', 12, true, false, 14, true, 6, true),
    ('30000000-0000-0000-0000-000000000002', 'SICK', 'Sick Leave', 'Medical absence leave with doctor certificate', 14, true, true, 30, false, 0, true),
    ('30000000-0000-0000-0000-000000000003', 'MATERNITY', 'Maternity Leave', 'Statutory 3-month maternity protection', 90, true, true, 90, false, 0, true),
    ('30000000-0000-0000-0000-000000000004', 'MARRIAGE', 'Marriage Leave', 'Personal marriage special leave', 3, true, false, 3, false, 0, true),
    ('30000000-0000-0000-0000-000000000005', 'BEREAVEMENT', 'Bereavement Leave', 'Immediate family bereavement special leave', 2, true, false, 2, false, 0, true),
    ('30000000-0000-0000-0000-000000000006', 'UNPAID', 'Unpaid Leave', 'Unpaid authorized leave of absence', 0, false, false, 30, false, 0, true);
