-- V10: Create salary components, salary structures, employee salary profiles, and tax configurations

create table salary_components (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) not null,
    name varchar(100) not null,
    description varchar(255),
    type varchar(30) not null,
    is_taxable boolean not null default true,
    is_bpjs_applicable boolean not null default true,
    default_amount numeric(15,2) not null default 0.00,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_salary_components_code on salary_components (lower(code));
create index idx_salary_components_type on salary_components (type);

create table salary_structures (
    id uuid primary key default gen_random_uuid(),
    grade_id uuid not null references grades (id) on delete cascade,
    min_salary numeric(15,2) not null default 0.00,
    midpoint_salary numeric(15,2) not null default 0.00,
    max_salary numeric(15,2) not null default 0.00,
    currency varchar(10) not null default 'IDR',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_salary_structures_grade on salary_structures (grade_id);

create table employee_salary_profiles (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees (id) on delete cascade,
    basic_salary numeric(15,2) not null default 0.00,
    currency varchar(10) not null default 'IDR',
    effective_date date not null,
    payment_method varchar(30) not null default 'BANK_TRANSFER',
    bank_name varchar(100),
    bank_account_number varchar(50),
    bank_account_holder varchar(100),
    tax_status varchar(20) not null default 'TK/0',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_employee_salary_profiles_employee on employee_salary_profiles (employee_id);

create table employee_salary_components (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references employee_salary_profiles (id) on delete cascade,
    component_id uuid not null references salary_components (id) on delete cascade,
    amount numeric(15,2) not null default 0.00,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_emp_salary_comp_profile_comp on employee_salary_components (profile_id, component_id);

create table tax_configurations (
    id uuid primary key default gen_random_uuid(),
    tax_year integer not null,
    bracket_order integer not null,
    min_taxable_income numeric(15,2) not null,
    max_taxable_income numeric(15,2),
    tax_rate_percent numeric(5,2) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_tax_configurations_year_order on tax_configurations (tax_year, bracket_order);

create table ptkp_configurations (
    id uuid primary key default gen_random_uuid(),
    tax_status varchar(20) not null,
    annual_non_taxable_amount numeric(15,2) not null,
    description varchar(100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index uk_ptkp_configurations_status on ptkp_configurations (tax_status);

-- Seed Standard Salary Components
insert into salary_components (code, name, description, type, is_taxable, is_bpjs_applicable, default_amount, is_active) values
('BASIC_SALARY', 'Basic Salary', 'Base monthly wage', 'EARNING_FIXED', true, true, 0.00, true),
('TRANSPORT_ALLOWANCE', 'Transport Allowance', 'Fixed monthly transport allowance', 'EARNING_FIXED', true, false, 500000.00, true),
('MEAL_ALLOWANCE', 'Meal Allowance', 'Fixed monthly meal allowance', 'EARNING_FIXED', true, false, 500000.00, true),
('OVERTIME_PAY', 'Overtime Pay', 'Variable overtime compensation', 'EARNING_VARIABLE', true, true, 0.00, true),
('PPH21_TAX', 'PPh 21 Income Tax', 'Statutory employee income tax deduction', 'DEDUCTION_VARIABLE', false, false, 0.00, true),
('BPJS_TK_EMP', 'BPJS Ketenagakerjaan (Employee)', 'Statutory pension & retirement employee deduction (3%)', 'DEDUCTION_VARIABLE', false, false, 0.00, true),
('BPJS_KES_EMP', 'BPJS Kesehatan (Employee)', 'Statutory healthcare employee deduction (1%)', 'DEDUCTION_VARIABLE', false, false, 0.00, true),
('LATE_DEDUCTION', 'Late Penalty Deduction', 'Deduction for excessive monthly tardiness', 'DEDUCTION_VARIABLE', false, false, 0.00, true);

-- Seed Progressive Tax Brackets (Standard Indonesian PPh 21 UU HPP) for 2026/2027
insert into tax_configurations (tax_year, bracket_order, min_taxable_income, max_taxable_income, tax_rate_percent) values
(2026, 1, 0.00, 60000000.00, 5.00),
(2026, 2, 60000000.00, 250000000.00, 15.00),
(2026, 3, 250000000.00, 500000000.00, 25.00),
(2026, 4, 500000000.00, 5000000000.00, 30.00),
(2026, 5, 5000000000.00, null, 35.00),
(2027, 1, 0.00, 60000000.00, 5.00),
(2027, 2, 60000000.00, 250000000.00, 15.00),
(2027, 3, 250000000.00, 500000000.00, 25.00),
(2027, 4, 500000000.00, 5000000000.00, 30.00),
(2027, 5, 5000000000.00, null, 35.00);

-- Seed PTKP Configurations
insert into ptkp_configurations (tax_status, annual_non_taxable_amount, description) values
('TK/0', 54000000.00, 'Single, no dependents'),
('TK/1', 58500000.00, 'Single, 1 dependent'),
('TK/2', 63000000.00, 'Single, 2 dependents'),
('TK/3', 67500000.00, 'Single, 3 dependents'),
('K/0', 58500000.00, 'Married, no dependents'),
('K/1', 63000000.00, 'Married, 1 dependent'),
('K/2', 67500000.00, 'Married, 2 dependents'),
('K/3', 72000000.00, 'Married, 3 dependents');
