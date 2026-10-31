# Organization Business Rules

## Department And Division Rules

- Department code is required and unique per company.
- Department name is required.
- Division code is required and unique per department.
- A division must belong to an active department.
- A department cannot be deactivated while it has active divisions, positions, or employee assignments.

## Position Rules

- Position code is required and unique per company.
- Position name is required.
- A position may be linked to a department, division, grade, and job level.
- Inactive positions cannot be assigned to new employee records.
- Position changes that affect employee assignments must be auditable.

## Grade And Job Level Rules

- Grade code is required and unique per company.
- Job level code is required and unique per company.
- Grade and job level ordering must be numeric and unique within company scope.
- Inactive grades and job levels cannot be assigned to new positions or employees.

## Hierarchy Rules

- Organization unit codes are unique per company.
- A unit cannot be its own parent.
- Cycles are not allowed.
- A parent unit must be active before a child unit can be activated.
- Structure changes must preserve old parent, new parent, effective date, actor, and reason when provided.

## Errors

| Code | Trigger |
| --- | --- |
| `ORG_CODE_DUPLICATE` | Code already exists in the required scope. |
| `ORG_PARENT_INACTIVE` | Selected parent organization unit is inactive. |
| `ORG_HIERARCHY_CYCLE` | Requested hierarchy change creates a cycle. |
| `ORG_UNIT_HAS_ASSIGNMENTS` | Deactivation is blocked by active employee assignments. |
| `ORG_EFFECTIVE_DATE_INVALID` | Effective date conflicts with existing structure history. |

## Review Requirement

Rules must be reviewed with business stakeholders and translated into tests before implementation.
