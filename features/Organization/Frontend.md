# Organization Frontend

## Navigation

Organization appears under the administrator navigation group: `Admin > Organization`.

## Screens

| Screen | Purpose | Route |
| --- | --- | --- |
| Organization Overview | Show setup status and shortcuts. | `/organization` |
| Departments | Maintain departments and divisions. | `/organization/departments` |
| Positions | Maintain positions, grades, and job levels. | `/organization/positions` |
| Organization Tree | View and move organization units. | `/organization/tree` |
| Structure History | Review hierarchy changes. | `/organization/history` |

## States

Each screen must support loading, empty, search and filter, validation error, permission denied, hierarchy conflict, and optimistic locking conflict states.

## Components

| Component | Responsibility |
| --- | --- |
| `DepartmentTable` | Search and manage departments. |
| `DivisionTable` | Search and manage divisions within departments. |
| `PositionTable` | Search and manage positions. |
| `GradeLevelSettings` | Maintain grades and job levels. |
| `OrganizationTreeView` | Display hierarchy. |
| `MoveOrganizationUnitDialog` | Move a unit with effective date and reason. |

## Validation

- Codes and names are required.
- Parent selection cannot create a cycle.
- Inactive values are visible for historical records but disabled for new assignments.
- Effective date is required for hierarchy moves.

## UX Acceptance Criteria

- Admin can search organization records by code and name.
- Admin can distinguish active and inactive organization values.
- Admin can view hierarchy before changing it.
- Hierarchy changes require confirmation and effective date.
- Error messages clearly identify duplicate code, inactive parent, and cycle conflicts.
