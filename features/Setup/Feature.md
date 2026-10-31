# Setup Feature

## Scope

Setup manages the minimum company configuration required before other HRIS modules can be used. It covers company profile, branch records, locale defaults, timezone defaults, numbering foundations, and bootstrap status.

## Primary Users

- System administrator
- Implementation consultant
- HR administrator

## Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| SET-FR-001 | Create and maintain one or more company records. | Must |
| SET-FR-002 | Create and maintain branch records under a company. | Must |
| SET-FR-003 | Configure default locale, timezone, date format, and currency for a company. | Must |
| SET-FR-004 | Track whether setup is complete enough to allow employee onboarding. | Must |
| SET-FR-005 | Support active and inactive status for companies and branches. | Must |
| SET-FR-006 | Support lookup APIs for branch and locale values. | Should |
| SET-FR-007 | Preserve audit history for critical setup changes. | Must |

## Non-Functional Requirements

- Setup screens must be available only to authorized admin roles.
- Company and branch changes must be audited.
- Setup APIs must return standardized response envelopes.
- List APIs must support pagination and search.
- Setup data must use soft delete unless legal or operational policy requires retention locking.

## Permissions

| Permission | Description |
| --- | --- |
| `setup.company.read` | View company profile and company list. |
| `setup.company.write` | Create or update company profile. |
| `setup.branch.read` | View branch list and branch details. |
| `setup.branch.write` | Create or update branches. |
| `setup.configuration.write` | Update locale, timezone, and system defaults. |

## Dependencies

- Database audit columns from `docs/DatabaseConvention.md`.
- API envelope from `docs/APIStandard.md`.
- Security baseline from `docs/Security.md`.

## Acceptance Criteria

- Company records can be created with unique code and required identity fields.
- Branch records can be created only for an existing active company.
- Branch codes are unique within a company.
- Locale and timezone defaults are validated before saving.
- Setup readiness can be queried by backend and frontend.
- All write actions record audit metadata.
- OpenAPI includes request, response, error, permission, and pagination behavior.

## Test Expectations

- Unit tests for setup validation rules.
- Repository tests for uniqueness and soft delete query behavior.
- Controller tests for response envelope and validation errors.
- API contract tests for company, branch, and readiness endpoints.

## Status

Sprint 01 implementation-ready draft. Requires product and architecture review before feature coding.
