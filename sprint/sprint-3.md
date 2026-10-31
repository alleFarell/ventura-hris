# Sprint 3: Employee Master Data, Documents & Profile Management

## 1. Sprint Overview

- **Sprint Number:** Sprint 3
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-10-12 to 2026-10-25 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-10-12
  - **End Date:** 2026-10-25
- **Target Phase:** Phase 1 – Foundation & Core HR
- **Primary Domains:** [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee), Shared Architecture

---

## 2. Sprint Goals

1. **Establish Employee Master Registry:** Build core employee entity with multi-tier organization assignments (company, branch, department, division, position, grade, job level) and unique employee numbering.
2. **Implement Employment Lifecycle & Status Engine:** Build status transition engine (`CANDIDATE`, `PROBATION`, `ACTIVE`, `SUSPENDED`, `TERMINATED`) with active prerequisite validations and immutable audit tracking (`employment_status_histories`).
3. **Build Profile Extensions:** Implement Personal Information, Emergency Contacts, Employment Contracts (with non-overlapping date validations), and Document Metadata tracking.
4. **Deliver Frontend Employee Management:** Implement interactive Next.js views for the Employee Directory (`/employee`) and comprehensive Tabbed Employee Profile (`/employee/[id]`).

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V4__create_employee_tables.sql`: Tables for `employees`, `employee_personal_information`, `employee_emergency_contacts`, `employment_contracts`, `employment_status_histories`, and `employee_documents`.
- **Backend Services & APIs:**
  - Employee Master endpoints (`GET`, `POST`, `PUT`, `DELETE` on `/api/v1/employees`).
  - Personal Information endpoints (`GET`, `PUT` on `/api/v1/employees/{id}/personal-information`).
  - Emergency Contacts endpoints (`GET`, `POST`, `DELETE` on `/api/v1/employees/{id}/emergency-contacts`).
  - Contract Management endpoints (`GET`, `POST` on `/api/v1/employees/{id}/contracts`).
  - Status Change & History endpoints (`POST /api/v1/employees/{id}/status-changes`, `GET /api/v1/employees/{id}/status-history`).
  - Document Metadata endpoints (`GET`, `POST` on `/api/v1/employees/{id}/documents`).
- **Frontend Applications & Views:**
  - Employee Directory (`/employee` with search, company/department/status filtering, and quick add dialog).
  - Tabbed Employee Profile (`/employee/[id]` covering Overview & Assignment, Personal Info, Employment & Contracts, Emergency Contacts, and Documents).
- **Testing & Quality:**
  - Unit and integration tests covering employee number uniqueness, active prerequisite validation, status transition restrictions, contract overlap checks, and profile extensions.
  - Zero TypeScript/build errors on Next.js production build (`next build`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database & Flyway Migration V4 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V4 for employee tables**
  - Table `employees` with foreign keys to setup and organization tables.
  - Table `employee_personal_information` with 1-to-1 link to `employees`.
  - Table `employee_emergency_contacts` with primary contact indicator.
  - Table `employment_contracts` with contract type and date ranges.
  - Table `employment_status_histories` tracking old/new status, effective date, and reason.
  - Table `employee_documents` tracking document metadata, access classification, and retention.
- [x] **Checkpoint 1:** Flyway migration V4 executes cleanly against PostgreSQL and in-memory test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: JPA Entities & Enums**
  - Create `EmploymentStatus` and `ContractType` enums.
  - Create entities: `Employee`, `EmployeePersonalInformation`, `EmployeeEmergencyContact`, `EmploymentContract`, `EmploymentStatusHistory`, `EmployeeDocument`.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories with search queries and soft delete handling.
  - Create request records and response envelopes.
- [x] **Checkpoint 2:** JPA entities and repositories compile and match database schema.

---

### Milestone 3: Business Logic Services & REST Controllers (Days 5–7)
- [x] **Task 3.1: Employee Master Service**
  - Unique employee number per company validation.
  - Active assignment validation (`EMPLOYEE_INACTIVE_ASSIGNMENT`).
  - Active status requirements (company, branch, department, position, hire date).
- [x] **Task 3.2: Profile Extensions & Status Engine**
  - Personal Information and Emergency Contacts handling.
  - Employment contracts with overlap check (`EMPLOYEE_CONTRACT_DATE_OVERLAP`).
  - Status transition engine with immutable history logging.
  - Document metadata registry.
- [x] **Task 3.3: REST Controllers**
  - Implement `EmployeeController` covering all profile endpoints.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Feature Implementation (Days 8–9)
- [x] **Task 4.1: Employee API Client & Types**
  - TypeScript types and Axios methods for employee endpoints.
- [x] **Task 4.2: Employee Directory View (`/employee`)**
  - Filterable directory table with search, status badges, and employee creation dialog.
- [x] **Task 4.3: Tabbed Employee Profile View (`/employee/[id]`)**
  - Profile header, Personal Information, Employment & Contracts, Emergency Contacts, and Documents sections.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) succeeds cleanly with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.3.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Execute full backend test suite and Next.js production build.
- [x] **Checkpoint 5:** Sprint 3 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Employee Master** | Employee number is required and unique per company; soft delete supported. | Unit & Integration tests |
| **AC-02** | **Assignments** | Assignments require active company and branch; active status requires department, position, and hire date. | Integration tests |
| **AC-03** | **Status Engine** | Status changes validate transitions and create immutable `employment_status_histories` records. | Integration tests |
| **AC-04** | **Contracts** | Employment contracts enforce valid date ranges without overlaps for the same employee. | Integration tests |
| **AC-05** | **Profile Extensions** | Personal information, emergency contacts, and document metadata are maintainable. | Integration tests |
| **AC-06** | **Frontend Quality** | Employee directory and profile views render with responsive states; 0 build errors. | `npm run build` |
