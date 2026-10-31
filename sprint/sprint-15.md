# Sprint 15: Interview Scheduling, Candidate Evaluation & Job Offer Letters

## 1. Sprint Overview

- **Sprint Number:** Sprint 15
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-03-29 to 2027-04-11 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-03-29
  - **End Date:** 2027-04-11
- **Target Phase:** Phase 4 – Talent Acquisition & Performance Management (Sprint 2 of Phase 4)
- **Primary Domains:** [features/Recruitment](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Recruitment), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Interview Coordination:** Schedule interview rounds (screening, technical, user/cultural, HR) with interviewers, meeting links, and calendar invites.
2. **Structured Interview Scorecards:** Standardized evaluation rubrics (technical skills, cultural fit, leadership) with recommendation verdicts (`STRONG_HIRE`, `HIRE`, `NO_HIRE`).
3. **Formal Offer Letter Generation:** Create formal job offer packages with starting salary, allowances, joining date, and offer expiration.
4. **Automated Onboarding Conversion:** Convert accepted candidate offers into provisional employee profiles with 1-click provisioning.
5. **Interactive Interview & Offer Hub:** Next.js views for interview schedules, interviewer scorecards, and offer letter generation.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V16__create_interviews_and_offers_tables.sql`:
    - Table `interview_schedules`: ID, application_id, round_name, scheduled_time, duration_minutes, interviewer_id, location_url, status (`SCHEDULED`, `COMPLETED`, `CANCELLED`).
    - Table `interview_evaluations`: ID, interview_id, interviewer_id, score, verdict (`STRONG_HIRE`, `HIRE`, `NO_HIRE`), feedback_notes, submitted_at.
    - Table `job_offers`: ID, application_id, offered_salary, join_date, expiration_date, status (`DRAFT`, `SENT`, `ACCEPTED`, `DECLINED`), letter_url.
- **Backend Services & APIs:**
  - Interviews: `GET /api/v1/recruitment/interviews`, `POST /api/v1/recruitment/interviews`, `POST /api/v1/recruitment/interviews/{id}/evaluations`.
  - Offers: `GET /api/v1/recruitment/offers`, `POST /api/v1/recruitment/offers`, `PATCH /api/v1/recruitment/offers/{id}/status`.
- **Frontend Applications & Views:**
  - `/recruitment/interviews`: Interview scheduling calendar and scorecard modal.
  - `/recruitment/offers`: Job offer generator and candidate acceptance status tracker.
- **Testing & Quality:**
  - Integration tests for interview scheduling, scorecard submission, and offer state updates.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.15.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V16 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V16**
  - Create `interview_schedules`, `interview_evaluations`, and `job_offers` tables.
- [x] **Checkpoint 1:** Flyway migration V16 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `InterviewSchedule`, `InterviewEvaluation`, `JobOffer` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Interview Engine (Days 5–7)
- [x] **Task 3.1: Interview Scheduling Service**
  - `InterviewService`: Coordinates timeslots and scorecards.
- [x] **Task 3.2: Offer Letter Service**
  - `JobOfferService`: Package generation and acceptance handling.
- [x] **Task 3.3: REST Controllers**
  - `InterviewController` and `JobOfferController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for interviews and offers.
- [x] **Task 4.2: Scheduling & Scorecard Views**
  - `/recruitment/interviews`.
- [x] **Task 4.3: Offers Console**
  - `/recruitment/offers`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.15.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 15 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Interviews** | Interviews validate candidate and interviewer IDs and prevent scheduling collisions. | Integration tests |
| **AC-02** | **Offers** | Offers enforce valid compensation figures and deadline dates. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
