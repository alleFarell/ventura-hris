create extension if not exists pgcrypto;

create table companies (
    id uuid primary key default gen_random_uuid(),
    code varchar(30) not null,
    name varchar(150) not null,
    legal_name varchar(200) not null,
    tax_identifier varchar(80),
    default_locale varchar(20) not null,
    default_timezone varchar(80) not null,
    default_currency varchar(3) not null,
    default_date_format varchar(30) not null,
    status varchar(30) not null,
    created_by uuid not null,
    created_at timestamptz not null,
    updated_by uuid not null,
    updated_at timestamptz not null,
    deleted boolean not null default false,
    version bigint not null default 0
);

create unique index uk_companies_code_lower on companies (lower(code));
create index idx_companies_status on companies (status);
create index idx_companies_deleted on companies (deleted);

create table branches (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    code varchar(30) not null,
    name varchar(150) not null,
    address_line_1 varchar(200),
    address_line_2 varchar(200),
    city varchar(100),
    province varchar(100),
    postal_code varchar(30),
    country_code varchar(2),
    status varchar(30) not null,
    created_by uuid not null,
    created_at timestamptz not null,
    updated_by uuid not null,
    updated_at timestamptz not null,
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_branches_companies foreign key (company_id) references companies (id)
);

create unique index uk_branches_company_code_lower on branches (company_id, lower(code));
create index idx_branches_company_status on branches (company_id, status);
create index idx_branches_deleted on branches (deleted);

create table system_configurations (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null,
    config_key varchar(100) not null,
    config_value text not null,
    value_type varchar(30) not null,
    critical boolean not null default false,
    created_by uuid not null,
    created_at timestamptz not null,
    updated_by uuid not null,
    updated_at timestamptz not null,
    deleted boolean not null default false,
    version bigint not null default 0,
    constraint fk_system_configurations_companies foreign key (company_id) references companies (id)
);

create unique index uk_system_configurations_company_key_lower on system_configurations (company_id, lower(config_key));

