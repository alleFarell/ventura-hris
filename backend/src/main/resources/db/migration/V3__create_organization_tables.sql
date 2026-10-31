-- V3: Create organization structure and job architecture tables

create table departments (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    code varchar(30) not null,
    name varchar(150) not null,
    description varchar(500),
    status varchar(30) not null default 'ACTIVE',
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_departments_companies foreign key (company_id) references companies (id)
);

create unique index uk_departments_company_code on departments (company_id, lower(code));
create index idx_departments_company_status on departments (company_id, status);
create index idx_departments_deleted on departments (deleted);

create table divisions (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    department_id uuid not null,
    code varchar(30) not null,
    name varchar(150) not null,
    status varchar(30) not null default 'ACTIVE',
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_divisions_companies foreign key (company_id) references companies (id),
    constraint fk_divisions_departments foreign key (department_id) references departments (id)
);

create unique index uk_divisions_dept_code on divisions (department_id, lower(code));
create index idx_divisions_dept_status on divisions (department_id, status);
create index idx_divisions_deleted on divisions (deleted);

create table grades (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    code varchar(30) not null,
    name varchar(150) not null,
    sort_order integer not null,
    status varchar(30) not null default 'ACTIVE',
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_grades_companies foreign key (company_id) references companies (id)
);

create unique index uk_grades_company_code on grades (company_id, lower(code));
create unique index uk_grades_company_sort on grades (company_id, sort_order);
create index idx_grades_company_status on grades (company_id, status);

create table job_levels (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    code varchar(30) not null,
    name varchar(150) not null,
    sort_order integer not null,
    status varchar(30) not null default 'ACTIVE',
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_job_levels_companies foreign key (company_id) references companies (id)
);

create unique index uk_job_levels_company_code on job_levels (company_id, lower(code));
create unique index uk_job_levels_company_sort on job_levels (company_id, sort_order);
create index idx_job_levels_company_status on job_levels (company_id, status);

create table positions (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    department_id uuid,
    division_id uuid,
    grade_id uuid,
    job_level_id uuid,
    code varchar(30) not null,
    name varchar(150) not null,
    status varchar(30) not null default 'ACTIVE',
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_positions_companies foreign key (company_id) references companies (id),
    constraint fk_positions_departments foreign key (department_id) references departments (id),
    constraint fk_positions_divisions foreign key (division_id) references divisions (id),
    constraint fk_positions_grades foreign key (grade_id) references grades (id),
    constraint fk_positions_job_levels foreign key (job_level_id) references job_levels (id)
);

create unique index uk_positions_company_code on positions (company_id, lower(code));
create index idx_positions_department on positions (department_id);
create index idx_positions_division on positions (division_id);
create index idx_positions_grade on positions (grade_id);
create index idx_positions_job_level on positions (job_level_id);
create index idx_positions_status on positions (company_id, status);

create table organization_units (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    parent_unit_id uuid,
    department_id uuid,
    division_id uuid,
    position_id uuid,
    code varchar(30) not null,
    name varchar(150) not null,
    unit_type varchar(30) not null,
    status varchar(30) not null default 'ACTIVE',
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_organization_units_companies foreign key (company_id) references companies (id),
    constraint fk_organization_units_parent foreign key (parent_unit_id) references organization_units (id),
    constraint fk_organization_units_departments foreign key (department_id) references departments (id),
    constraint fk_organization_units_divisions foreign key (division_id) references divisions (id),
    constraint fk_organization_units_positions foreign key (position_id) references positions (id)
);

create unique index uk_org_units_company_code on organization_units (company_id, lower(code));
create index idx_org_units_parent on organization_units (parent_unit_id);
create index idx_org_units_type on organization_units (unit_type);
create index idx_org_units_status on organization_units (company_id, status);

create table organization_structure_histories (
    id uuid primary key default gen_random_uuid(),
    organization_unit_id uuid not null,
    old_parent_unit_id uuid,
    new_parent_unit_id uuid,
    effective_date date not null,
    reason varchar(500),
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_by uuid,
    updated_at timestamptz not null default now(),
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_org_histories_unit foreign key (organization_unit_id) references organization_units (id),
    constraint fk_org_histories_old_parent foreign key (old_parent_unit_id) references organization_units (id),
    constraint fk_org_histories_new_parent foreign key (new_parent_unit_id) references organization_units (id)
);

create index idx_org_histories_unit on organization_structure_histories (organization_unit_id);
create index idx_org_histories_date on organization_structure_histories (effective_date);
