-- V6: Create shift scheduling, pattern, roster assignments, and holiday calendar tables

create table shifts (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies (id) on delete cascade,
    code varchar(50) not null,
    name varchar(100) not null,
    description varchar(255),
    start_time time not null,
    end_time time not null,
    break_minutes integer not null default 60,
    grace_period_minutes integer not null default 15,
    is_overnight boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_shifts_code on shifts (lower(code));
create index idx_shifts_company on shifts (company_id);

create table shift_patterns (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) not null,
    name varchar(100) not null,
    description varchar(255),
    pattern_sequence varchar(500) not null,
    cycle_days integer not null default 7,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_shift_patterns_code on shift_patterns (lower(code));

create table roster_assignments (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    shift_id uuid references shifts (id) on delete set null,
    shift_date date not null,
    is_day_off boolean not null default false,
    override_reason varchar(255),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_roster_emp_date on roster_assignments (employee_id, shift_date);
create index idx_roster_shift on roster_assignments (shift_id);
create index idx_roster_date on roster_assignments (shift_date);

create table company_holidays (
    id uuid primary key default gen_random_uuid(),
    holiday_date date not null,
    name varchar(150) not null,
    description varchar(255),
    company_id uuid references companies (id) on delete cascade,
    branch_id uuid references branches (id) on delete cascade,
    is_mandatory boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_holidays_date on company_holidays (holiday_date);
create index idx_holidays_company_branch on company_holidays (company_id, branch_id);

-- Seed initial standard shifts
insert into shifts (id, code, name, description, start_time, end_time, break_minutes, grace_period_minutes, is_overnight, is_active)
values
    ('10000000-0000-0000-0000-000000000001', 'SH_REG_0817', 'Standard Office', 'Regular 8 to 5 office hours', '08:00:00', '17:00:00', 60, 15, false, true),
    ('10000000-0000-0000-0000-000000000002', 'SH_MORN_0715', 'Morning Shift', 'Early operational morning shift', '07:00:00', '15:00:00', 60, 10, false, true),
    ('10000000-0000-0000-0000-000000000003', 'SH_AFT_1523', 'Afternoon Shift', 'Evening operational shift', '15:00:00', '23:00:00', 60, 10, false, true),
    ('10000000-0000-0000-0000-000000000004', 'SH_NGT_2307', 'Night Shift', 'Overnight graveyard shift', '23:00:00', '07:00:00', 60, 10, true, true);

-- Seed initial shift pattern
insert into shift_patterns (id, code, name, description, pattern_sequence, cycle_days, is_active)
values
    ('10000000-0000-0000-0000-000000000010', 'PAT_5_2_OFFICE', 'Standard 5-2 Workweek', '5 days work and 2 days weekend off', 'SH_REG_0817,SH_REG_0817,SH_REG_0817,SH_REG_0817,SH_REG_0817,OFF,OFF', 7, true);

-- Seed company holidays
insert into company_holidays (id, holiday_date, name, description, is_mandatory)
values
    ('10000000-0000-0000-0000-000000000020', '2026-01-01', 'New Year''s Day', 'International New Year celebration', true),
    ('10000000-0000-0000-0000-000000000021', '2026-08-17', 'Independence Day', 'National Independence Day', true),
    ('10000000-0000-0000-0000-000000000022', '2026-12-25', 'Christmas Day', 'Christmas holiday', true);
