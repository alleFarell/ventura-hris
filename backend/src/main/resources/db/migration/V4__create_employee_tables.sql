-- V4: Create employee master data and profile management tables

create table employees (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    branch_id uuid not null,
    department_id uuid,
    division_id uuid,
    position_id uuid,
    grade_id uuid,
    job_level_id uuid,
    employee_number varchar(50) not null,
    first_name varchar(100) not null,
    last_name varchar(100),
    work_email varchar(150),
    employment_status varchar(30) not null default 'CANDIDATE',
    hire_date date,
    termination_date date,
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_employees_company foreign key (company_id) references companies (id),
    constraint fk_employees_branch foreign key (branch_id) references branches (id),
    constraint fk_employees_department foreign key (department_id) references departments (id),
    constraint fk_employees_division foreign key (division_id) references divisions (id),
    constraint fk_employees_position foreign key (position_id) references positions (id),
    constraint fk_employees_grade foreign key (grade_id) references grades (id),
    constraint fk_employees_job_level foreign key (job_level_id) references job_levels (id)
);

create unique index uk_employees_company_emp_num on employees (company_id, lower(employee_number));
create unique index uk_employees_company_email on employees (company_id, lower(work_email)) where work_email is not null;
create index idx_employees_company on employees (company_id);
create index idx_employees_branch on employees (branch_id);
create index idx_employees_department on employees (department_id);
create index idx_employees_position on employees (position_id);
create index idx_employees_status on employees (company_id, employment_status);
create index idx_employees_deleted on employees (deleted);

create table employee_personal_information (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null unique,
    birth_date date,
    birth_place varchar(100),
    gender varchar(30),
    marital_status varchar(30),
    nationality varchar(80),
    identity_number varchar(100),
    tax_number varchar(100),
    personal_email varchar(150),
    personal_phone varchar(50),
    address text,
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_emp_personal_info_employee foreign key (employee_id) references employees (id)
);

create table employee_emergency_contacts (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null,
    name varchar(150) not null,
    relationship varchar(80) not null,
    phone varchar(50) not null,
    email varchar(150),
    primary_contact boolean not null default false,
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_emp_contacts_employee foreign key (employee_id) references employees (id)
);

create index idx_emp_contacts_employee on employee_emergency_contacts (employee_id);

create table employment_contracts (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null,
    contract_type varchar(50) not null,
    start_date date not null,
    end_date date,
    status varchar(30) not null default 'ACTIVE',
    document_id uuid,
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_emp_contracts_employee foreign key (employee_id) references employees (id)
);

create index idx_emp_contracts_employee on employment_contracts (employee_id);
create index idx_emp_contracts_dates on employment_contracts (employee_id, start_date, end_date);

create table employment_status_histories (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null,
    old_status varchar(30),
    new_status varchar(30) not null,
    effective_date date not null,
    reason varchar(500),
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_emp_status_histories_employee foreign key (employee_id) references employees (id)
);

create index idx_emp_status_histories_employee on employment_status_histories (employee_id);
create index idx_emp_status_histories_date on employment_status_histories (effective_date);

create table employee_documents (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null,
    document_type varchar(80) not null,
    file_name varchar(255) not null,
    storage_reference varchar(500),
    access_classification varchar(50) not null default 'RESTRICTED',
    retention_category varchar(80) not null default 'GENERAL',
    expires_at date,
    status varchar(30) not null default 'ACTIVE',
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_emp_documents_employee foreign key (employee_id) references employees (id)
);

create index idx_emp_documents_employee on employee_documents (employee_id);
create index idx_emp_documents_type on employee_documents (document_type);
