# Setup Frontend

## Navigation

Setup appears under the administrator navigation group: `Admin > Setup`.

## Screens

| Screen | Purpose | Route |
| --- | --- | --- |
| Setup Overview | Show readiness status and missing setup items. | `/setup` |
| Company Profile | View and edit company identity and defaults. | `/setup/company` |
| Branches | Search, list, create, and update branches. | `/setup/branches` |
| System Defaults | Manage locale, timezone, currency, and configuration values. | `/setup/defaults` |

## States

Each screen must support loading, empty, validation error, permission denied, save success, and optimistic locking conflict states.

## Validation

- Company code is required and read-only after creation.
- Company name and legal name are required.
- Locale, timezone, and currency must be selected from controlled inputs.
- Branch code and name are required.
- Branch activation requires minimum address fields.

## Components

| Component | Responsibility |
| --- | --- |
| `SetupReadinessPanel` | Shows whether onboarding can begin. |
| `CompanyProfileForm` | Edits company identity and defaults. |
| `BranchTable` | Lists branches with search and status filters. |
| `BranchForm` | Creates and updates branch records. |
| `SystemDefaultsForm` | Edits critical default configuration. |

## UX Acceptance Criteria

- Admin can identify missing setup items from the overview.
- Admin can create a company and branch without leaving setup flow.
- Validation messages are field-specific.
- Permission-restricted actions are hidden in the UI and enforced by API.
- Critical changes display confirmation before submit.
