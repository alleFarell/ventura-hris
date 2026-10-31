# Organization API

## Base Path

```text
/api/v1
```

## Endpoints

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/departments` | `organization.read` | List departments. |
| POST | `/departments` | `organization.write` | Create department. |
| GET | `/departments/{id}` | `organization.read` | Get department detail. |
| PUT | `/departments/{id}` | `organization.write` | Update department. |
| GET | `/divisions` | `organization.read` | List divisions. |
| POST | `/divisions` | `organization.write` | Create division. |
| GET | `/positions` | `organization.read` | List positions. |
| POST | `/positions` | `organization.write` | Create position. |
| GET | `/grades` | `organization.read` | List grades. |
| POST | `/grades` | `organization.write` | Create grade. |
| GET | `/job-levels` | `organization.read` | List job levels. |
| POST | `/job-levels` | `organization.write` | Create job level. |
| GET | `/organization-units/tree` | `organization.structure.read` | Get active hierarchy tree. |
| PUT | `/organization-units/{id}/parent` | `organization.structure.write` | Move organization unit. |
| GET | `/organization-units/{id}/history` | `organization.structure.read` | Get structure history. |

## Query Parameters

List endpoints support `page`, `size`, `sort`, `direction`, `search`, `status`, and `companyId`.

## Request Schemas

### CreateDepartmentRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `companyId` | uuid | Yes | Existing company. |
| `code` | string | Yes | Unique per company. |
| `name` | string | Yes | Department name. |
| `description` | string | No | Optional notes. |

### CreatePositionRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `companyId` | uuid | Yes | Existing company. |
| `departmentId` | uuid | No | Active department. |
| `divisionId` | uuid | No | Active division. |
| `gradeId` | uuid | No | Active grade. |
| `jobLevelId` | uuid | No | Active job level. |
| `code` | string | Yes | Unique per company. |
| `name` | string | Yes | Position name. |

### MoveOrganizationUnitRequest

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `newParentUnitId` | uuid | No | Null means root. |
| `effectiveDate` | date | Yes | Must not conflict with existing history. |
| `reason` | string | No | Optional reason. |

## Response Behavior

- Hierarchy endpoints return active, non-deleted units by default.
- Write operations return updated resource response.
- Invalid hierarchy changes return `ORG_HIERARCHY_CYCLE`.

## OpenAPI

Initial foundation contract: `apis/v1/foundation.openapi.yaml`.
