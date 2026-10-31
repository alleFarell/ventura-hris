# Employee Business Rules

## Employee Master Rules

- Employee number is required and unique per company.
- First name is required.
- Company and branch assignment are required for active employees.
- Department and position assignment are required before an employee can be marked active unless an approved onboarding exception exists.
- Inactive organization values cannot be used for new assignments.
- Employee records use soft delete by default.

## Employment Status Rules

- Supported initial statuses are `candidate`, `active`, `probation`, `suspended`, and `terminated`.
- Status changes must create `employment_status_histories` records.
- Terminated employees cannot be assigned to new payroll, attendance, or workflow records after termination date.
- Rehire behavior is deferred to a future requirement and must not be implemented by overwriting prior termination history.

## Sensitive Data Rules

- Identification numbers, tax identifiers, birth date, marital status, family records, documents, and personal contact details require sensitive permissions.
- Sensitive reads must be audited when required by security policy.
- Sensitive writes must capture actor, timestamp, changed fields, and reason when provided.
- API responses must not expose sensitive fields to callers without permission.

## Contract Rules

- Employment contracts require start date and contract type.
- Contract end date is required for fixed-term contracts.
- Contract date ranges for the same employee must not overlap unless explicitly allowed by future policy.

## Document Rules

- Document metadata must include employee owner, document type, access classification, retention category, status, and storage reference.
- Binary upload integration is deferred, but document metadata must be designed to support it.
- Expired documents must remain visible to authorized users for history unless retention policy permits deletion.

## Errors

| Code | Trigger |
| --- | --- |
| `EMPLOYEE_NUMBER_DUPLICATE` | Employee number already exists for the company. |
| `EMPLOYEE_INACTIVE_ASSIGNMENT` | Assignment references inactive setup or organization value. |
| `EMPLOYEE_SENSITIVE_PERMISSION_REQUIRED` | Caller lacks permission for sensitive data. |
| `EMPLOYEE_STATUS_TRANSITION_INVALID` | Requested status change is not allowed. |
| `EMPLOYEE_CONTRACT_DATE_OVERLAP` | Contract dates overlap existing active contract. |
| `EMPLOYEE_DOCUMENT_METADATA_INVALID` | Document metadata is incomplete or invalid. |

## Review Requirement

Rules must be reviewed with HR, security, and technical stakeholders and translated into tests before implementation.
