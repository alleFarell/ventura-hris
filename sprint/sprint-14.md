# Sprint 14: Job Requisitions, Postings & Applicant Tracking System (ATS)

## 1. Sprint Overview

- **Sprint Number:** Sprint 14
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-03-15 to 2027-03-28 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-03-15
  - **End Date:** 2027-03-28
- **Target Phase:** Phase 4 – Talent Acquisition & Performance Management (Sprint 1 of Phase 4)
- **Primary Domains:** [features/Recruitment](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Recruitment), [features/Organization](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Organization)

---

## 2. Sprint Goals

1. **Job Requisition Management:** Enable hiring managers to raise headcount requisitions with budget validation, required qualifications, and multi-step approvals.
2. **Job Postings Engine:** Publish approved requisitions into public or internal job postings with application deadlines and requirements.
3. **Candidate Registry & ATS Pipeline:** Track applicant profiles, resumes, contact information, and progression across stages (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFERED`, `HIRED`, `REJECTED`).
4. **Interactive ATS Kanban Board:** Next.js board allowing drag-and-drop or stage transitions of candidates across the recruitment funnel.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V15__create_recruitment_and_applicant_tables.sql`:
    - Table `job_requisitions`: ID, title, department_id, position_id, headcount, employment_type (`PERMANENT`, `CONTRACT`, `INTERNSHIP`), min_salary, max_salary, justification, status (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `CLOSED`).
    - Table `job_postings`: ID, requisition_id, posting_title, description, requirements, location, is_published, closing_date.
    - Table `job_candidates`: ID, full_name, email, phone, resume_url, linkedin_url, portfolio_url.
    - Table `job_applications`: ID, job_posting_id, candidate_id, application_date, current_stage (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFERED`, `HIRED`, `REJECTED`), rating, notes.
- **Backend Services & APIs:**
  - Requisitions: `GET /api/v1/recruitment/requisitions`, `POST /api/v1/recruitment/requisitions`, `PUT /api/v1/recruitment/requisitions/{id}/approve`.
  - Postings: `GET /api/v1/recruitment/postings`, `POST /api/v1/recruitment/postings`.
  - Candidates & Applications: `GET /api/v1/recruitment/candidates`, `POST /api/v1/recruitment/applications`, `PUT /api/v1/recruitment/applications/{id}/stage`.
- **Frontend Applications & Views:**
  - `/recruitment/requisitions`: Job requisition list and request form.
  - `/recruitment/postings`: Job opening manager.
  - `/recruitment/candidates`: ATS candidate pipeline and applicant details drawer.
- **Testing & Quality:**
  - Integration tests for job requisition approvals, posting generation, and applicant stage progression.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.14.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V15 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V15**
  - Create `job_requisitions`, `job_postings`, `job_candidates`, and `job_applications` tables.
- [x] **Checkpoint 1:** Flyway migration V15 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `JobRequisition`, `JobPosting`, `JobCandidate`, `JobApplication` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & ATS Engine (Days 5–7)
- [x] **Task 3.1: Requisition & Posting Service**
  - `JobRequisitionService` and `JobPostingService`.
- [x] **Task 3.2: Applicant Tracking Service**
  - `JobApplicationService`: Stage movement, candidate tracking.
- [x] **Task 3.3: REST Controllers**
  - `JobRequisitionController`, `JobPostingController`, `JobApplicationController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for recruitment domains.
- [x] **Task 4.2: Requisitions and Postings Views**
  - `/recruitment/requisitions` and `/recruitment/postings`.
- [x] **Task 4.3: ATS Pipeline View**
  - `/recruitment/candidates` with pipeline stages.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.14.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 14 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Requisitions** | Headcount requisitions enforce department linking and approval transitions. | Integration tests |
| **AC-02** | **ATS Funnel** | Applications move across stages with timestamp tracking and rejection notes. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
