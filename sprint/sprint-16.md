# Sprint 16: Goal Setting (OKRs / KPIs) & Performance Review Cycles

## 1. Sprint Overview

- **Sprint Number:** Sprint 16
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-04-12 to 2027-04-25 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-04-12
  - **End Date:** 2027-04-25
- **Target Phase:** Phase 4 – Talent Acquisition & Performance Management (Sprint 3 of Phase 4)
- **Primary Domains:** [features/Performance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Performance), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Performance Cycle Framework:** Manage organization-wide review cycles (Annual 2027, Mid-Year, Quarterly) with start/end milestones and appraisal eligibility rules.
2. **Cascading Goals & OKR/KPI Model:** Support Objectives and Key Results (OKRs) and quantitative Key Performance Indicators (KPIs) linked from Company to Department to Individual.
3. **Progress Check-Ins:** Enable continuous employee progress updates, target adjustments, and check-in notes against assigned Key Results.
4. **Interactive Goal Dashboard:** Next.js views for creating cycles, setting individual/team goals, and monitoring OKR achievement progress bars.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V17__create_performance_goals_and_review_cycles_tables.sql`:
    - Table `performance_cycles`: ID, name, cycle_type (`ANNUAL`, `SEMI_ANNUAL`, `QUARTERLY`), start_date, end_date, self_review_deadline, manager_review_deadline, status (`PLANNED`, `ACTIVE`, `EVALUATION`, `CLOSED`).
    - Table `performance_goals`: ID, cycle_id, employee_id, title, category (`INDIVIDUAL`, `DEPARTMENT`, `COMPANY`), weight, status (`DRAFT`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
    - Table `performance_goal_key_results`: ID, goal_id, description, metric_type (`PERCENTAGE`, `NUMBER`, `CURRENCY`, `BOOLEAN`), target_value, current_value, progress_percent.
- **Backend Services & APIs:**
  - Cycles: `GET /api/v1/performance/cycles`, `POST /api/v1/performance/cycles`, `PATCH /api/v1/performance/cycles/{id}/status`.
  - Goals: `GET /api/v1/performance/goals`, `POST /api/v1/performance/goals`, `PUT /api/v1/performance/goals/{id}/key-results/{krId}/progress`.
- **Frontend Applications & Views:**
  - `/performance/cycles`: Performance cycle calendar and administration.
  - `/performance/goals`: Employee OKR/KPI dashboard with progress tracking.
- **Testing & Quality:**
  - Integration tests for cycle lifecycle transitions, goal weight validation, and key result progress updates.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.16.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V17 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V17**
  - Create `performance_cycles`, `performance_goals`, and `performance_goal_key_results` tables.
- [x] **Checkpoint 1:** Flyway migration V17 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `PerformanceCycle`, `PerformanceGoal`, `PerformanceGoalKeyResult` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Goal Engine (Days 5–7)
- [x] **Task 3.1: Cycle Management Service**
  - `PerformanceCycleService`: State transitions and deadline enforcement.
- [x] **Task 3.2: Goals & Progress Service**
  - `PerformanceGoalService`: Target calculations and progress rollups.
- [x] **Task 3.3: REST Controllers**
  - `PerformanceCycleController` and `PerformanceGoalController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for performance goals.
- [x] **Task 4.2: Cycle & Goal Views**
  - `/performance/cycles` and `/performance/goals`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.16.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 16 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Goal Progress** | Progress updates calculate accurate completion percentages based on target vs current values. | Integration tests |
| **AC-02** | **Cycles** | Cycles reject goal submissions past configured review deadlines. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
