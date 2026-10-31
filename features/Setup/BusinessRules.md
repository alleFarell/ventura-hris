# Setup Business Rules

## Company Rules

- Company code is required, immutable after creation, and unique across active and deleted records unless a data retention review approves reuse.
- Company name and legal name are required.
- A company must define default locale, timezone, and currency before setup can be marked complete.
- A company cannot be deactivated while it has active branches or active employees.
- Company profile changes must be audited with previous value, new value, actor, timestamp, and reason when the field is critical.

## Branch Rules

- Branch code is required and unique per company.
- Branch name is required.
- A branch must belong to an active company.
- A branch cannot be deactivated while assigned to active employees unless reassignment is completed first.
- Branch address fields are optional during draft setup but required before branch activation.

## Locale And System Defaults

- Default timezone must be a valid IANA timezone.
- Default locale must use a valid locale code such as `en-US` or `id-ID`.
- Default currency must use an ISO 4217 currency code.
- Changes to timezone, locale, and currency are critical setup changes and require audit records.
- Effective date support is deferred unless a later feature needs historical localization behavior.

## Setup Readiness

Setup is considered ready for employee onboarding when:

- At least one active company exists.
- The active company has default locale, timezone, and currency.
- At least one active branch exists for the company.

## Errors

| Code | Trigger |
| --- | --- |
| `SETUP_COMPANY_CODE_DUPLICATE` | Company code already exists. |
| `SETUP_BRANCH_CODE_DUPLICATE` | Branch code already exists for the selected company. |
| `SETUP_COMPANY_INACTIVE` | Action requires an active company. |
| `SETUP_BRANCH_HAS_ACTIVE_EMPLOYEES` | Branch deactivation is blocked by active employee assignments. |
| `SETUP_INVALID_LOCALE` | Locale, timezone, or currency is invalid. |

## Review Requirement

Rules must be reviewed with business stakeholders and translated into tests before implementation.
