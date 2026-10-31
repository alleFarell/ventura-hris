# Organization Database

## Tables

### departments

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `code` | varchar(30) | Yes | Unique per company. |
| `name` | varchar(150) | Yes | Department name. |
| `description` | varchar(500) | No | Optional. |
| `status` | varchar(30) | Yes | `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

Constraints:

- `fk_departments_companies` on `company_id`.
- `uk_departments_company_code` on `company_id`, `code`.

### divisions

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `department_id` | uuid | Yes | FK to `departments.id`. |
| `code` | varchar(30) | Yes | Unique per department. |
| `name` | varchar(150) | Yes | Division name. |
| `status` | varchar(30) | Yes | `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

Constraints:

- `fk_divisions_companies` on `company_id`.
- `fk_divisions_departments` on `department_id`.
- `uk_divisions_department_code` on `department_id`, `code`.

### positions

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `department_id` | uuid | No | FK to `departments.id`. |
| `division_id` | uuid | No | FK to `divisions.id`. |
| `grade_id` | uuid | No | FK to `grades.id`. |
| `job_level_id` | uuid | No | FK to `job_levels.id`. |
| `code` | varchar(30) | Yes | Unique per company. |
| `name` | varchar(150) | Yes | Position name. |
| `status` | varchar(30) | Yes | `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

Constraints:

- `uk_positions_company_code` on `company_id`, `code`.
- Indexes for `department_id`, `division_id`, `grade_id`, and `job_level_id`.

### grades

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `code` | varchar(30) | Yes | Unique per company. |
| `name` | varchar(150) | Yes | Grade name. |
| `sort_order` | integer | Yes | Unique per company. |
| `status` | varchar(30) | Yes | `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

### job_levels

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `code` | varchar(30) | Yes | Unique per company. |
| `name` | varchar(150) | Yes | Job level name. |
| `sort_order` | integer | Yes | Unique per company. |
| `status` | varchar(30) | Yes | `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

### organization_units

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `parent_unit_id` | uuid | No | Self FK to `organization_units.id`. |
| `department_id` | uuid | No | Optional linked department. |
| `division_id` | uuid | No | Optional linked division. |
| `position_id` | uuid | No | Optional linked position. |
| `code` | varchar(30) | Yes | Unique per company. |
| `name` | varchar(150) | Yes | Display name. |
| `unit_type` | varchar(30) | Yes | `department`, `division`, `position`, `custom`. |
| `status` | varchar(30) | Yes | `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

### organization_structure_histories

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `organization_unit_id` | uuid | Yes | Changed unit. |
| `old_parent_unit_id` | uuid | No | Prior parent. |
| `new_parent_unit_id` | uuid | No | New parent. |
| `effective_date` | date | Yes | Structure effective date. |
| `reason` | varchar(500) | No | Optional change reason. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

## Migration Notes

- Create setup tables before organization tables.
- Index all foreign keys.
- Add search indexes for `code` and `name` after query behavior is reviewed.
- Migration may begin after this database design is reviewed.
