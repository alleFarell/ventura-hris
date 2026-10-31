-- V11: Create payroll periods, attendance integration cutoffs, and payroll simulation tables

create table payroll_periods (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) not null,
    name varchar(100) not null,
    start_date date not null,
    end_date date not null,
    attendance_cutoff_date date not null,
    payout_date date not null,
    status varchar(30) not null default 'PLANNED', -- PLANNED, ACTIVE, PROCESSING, COMPLETED, CLOSED
    total_standard_workdays integer not null default 20,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_payroll_periods_code on payroll_periods (lower(code));
create index idx_payroll_periods_dates on payroll_periods (start_date, end_date);

create table payroll_attendance_cutoffs (
    id uuid primary key default gen_random_uuid(),
    period_id uuid not null references payroll_periods (id) on delete cascade,
    employee_id uuid not null references employees (id) on delete cascade,
    total_workdays integer not null default 20,
    present_days integer not null default 0,
    absent_days integer not null default 0,
    unpaid_leave_days integer not null default 0,
    late_minutes integer not null default 0,
    overtime_hours numeric(6,2) not null default 0.00,
    overtime_pay_amount numeric(15,2) not null default 0.00,
    unpaid_leave_deduction_amount numeric(15,2) not null default 0.00,
    late_fine_amount numeric(15,2) not null default 0.00,
    is_synced boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_pay_att_period_emp on payroll_attendance_cutoffs (period_id, employee_id);

create table payroll_simulations (
    id uuid primary key default gen_random_uuid(),
    period_id uuid not null references payroll_periods (id) on delete cascade,
    employee_id uuid not null references employees (id) on delete cascade,
    basic_salary numeric(15,2) not null default 0.00,
    proration_factor numeric(5,4) not null default 1.0000,
    prorated_basic_salary numeric(15,2) not null default 0.00,
    fixed_allowances numeric(15,2) not null default 0.00,
    overtime_earnings numeric(15,2) not null default 0.00,
    attendance_deductions numeric(15,2) not null default 0.00,
    fixed_deductions numeric(15,2) not null default 0.00,
    tax_deduction numeric(15,2) not null default 0.00,
    gross_salary numeric(15,2) not null default 0.00,
    net_salary numeric(15,2) not null default 0.00,
    has_discrepancies boolean not null default false,
    discrepancy_note varchar(255),
    status varchar(30) not null default 'SIMULATED', -- SIMULATED, VERIFIED, FINALIZED
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_pay_sim_period_emp on payroll_simulations (period_id, employee_id);
