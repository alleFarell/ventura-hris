# Setup Database

## Tables

### companies

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `code` | varchar(30) | Yes | Unique company code. |
| `name` | varchar(150) | Yes | Display name. |
| `legal_name` | varchar(200) | Yes | Registered legal name. |
| `tax_identifier` | varchar(80) | No | Sensitive depending on jurisdiction. |
| `default_locale` | varchar(20) | Yes | Example: `en-US`, `id-ID`. |
| `default_timezone` | varchar(80) | Yes | IANA timezone. |
| `default_currency` | char(3) | Yes | ISO 4217 code. |
| `status` | varchar(30) | Yes | `draft`, `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

Indexes and constraints:

- `uk_companies_code` on `code`.
- `idx_companies_status` on `status`.
- `idx_companies_deleted` on `deleted`.

### branches

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `code` | varchar(30) | Yes | Unique per company. |
| `name` | varchar(150) | Yes | Branch display name. |
| `address_line_1` | varchar(200) | No | Required before activation. |
| `address_line_2` | varchar(200) | No | Optional. |
| `city` | varchar(100) | No | Required before activation. |
| `province` | varchar(100) | No | Optional. |
| `postal_code` | varchar(30) | No | Optional. |
| `country_code` | char(2) | No | ISO 3166-1 alpha-2. |
| `status` | varchar(30) | Yes | `draft`, `active`, `inactive`. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

Indexes and constraints:

- `fk_branches_companies` on `company_id`.
- `uk_branches_company_code` on `company_id`, `code`.
- `idx_branches_company_status` on `company_id`, `status`.
- `idx_branches_deleted` on `deleted`.

### system_configurations

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | Yes | Primary key. |
| `company_id` | uuid | Yes | FK to `companies.id`. |
| `config_key` | varchar(100) | Yes | Stable configuration key. |
| `config_value` | text | Yes | Stored value. |
| `value_type` | varchar(30) | Yes | `string`, `number`, `boolean`, `json`. |
| `critical` | boolean | Yes | Critical changes require stronger audit. |
| `created_by` | uuid | Yes | Standard audit column. |
| `created_at` | timestamptz | Yes | Standard audit column. |
| `updated_by` | uuid | Yes | Standard audit column. |
| `updated_at` | timestamptz | Yes | Standard audit column. |
| `deleted` | boolean | Yes | Standard soft delete column. |
| `version` | bigint | Yes | Optimistic locking. |

Indexes and constraints:

- `fk_system_configurations_companies` on `company_id`.
- `uk_system_configurations_company_key` on `company_id`, `config_key`.

## Migration Notes

- Use UUID primary keys.
- Use `timestamptz` for audit timestamps.
- Seed only local development examples outside production migrations.
- Migration may begin after this database design is reviewed.
