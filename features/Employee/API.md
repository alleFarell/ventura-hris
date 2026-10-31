# Employee API

## Base Path

```text
/api/v1
```

## Endpoints

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/employees` | `employee.read` | List employees with pagination, search, and filters. |
| POST | `/employees` | `employee.write` | Create employee. |
| GET | `/employees/{id}` | `employee.read` | Get employee profile summary. |
| PUT | `/employees/{id}` | `employee.write` | Update employee master fields. |
| GET | `/employees/{id}/personal-information` | `employee.sensitive.read` | Get sensitive personal information. |
| PUT | `/employees/{id}/personal-information` | `employee.sensitive.write` | Update sensitive personal information. |
| GET | `/employees/{id}/emergency-contacts` | `employee.sensitive.read` | List emergency contacts. |
| POST | `/employees/{id}/emergency-contacts` | `employee.sensitive.write` | Create emergency contact. |
| GET | `/employees/{id}/contracts` | `employee.read` | List employment contracts. |
| POST | `/employees/{id}/contracts` | `employee.write` | Create employment contract. |
| POST | `/employees/{id}/status-changes` | `employee.status.write` | Change employment status. |
| GET | `/employees/{id}/status-history` | `employee.read` | List status history. |
| GET | `/employees/{id}/documents` | `employee.document.read` | List document metadata. |
| POST | `/employees/{id}/documents` | `employee.document.write` | Create document metadata. |

## Query Parameters

Employee list supports `page`, `size`, `sort`, `direction`, `search`, `companyId`, `branchId`, `departmentId`, `positionId`, and `status`.

Search matches:

- `employeeNumber`
- `firstName`
- `lastName`
- `workEmail`

## Request Schemas

### CreateEmployeeRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `companyId` | uuid | Yes | Existing active company. |
| `branchId` | uuid | Yes | Existing active branch. |
| `employeeNumber` | string | Yes | Unique per company. |
| `firstName` | string | Yes | Employee first name. |
| `lastName` | string | No | Employee last name. |
| `workEmail` | string | No | Unique per company when present. |
| `departmentId` | uuid | No | Active department. |
| `positionId` | uuid | No | Active position. |
| `employmentStatus` | string | Yes | Initial status. |
| `hireDate` | date | No | Required for active employees. |

### ChangeEmployeeStatusRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `newStatus` | string | Yes | Target status. |
| `effectiveDate` | date | Yes | Status effective date. |
| `reason` | string | No | Optional reason. |

### CreateEmployeeDocumentRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `documentType` | string | Yes | Document type. |
| `fileName` | string | Yes | Original file name. |
| `accessClassification` | string | Yes | Access classification. |
| `retentionCategory` | string | Yes | Retention category. |
| `expiresAt` | date | No | Optional expiration. |

## Response Behavior

- Employee profile responses exclude sensitive fields unless permission allows them.
- Sensitive endpoints must be audited according to security policy.
- Validation errors use `VALIDATION_ERROR`.
- Sensitive permission failures use `EMPLOYEE_SENSITIVE_PERMISSION_REQUIRED`.

## OpenAPI

Initial foundation contract: `apis/v1/foundation.openapi.yaml`.
