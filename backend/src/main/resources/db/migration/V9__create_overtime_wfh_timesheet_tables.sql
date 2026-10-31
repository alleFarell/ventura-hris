-- V9: Create Work-From-Home, Overtime requests, and Monthly Attendance Recaps

create table wfh_requests (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    request_date date not null,
    reason varchar(500) not null,
    status varchar(30) not null default 'PENDING',
    approver_id uuid references employees (id) on delete set null,
    manager_comment varchar(500),
    actioned_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_wfh_requests_emp_date on wfh_requests (employee_id, request_date);
create index idx_wfh_requests_status on wfh_requests (status);

create table overtime_requests (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    overtime_date date not null,
    start_time time not null,
    end_time time not null,
    raw_hours numeric(5,2) not null default 0.00,
    multiplier_hours numeric(5,2) not null default 0.00,
    reason varchar(500) not null,
    status varchar(30) not null default 'SUBMITTED',
    compensation_type varchar(30) not null default 'PAID',
    approver_id uuid references employees (id) on delete set null,
    manager_comment varchar(500),
    actioned_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_overtime_requests_emp_date on overtime_requests (employee_id, overtime_date);
create index idx_overtime_requests_status on overtime_requests (status);

create table monthly_attendance_recaps (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    period_year integer not null,
    period_month integer not null,
    total_working_days integer not null default 0,
    total_days_present integer not null default 0,
    total_days_absent integer not null default 0,
    total_late_minutes integer not null default 0,
    total_early_departure_minutes integer not null default 0,
    total_overtime_hours numeric(6,2) not null default 0.00,
    total_paid_leave_days integer not null default 0,
    total_unpaid_leave_days integer not null default 0,
    status varchar(30) not null default 'DRAFT',
    locked_at timestamptz,
    locked_by uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_monthly_recaps_emp_period on monthly_attendance_recaps (employee_id, period_year, period_month);
create index idx_monthly_recaps_period_status on monthly_attendance_recaps (period_year, period_month, status);
