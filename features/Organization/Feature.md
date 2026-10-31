# Organization Feature

## Scope

Organization manages the company structure needed for employee assignment, approvals, reporting lines, and future workflow rules. It covers departments, divisions, positions, grades, job levels, organization units, and structure history.

## Primary Users

- HR administrator
- Organization planner
- Manager with assigned permissions

## Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| ORG-FR-001 | Create and maintain departments under a company. | Must |
| ORG-FR-002 | Create and maintain divisions under departments where used. | Must |
| ORG-FR-003 | Create and maintain positions. | Must |
| ORG-FR-004 | Create and maintain grades and job levels. | Should |
| ORG-FR-005 | Represent parent-child organization units. | Must |
| ORG-FR-006 | Track organization structure changes over time. | Must |
| ORG-FR-007 | Prevent inactive units from new employee assignment. | Must |

## Non-Functional Requirements

- Organization hierarchy queries must be indexed for common tree and lookup use cases.
- Structural changes must be auditable and historically traceable.
- Organization list APIs must support pagination, search, and status filtering.
- Organization tree APIs must avoid returning deleted units by default.

## Permissions

| Permission | Description |
| --- | --- |
| `organization.read` | View organization setup. |
| `organization.write` | Create or update organization setup. |
| `organization.structure.read` | View hierarchy and structure history. |
| `organization.structure.write` | Change hierarchy and effective structure. |

## Dependencies

- Setup company must exist.
- Employee assignment uses active organization values.
- Workflow and approvals will depend on manager and hierarchy data.

## Acceptance Criteria

- Departments, divisions, positions, grades, and job levels can be defined under a company.
- Codes are unique within the appropriate company scope.
- Organization units can form a hierarchy without cycles.
- Inactive units cannot be assigned to new employees.
- Structural changes preserve history.
- OpenAPI includes hierarchy endpoints and validation errors.

## Test Expectations

- Unit tests for hierarchy validation and uniqueness.
- Repository tests for active-only lookups.
- Service tests for structure history creation.
- API contract tests for department, position, and structure endpoints.

## Status

Sprint 01 implementation-ready draft. Requires product and architecture review before feature coding.
