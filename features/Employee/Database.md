# Employee Database

## Tables

### employees

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `branch_id` | uuid | Yes | FK to `branches.id`. |
| `department_id` | uuid | No | FK to `departments.id`. |
| `division_id` | uuid | No | FK to `divisions.id`. |
| `position_id` | uuid | No | FK to `positions.id`. |
| `grade_id` | uuid | No | FK to `grades.id`. |
| `job_level_id` | uuid | No | FK to `job_levels.id`. |
| `employee_number` | varchar(50) | Yes | Unique per company. |
| `first_name` | varchar(100) | Yes | Legal or preferred first name per policy. |
| `last_name` | varchar(100) | No | Optional. |
| `work_email` | varchar(150) | No | Unique per company when present. |
| `employment_status` | varchar(30) | Yes | Current status. |
| `hire_date` | date | No | Required before active status. |
| `termination_date` | date | No | Required for terminated status. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

Constraints:

- `uk_employees_company_employee_number` on `company_id`, `employee_number`.
- `uk_employees_company_work_email` on `company_id`, `work_email` where `work_email` is not null.
- Indexes for company, branch, department, position, and status filters.

### employee_personal_information

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `employee_id` | uuid | Yes | FK to `employees.id`. |
| `birth_date` | date | No | Sensitive. |
| `birth_place` | varchar(100) | No | Sensitive. |
| `gender` | varchar(30) | No | Sensitive in some jurisdictions. |
| `marital_status` | varchar(30) | No | Sensitive. |
| `nationality` | varchar(80) | No | Optional. |
| `identity_number` | varchar(100) | No | Sensitive. |
| `tax_number` | varchar(100) | No | Sensitive. |
| `personal_email` | varchar(150) | No | Sensitive. |
| `personal_phone` | varchar(50) | No | Sensitive. |
| `address` | text | No | Sensitive. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

### employee_emergency_contacts

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `employee_id` | uuid | Yes | FK to `employees.id`. |
| `name` | varchar(150) | Yes | Contact name. |
| `relationship` | varchar(80) | Yes | Relationship to employee. |
| `phone` | varchar(50) | Yes | Contact phone. |
| `email` | varchar(150) | No | Optional. |
| `primary_contact` | boolean | Yes | One primary contact preferred. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

### employment_contracts

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `employee_id` | uuid | Yes | FK to `employees.id`. |
| `contract_type` | varchar(50) | Yes | Permanent, fixed-term, internship, consultant. |
| `start_date` | date | Yes | Contract start. |
| `end_date` | date | No | Required for fixed-term contracts. |
| `status` | varchar(30) | Yes | `draft`, `active`, `expired`, `terminated`. |
| `document_id` | uuid | No | Optional FK to employee document metadata. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

### employment_status_histories

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `employee_id` | uuid | Yes | FK to `employees.id`. |
| `old_status` | varchar(30) | No | Null for first status. |
| `new_status` | varchar(30) | Yes | New status. |
| `effective_date` | date | Yes | Status effective date. |
| `reason` | varchar(500) | No | Optional reason. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

### employee_documents

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `employee_id` | uuid | Yes | FK to `employees.id`. |
| `document_type` | varchar(80) | Yes | Contract, identity, certificate, other. |
| `file_name` | varchar(255) | Yes | Original file name. |
| `storage_reference` | varchar(500) | No | Filled when binary storage is integrated. |
| `access_classification` | varchar(50) | Yes | `public_internal`, `restricted`, `sensitive`. |
| `retention_category` | varchar(80) | Yes | Retention policy category. |
| `expires_at` | date | No | For expiring documents. |
| `status` | varchar(30) | Yes | `draft`, `active`, `expired`, `archived`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

## Deferred Tables

- `employee_educations`
- `employee_experiences`
- `employee_families`

These are in scope for the feature but can be implemented after employee master, status, contract, and document metadata are stable.

## Migration Notes

- Setup and Organization migrations must run before Employee migrations.
- Sensitive fields may require encryption or application-level masking; this must be reviewed before implementation.
- Migration may begin after this database design is reviewed.
