# Sprint 2: Organization Hierarchy & Job Structures

## 1. Sprint Overview

- **Sprint Number:** Sprint 2
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-09-28 to 2026-10-11 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-09-28
  - **End Date:** 2026-10-11
- **Target Phase:** Phase 1 – Foundation & Core HR
- **Primary Domains:** [features/Organization](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Organization), Shared Architecture

---

## 2. Sprint Goals

1. **Establish Department & Division Structures:** Enable multi-tier departmental modeling scoped by company with active status validation and deactivation protections.
2. **Implement Job Architecture:** Build Salary Grades, Job Levels, and Position master data with relational integrity and ordering constraints.
3. **Build Organization Hierarchy & History Engine:** Implement recursive tree assembly (`organization_units`) with cycle-prevention algorithms and immutable audit tracking (`organization_structure_histories`).
4. **Deliver Frontend Organization Management:** Implement interactive Next.js views for Organization Overview, Departments/Divisions, Positions, Grades/Levels, and a visual Organization Tree.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V3__create_organization_tables.sql`: Tables for `departments`, `divisions`, `grades`, `job_levels`, `positions`, `organization_units`, `organization_structure_histories`.
- **Backend Services & APIs:**
  - Department & Division endpoints (`GET`, `POST`, `PUT`, `DELETE` on `/api/v1/departments`, `/api/v1/divisions`).
  - Grade & Job Level endpoints (`GET`, `POST`, `PUT`, `DELETE` on `/api/v1/grades`, `/api/v1/job-levels`).
  - Position endpoints (`GET`, `POST`, `PUT`, `DELETE` on `/api/v1/positions`).
  - Hierarchy endpoints (`GET /api/v1/organization-units/tree`, `PUT /api/v1/organization-units/{id}/parent`, `GET /api/v1/organization-units/{id}/history`).
- **Frontend Applications & Views:**
  - Organization Management Hub (`/organization` with tabbed architecture: Hierarchy Tree, Departments & Divisions, Positions, Grades & Job Levels).
  - Visual Organization Tree with expandable/collapsible nodes, badges, and action modals.
  - Re-parent Unit modal (`MoveUnitDialog`) with effective date, reason, and cycle detection.
  - Structure change history modal (`StructureHistoryDialog`) displaying chronological audit trails.
- **Testing & Quality:**
  - Unit and integration tests covering CRUD, uniqueness constraints, tree construction, cycle detection (`ORG_HIERARCHY_CYCLE`), and structure history logging (12/12 passing).
  - Next.js production build clean (0 errors, Turbopack verified).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database & Flyway Migration (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V3 for organization tables**
  - Create table `departments` with unique index `(company_id, lower(code))`.
  - Create table `divisions` with unique index `(department_id, lower(code))`.
  - Create tables `grades` and `job_levels` with unique `sort_order` per company.
  - Create table `positions` with foreign keys to department, division, grade, and job level.
  - Create table `organization_units` with self-referencing `parent_unit_id`.
  - Create table `organization_structure_histories` tracking old/new parent and effective date.
- [x] **Checkpoint 1:** Flyway migration V3 successfully executes and maps cleanly to JPA entities.

---

### Milestone 2: Backend Department, Division & Job Structures (Days 3–5)
- [x] **Task 2.1: Department and Division JPA Entities, Repositories, and Services**
  - Implement unique code validation and active parent checks.
  - Implement deactivation protection (cannot delete department if active divisions or positions exist).
- [x] **Task 2.2: Grade and Job Level Services**
  - Implement unique ordering and code checks per company.
- [x] **Task 2.3: Position JPA Entities, Repositories, and Services**
  - Enforce relational integrity (department, division, grade, and level must be active).
- [x] **Checkpoint 2:** Unit tests verify department, division, grade, and position business rules.

---

### Milestone 3: Hierarchy Tree & Structure History Engine (Days 6–7)
- [x] **Task 3.1: Recursive Tree Assembly**
  - Fetch active non-deleted units and construct nested hierarchy tree.
- [x] **Task 3.2: Cycle Prevention & Move Unit Service**
  - Implement recursive cycle detection (`isDescendant` check).
  - Throw `ORG_HIERARCHY_CYCLE` when target parent is a descendant of the moved unit.
  - Save historical record into `organization_structure_histories` with effective date and reason.
- [x] **Checkpoint 3:** Integration tests verify cycle prevention, valid moves, and structure history creation.

---

### Milestone 4: Frontend Organization Views & Interactive Tree (Days 8–9)
- [x] **Task 4.1: Organization API Client & Types**
  - Create TypeScript models and Axios client methods for organization endpoints.
- [x] **Task 4.2: Department, Position, and Grade Management Views**
  - Implement `/organization` with Departments, Positions, and Grades/Levels tabs.
- [x] **Task 4.3: Interactive Organization Tree Visualizer**
  - Implement visual collapsible tree view, Move Unit modal, and History dialog.
- [x] **Checkpoint 4:** End-to-end user experience verified: navigate between views, create units, view tree, and re-parent units.

---

### Milestone 5: OpenAPI Synchronization & Sprint Audit (Day 10)
- [x] **Task 5.1: OpenAPI Specification Synchronization**
  - Update `apis/v1/foundation.openapi.yaml` with all organization endpoints and schemas.
- [x] **Task 5.2: Verification & Test Execution**
  - Run `mvn test` in docker with 100% passing tests (12/12 passing).
  - Run `npm run build` in frontend (Clean build, 8/8 routes compiled).
- [x] **Checkpoint 5:** Sprint 2 verified, documented, and ready for review.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-01** | **Department/Division** | Unique codes per company/department; cannot delete department with active children. | Unit & Integration tests | **PASSED** |
| **AC-02** | **Job Structure** | Grades and Job Levels maintain unique numeric sort order per company. | Automated tests | **PASSED** |
| **AC-03** | **Positions** | Positions link to active department, division, grade, and job level. | Automated tests | **PASSED** |
| **AC-04** | **Hierarchy Tree** | API returns nested tree hierarchy without deleted/inactive units by default. | Integration tests + UI tree view | **PASSED** |
| **AC-05** | **Cycle Prevention** | Moving a unit to itself or any of its descendants is blocked with `ORG_HIERARCHY_CYCLE`. | Integration tests | **PASSED** |
| **AC-06** | **Structure History** | Every parent change creates an immutable audit record with effective date and reason. | Integration tests | **PASSED** |
| **AC-07** | **Frontend Quality** | 0 build errors, clean Next.js production build, responsive UI. | `npm run build` | **PASSED** |
