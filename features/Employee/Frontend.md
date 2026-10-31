# Employee Frontend

## Navigation

Employee appears under the HR administrator navigation group: `HR > Employees`.

## Screens

| Screen | Purpose | Route |
| --- | --- | --- |
| Employee List | Search, filter, and open employee profiles. | `/employee` |
| Create Employee | Create employee master record. | `/employee/new` |
| Employee Profile | View employee summary and assignment. | `/employee/[id]` |
| Personal Information | View or edit sensitive profile details. | `/employee/[id]/personal` |
| Employment | Manage status, assignment, and contracts. | `/employee/[id]/employment` |
| Emergency Contacts | Maintain emergency contacts. | `/employee/[id]/emergency-contacts` |
| Documents | Maintain document metadata. | `/employee/[id]/documents` |

## States

Each screen must support loading, empty, search and filter, validation error, permission denied, sensitive data masked, optimistic locking conflict, and status transition blocked states.

## Components

| Component | Responsibility |
| --- | --- |
| `EmployeeTable` | Search, filter, and list employees. |
| `EmployeeCreateForm` | Create employee master record. |
| `EmployeeProfileHeader` | Show identity, status, and assignment summary. |
| `EmployeeAssignmentForm` | Maintain branch, department, and position assignment. |
| `PersonalInformationForm` | Maintain sensitive personal fields. |
| `EmploymentStatusTimeline` | Show status history. |
| `EmployeeDocumentTable` | List document metadata and status. |

## Validation

- Employee number and first name are required.
- Company and branch are required.
- Active status requires valid company, branch, department, position, and hire date unless exception policy is approved.
- Sensitive fields must remain hidden or masked without permission.
- Document metadata requires type, file name, classification, and retention category.

## UX Acceptance Criteria

- HR admin can search employees by number, name, or work email.
- HR admin can filter employees by company, branch, department, position, and status.
- Users without sensitive permission can open profile pages without seeing sensitive fields.
- Status history is visible from the employment screen.
- Validation messages are field-specific and preserve entered values.
