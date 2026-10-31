# Setup API

## Base Path

```text
/api/v1
```

## Endpoints

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/companies` | `setup.company.read` | List companies with pagination and search. |
| POST | `/companies` | `setup.company.write` | Create company. |
| GET | `/companies/{id}` | `setup.company.read` | Get company detail. |
| PUT | `/companies/{id}` | `setup.company.write` | Update editable company fields. |
| GET | `/branches` | `setup.branch.read` | List branches with company filter. |
| POST | `/branches` | `setup.branch.write` | Create branch. |
| GET | `/branches/{id}` | `setup.branch.read` | Get branch detail. |
| PUT | `/branches/{id}` | `setup.branch.write` | Update branch. |
| GET | `/setup/readiness` | `setup.company.read` | Get setup readiness state. |

## Query Parameters

List endpoints support `page`, `size`, `sort`, `direction`, `search`, and `status`. Branches also support `companyId`.

## Request Schemas

### CreateCompanyRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `code` | string | Yes | Unique company code. |
| `name` | string | Yes | Display name. |
| `legalName` | string | Yes | Legal name. |
| `taxIdentifier` | string | No | Permission-sensitive. |
| `defaultLocale` | string | Yes | Valid locale code. |
| `timezone` | string | Yes | Valid IANA timezone. |
| `currency` | string | Yes | ISO 4217 code. |

### CreateBranchRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `companyId` | uuid | Yes | Existing active company. |
| `code` | string | Yes | Unique per company. |
| `name` | string | Yes | Branch name. |
| `addressLine1` | string | No | Required before activation. |
| `city` | string | No | Required before activation. |
| `countryCode` | string | No | ISO country code. |

## Response Behavior

- Success responses use the standard API envelope.
- Validation errors use `VALIDATION_ERROR`.
- Duplicate code errors use domain-specific error codes from `BusinessRules.md`.
- Write operations return audit-safe response bodies.

## OpenAPI

Initial contract location: `apis/v1/foundation.openapi.yaml`.
