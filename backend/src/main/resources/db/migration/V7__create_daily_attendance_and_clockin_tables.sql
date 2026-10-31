-- V7: Create daily attendance tracking, raw punch logs, and biometric devices

create table attendance_records (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    record_date date not null,
    shift_id uuid references shifts (id) on delete set null,
    clock_in_time timestamptz,
    clock_out_time timestamptz,
    late_minutes integer not null default 0,
    early_departure_minutes integer not null default 0,
    working_hours numeric(5,2) not null default 0.00,
    status varchar(30) not null default 'PRESENT',
    notes varchar(255),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_attendance_records_emp_date on attendance_records (employee_id, record_date);
create index idx_attendance_records_date on attendance_records (record_date);
create index idx_attendance_records_status on attendance_records (status);

create table attendance_punch_logs (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    punch_time timestamptz not null,
    punch_type varchar(20) not null,
    source varchar(30) not null default 'WEB',
    latitude numeric(10,7),
    longitude numeric(10,7),
    ip_address varchar(50),
    device_info varchar(255),
    is_geofence_compliant boolean not null default true,
    created_at timestamptz not null default now()
);

create index idx_punch_logs_emp_time on attendance_punch_logs (employee_id, punch_time);
create index idx_punch_logs_source on attendance_punch_logs (source);

create table biometric_devices (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) not null,
    name varchar(100) not null,
    branch_id uuid references branches (id) on delete set null,
    ip_address varchar(50),
    port integer not null default 4370,
    is_active boolean not null default true,
    last_sync_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_biometric_devices_code on biometric_devices (lower(code));
create index idx_biometric_devices_branch on biometric_devices (branch_id);

-- Seed initial biometric devices
insert into biometric_devices (id, code, name, ip_address, port, is_active)
values
    ('20000000-0000-0000-0000-000000000001', 'DEV_HQ_01', 'HQ Main Entrance Fingerprint/Face', '192.168.1.201', 4370, true),
    ('20000000-0000-0000-0000-000000000002', 'DEV_HQ_02', 'HQ Warehouse Biometric Terminal', '192.168.1.202', 4370, true);
