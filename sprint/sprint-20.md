# Sprint 20: Offboarding, Asset Returns, Resignation Workflows & Exit Interviews

## 1. Sprint Overview

- **Sprint Number:** Sprint 20
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-06-07 to 2027-06-20 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-06-07
  - **End Date:** 2027-06-20
- **Target Phase:** Phase 5 – Employee Development, Assets & Offboarding (Sprint 3 of Phase 5 - Concluding Phase 5)
- **Primary Domains:** [features/Workflow](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Workflow), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee), [features/Assets](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Assets)

---

## 2. Sprint Goals

1. **Resignation & Separation Submission:** Enable employee resignation requests with notice period validation, resignation reason, and manager/HR acknowledgment.
2. **Cross-Departmental Clearance Checklists:** Manage departmental sign-offs (IT Access Revocation, Asset Handover, Finance/Loan Settlement, HR Clearance).
3. **Structured Exit Interviews:** Record structured employee feedback regarding reasons for leaving, company culture ratings, and retention insights.
4. **Automated Status Termination:** Seamlessly update the employee master status to `TERMINATED` upon completion of all clearance checkpoints.
5. **Interactive Offboarding Hub:** Next.js views for offboarding cases, clearance tracker, and exit interview management.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V21__create_offboarding_and_exit_management_tables.sql`:
    - Table `offboarding_cases`: ID, employee_id, separation_type (`RESIGNATION`, `TERMINATION`, `RETIREMENT`, `CONTRACT_END`), notice_date, last_working_date, reason, status (`SUBMITTED`, `IN_CLEARANCE`, `COMPLETED`, `CANCELLED`).
    - Table `offboarding_checklists`: ID, case_id, department_name (`IT`, `FINANCE`, `ASSETS`, `HR`), item_name, is_cleared, cleared_by, cleared_at, notes.
    - Table `exit_interviews`: ID, case_id, interviewer_id, primary_reason, culture_rating, management_rating, feedback_text, submitted_at.
- **Backend Services & APIs:**
  - Cases: `GET /api/v1/offboarding/cases`, `POST /api/v1/offboarding/cases`, `GET /api/v1/offboarding/cases/{id}`.
  - Checklists: `GET /api/v1/offboarding/checklists/{caseId}`, `PUT /api/v1/offboarding/checklists/{id}/clear`.
  - Exit Interviews: `POST /api/v1/offboarding/exit-interviews`, `GET /api/v1/offboarding/exit-interviews/{caseId}`.
- **Frontend Applications & Views:**
  - `/offboarding/cases`: Offboarding case management and separation pipeline.
  - `/offboarding/checklists`: Multi-departmental clearance checklist console.
  - `/offboarding/exit-interviews`: Exit interview survey and analytics.
- **Testing & Quality:**
  - Integration tests for offboarding initiation, clearance item completions, exit interview logging, and employee status update to `TERMINATED`.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.20.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V21 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V21**
  - Create `offboarding_cases`, `offboarding_checklists`, and `exit_interviews` tables.
- [x] **Checkpoint 1:** Flyway migration V21 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `OffboardingCase`, `OffboardingChecklist`, `ExitInterview` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Offboarding Engine (Days 5–7)
- [x] **Task 3.1: Offboarding Case Service**
  - `OffboardingCaseService`: Case lifecycle, standard checklist seeding, and employee status termination trigger.
- [x] **Task 3.2: Clearance & Exit Interview Service**
  - `OffboardingChecklistService` and `ExitInterviewService`.
- [x] **Task 3.3: REST Controllers**
  - `OffboardingCaseController`, `OffboardingChecklistController`, `ExitInterviewController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for offboarding.
- [x] **Task 4.2: Case & Clearance Views**
  - `/offboarding/cases` and `/offboarding/checklists`.
- [x] **Task 4.3: Exit Interview View**
  - `/offboarding/exit-interviews`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.20.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 20 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Checklist Auto-Seed**| Creating an offboarding case automatically generates standard clearance tasks for IT, Finance, Assets, and HR. | Integration tests |
| **AC-02** | **Clearance & Termination**| When all clearance checklist items are completed, the offboarding case status transitions to `COMPLETED` and employee status updates to `TERMINATED`. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
