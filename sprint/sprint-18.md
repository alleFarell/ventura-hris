# Sprint 18: Training Catalog, Course Management & Certifications

## 1. Sprint Overview

- **Sprint Number:** Sprint 18
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-05-10 to 2027-05-23 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-05-10
  - **End Date:** 2027-05-23
- **Target Phase:** Phase 5 – Employee Development, Assets & Offboarding (Sprint 1 of Phase 5)
- **Primary Domains:** [features/Training](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Training), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Course & Provider Catalog:** Organize internal and external training programs with duration, syllabi, provider info, and cost.
2. **Session Scheduling & Attendance:** Schedule training cohorts with location/virtual room, capacity limits, and attendee roster tracking.
3. **Enrollment & Manager Approvals:** Enable employee course requests, manager sign-offs, and automated enrollment confirmations.
4. **Professional Certifications & Licenses:** Track professional credentials, validities, renewal dates, and automated expiration warnings.
5. **Interactive Training Hub:** Next.js views for browsing course catalogs, managing sessions, and tracking employee certifications.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V19__create_training_and_certifications_tables.sql`:
    - Table `training_courses`: ID, code, title, category (`TECHNICAL`, `LEADERSHIP`, `COMPLIANCE`, `SOFT_SKILLS`), provider_name, duration_hours, cost, is_active.
    - Table `training_sessions`: ID, course_id, session_name, start_time, end_time, location, capacity, status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
    - Table `training_enrollments`: ID, session_id, employee_id, enrollment_status (`REQUESTED`, `APPROVED`, `ATTENDED`, `COMPLETED`, `CANCELLED`), score, certificate_url.
    - Table `employee_certifications`: ID, employee_id, certification_name, issuing_organization, credential_id, issue_date, expiration_date, verification_url.
- **Backend Services & APIs:**
  - Courses & Sessions: `GET /api/v1/training/courses`, `POST /api/v1/training/courses`, `GET /api/v1/training/sessions`, `POST /api/v1/training/sessions`.
  - Enrollments: `GET /api/v1/training/enrollments`, `POST /api/v1/training/enrollments`, `PUT /api/v1/training/enrollments/{id}/status`.
  - Certifications: `GET /api/v1/training/certifications`, `POST /api/v1/training/certifications`.
- **Frontend Applications & Views:**
  - `/training/courses`: Course catalog and course creator.
  - `/training/sessions`: Upcoming session schedule and attendee roster.
  - `/training/certifications`: Employee credentials and expiration tracker.
- **Testing & Quality:**
  - Integration tests for course creation, capacity overflow prevention, and certification tracking.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.18.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V19 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V19**
  - Create `training_courses`, `training_sessions`, `training_enrollments`, and `employee_certifications` tables.
- [x] **Checkpoint 1:** Flyway migration V19 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `TrainingCourse`, `TrainingSession`, `TrainingEnrollment`, `EmployeeCertification` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Training Engine (Days 5–7)
- [x] **Task 3.1: Course & Session Service**
  - `TrainingCourseService` and `TrainingSessionService`.
- [x] **Task 3.2: Enrollment & Certification Service**
  - `TrainingEnrollmentService` and `EmployeeCertificationService`.
- [x] **Task 3.3: REST Controllers**
  - `TrainingCourseController`, `TrainingEnrollmentController`, `CertificationController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for training and credentials.
- [x] **Task 4.2: Course Catalog & Sessions Views**
  - `/training/courses` and `/training/sessions`.
- [x] **Task 4.3: Certifications Tracker**
  - `/training/certifications`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.18.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 18 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Session Capacity** | Enrollments cannot exceed the maximum session capacity. | Integration tests |
| **AC-02** | **Certifications** | Credentials track validity dates and notify prior to expiration. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
