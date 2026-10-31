# Sprint 17: 360-Degree Feedback, Appraisals & Competency Matrix

## 1. Sprint Overview

- **Sprint Number:** Sprint 17
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-04-26 to 2027-05-09 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-04-26
  - **End Date:** 2027-05-09
- **Target Phase:** Phase 4 – Talent Acquisition & Performance Management (Sprint 4 of Phase 4 - Concluding Phase 4)
- **Primary Domains:** [features/Performance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Performance), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Competency Models & Assessment Matrix:** Define core, functional, and leadership competencies with expected proficiency levels across job grades.
2. **Appraisal Review Workflows:** Execute multi-step appraisal evaluations including employee self-evaluation, direct manager appraisal, and final rating calibration.
3. **360-Degree Peer Feedback:** Request and submit confidential multi-rater peer reviews (peers, direct reports, cross-functional collaborators).
4. **Appraisal Score Rollups & Normalization:** Consolidate objective goal achievements and subjective competency ratings into a unified final score with bell curve distribution insights.
5. **Interactive Performance Hub:** Next.js views for competency models, appraisal forms, and 360 feedback submission.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V18__create_appraisals_and_competencies_tables.sql`:
    - Table `competency_models`: ID, code, name, category (`CORE`, `LEADERSHIP`, `FUNCTIONAL`), description.
    - Table `employee_appraisals`: ID, cycle_id, employee_id, manager_id, self_score, manager_score, final_score, performance_grade (`A`, `B`, `C`, `D`), status (`SELF_REVIEW`, `MANAGER_REVIEW`, `CALIBRATION`, `COMPLETED`), manager_comments.
    - Table `appraisal_360_feedback`: ID, appraisal_id, reviewer_id, relationship (`PEER`, `SUBORDINATE`, `CROSS_FUNCTIONAL`), rating, feedback_text, is_anonymous, status (`REQUESTED`, `SUBMITTED`).
- **Backend Services & APIs:**
  - Competencies: `GET /api/v1/performance/competencies`, `POST /api/v1/performance/competencies`.
  - Appraisals: `GET /api/v1/performance/appraisals`, `POST /api/v1/performance/appraisals`, `PUT /api/v1/performance/appraisals/{id}/submit-self`, `PUT /api/v1/performance/appraisals/{id}/submit-manager`.
  - 360 Feedback: `GET /api/v1/performance/feedback`, `POST /api/v1/performance/feedback/request`, `POST /api/v1/performance/feedback/{id}/respond`.
- **Frontend Applications & Views:**
  - `/performance/competencies`: Competency dictionary and proficiency level editor.
  - `/performance/appraisals`: Appraisal review board and self/manager assessment forms.
  - `/performance/feedback`: 360 peer feedback requester and response console.
- **Testing & Quality:**
  - Integration tests for competency definitions, appraisal transitions, and anonymous peer feedback.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.17.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V18 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V18**
  - Create `competency_models`, `employee_appraisals`, and `appraisal_360_feedback` tables.
- [x] **Checkpoint 1:** Flyway migration V18 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `CompetencyModel`, `EmployeeAppraisal`, `Appraisal360Feedback` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Appraisal Engine (Days 5–7)
- [x] **Task 3.1: Appraisal Workflow Service**
  - `EmployeeAppraisalService`: Self-review, manager review, and rating grade determination.
- [x] **Task 3.2: 360 Feedback Service**
  - `Appraisal360FeedbackService`: Review requests and anonymous aggregation.
- [x] **Task 3.3: REST Controllers**
  - `CompetencyController`, `AppraisalController`, `FeedbackController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for appraisals and feedback.
- [x] **Task 4.2: Competency & Appraisal Views**
  - `/performance/competencies` and `/performance/appraisals`.
- [x] **Task 4.3: 360 Feedback View**
  - `/performance/feedback`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.17.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 17 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Appraisal Flow**| Appraisals enforce sequential progression: `SELF_REVIEW` -> `MANAGER_REVIEW` -> `COMPLETED`. | Integration tests |
| **AC-02** | **360 Anonymity** | Anonymous peer feedback masks reviewer identity in response payloads. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
