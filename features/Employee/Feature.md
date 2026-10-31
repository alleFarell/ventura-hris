# Employee Feature

## Scope

Employee manages employee master data and related profile sections. It covers employee identity, employment assignment, personal information, emergency contacts, education, experience, family data, documents, contracts, and employment status history.

## Primary Users

- HR administrator
- Manager with employee visibility permissions
- Employee through self-service where allowed

## Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| EMP-FR-001 | Create and maintain employee master records. | Must |
| EMP-FR-002 | Assign employees to company, branch, department, position, grade, and job level. | Must |
| EMP-FR-003 | Maintain personal information with sensitive-field permissions. | Must |
| EMP-FR-004 | Maintain emergency contacts. | Must |
| EMP-FR-005 | Maintain education, experience, and family records. | Should |
| EMP-FR-006 | Maintain employment contracts and status history. | Must |
| EMP-FR-007 | Maintain employee document metadata. | Must |
| EMP-FR-008 | Support employee search and filtering. | Must |

## Non-Functional Requirements

- Sensitive employee fields must be permissioned, masked where appropriate, and audited.
- Employee list APIs must support pagination, search, and status filtering.
- Employee profile updates must use optimistic locking.
- Document handling must store metadata first; binary storage integration can be implemented later.
- Employment status changes must be historically traceable.

## Permissions

| Permission | Description |
| --- | --- |
| `employee.read` | View non-sensitive employee profile fields. |
| `employee.write` | Create and update employee records. |
| `employee.sensitive.read` | View sensitive personal fields. |
| `employee.sensitive.write` | Update sensitive personal fields. |
| `employee.document.read` | View employee document metadata. |
| `employee.document.write` | Add or update document metadata. |
| `employee.status.write` | Change employment status. |

## Dependencies

- Setup company and branch must exist.
- Organization values must exist before employee assignment.
- Security permissions must be enforced server-side.

## Acceptance Criteria

- Employee number is unique per company.
- Employee can be created with required identity and employment assignment fields.
- Employee assignment rejects inactive company, branch, department, or position values.
- Sensitive fields require explicit permissions.
- Employment status changes create history records.
- Document metadata includes owner, type, retention, access classification, and status.
- OpenAPI includes employee list, create, detail, update, profile sections, status, and document metadata behavior.

## Test Expectations

- Unit tests for employee number uniqueness and status transition rules.
- Service tests for sensitive-field permission behavior.
- Repository tests for search, filters, and soft delete behavior.
- Controller tests for validation and response envelope.
- API contract tests for employee list, create, update, status, and document endpoints.

## Status

Sprint 01 implementation-ready draft. Requires product, security, and architecture review before feature coding.
