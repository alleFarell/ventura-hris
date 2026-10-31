# Sprint 10: Attendance & Leave Integration into Payroll Calculations

## 1. Sprint Overview

- **Sprint Number:** Sprint 10
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-01-18 to 2027-01-31 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-01-18
  - **End Date:** 2027-01-31
- **Target Phase:** Phase 3 – Compensation, Benefits & Payroll Engine (Sprint 2 of Phase 3)
- **Primary Domains:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll), [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance)

---

## 2. Sprint Goals

1. **Payroll Period Cutoff Engine:** Establish calendar pay periods (e.g. 21st to 20th or 1st to end-of-month) with cutoff dates for attendance and leave consolidation.
2. **Attendance & Leave Ingestion Pipeline:** Automated ingestion of locked monthly attendance recaps, calculating unpaid leave deductions, absent day penalties, lateness fines, and approved overtime earnings.
3. **Mid-Month Salary Proration:** Formulate statutory proration formulas (calendar day vs working day bases) for new hires joining or resigning mid-period.
4. **Pre-Payroll Calculation Simulation & Discrepancy Flagging:** Simulate preliminary gross earnings, deductions, and net salary payouts with discrepancy alerts (e.g., missing clock-outs, pending leaves) before final payroll run.
5. **Interactive Payroll Pre-Processing Dashboard:** Next.js dashboard for managing pay periods, reviewing attendance-to-payroll deductions, and inspecting individual calculation breakdowns.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V11__create_payroll_periods_and_attendance_integration_tables.sql`:
    - Table `payroll_periods`: Code, name, start_date, end_date, attendance_cutoff_date, payout_date, status (`PLANNED`, `ACTIVE`, `PROCESSING`, `COMPLETED`, `CLOSED`).
    - Table `payroll_attendance_cutoffs`: Payroll period ID, employee ID, total_workdays, present_days, absent_days, unpaid_leave_days, late_minutes, overtime_hours, overtime_pay_amount, unpaid_leave_deduction_amount, late_fine_amount.
    - Table `payroll_prorations`: Payroll period ID, employee ID, join_date, resign_date, eligible_workdays, total_period_workdays, proration_factor.
    - Table `payroll_simulations`: Payroll period ID, employee ID, basic_salary, prorated_basic, total_allowances, total_overtime_pay, total_attendance_deductions, gross_salary, simulation_status.
- **Backend Services & APIs:**
  - Payroll Periods: `GET /api/v1/payroll/periods`, `POST /api/v1/payroll/periods`, `PUT /api/v1/payroll/periods/{id}/status`.
  - Attendance Ingestion: `POST /api/v1/payroll/periods/{id}/ingest-attendance`, `GET /api/v1/payroll/periods/{id}/attendance-summary`.
  - Proration & Simulation: `POST /api/v1/payroll/periods/{id}/simulate`, `GET /api/v1/payroll/periods/{id}/simulations`.
- **Frontend Applications & Views:**
  - `/payroll/periods`: Payroll cycle calendar, period status transitions, and cutoff manager.
  - `/payroll/attendance-integration`: Consolidated view of attendance cuts, overtime pay additions, and discrepancy resolver.
  - `/payroll/simulation`: Pre-payroll calculation simulator with search, breakdown drawers, and export capabilities.
- **Testing & Quality:**
  - Integration tests for attendance cutoff ingestion, calendar and working day proration, overtime pay aggregation, and simulation accuracy.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.10.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V11 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V11**
  - Create `payroll_periods`, `payroll_attendance_cutoffs`, `payroll_prorations`, and `payroll_simulations` tables.
  - Add composite unique indexes on `payroll_attendance_cutoffs(payroll_period_id, employee_id)`.
- [x] **Checkpoint 1:** Flyway migration V11 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `PayrollPeriod`, `PayrollAttendanceCutoff`, `PayrollProration`, `PayrollSimulation` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response records for payroll periods, cutoff summaries, and simulations.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Simulation Engine (Days 5–7)
- [x] **Task 3.1: Payroll Period Management**
  - `PayrollPeriodService`: Lifecycle states, cutoff validation.
- [x] **Task 3.2: Attendance Integration & Proration Service**
  - `PayrollAttendanceIntegrationService`: Ingests locked monthly attendance recaps, computes late penalties, unpaid leave cuts, and overtime earnings.
  - `PayrollProrationService`: Calculates pro-rated basic pay based on hire/termination dates.
- [x] **Task 3.3: Pre-Payroll Simulation Service**
  - `PayrollSimulationService`: Consolidates gross pay, allowances, overtime, and attendance deductions.
- [x] **Task 3.4: REST Controllers**
  - `PayrollPeriodController`, `PayrollAttendanceIntegrationController`, `PayrollSimulationController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Pre-Payroll Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and Axios calls for payroll periods, cutoffs, and pre-payroll simulations.
- [x] **Task 4.2: Period Management & Attendance Integration Views**
  - Cycle status banner, attendance ingestion trigger button, and discrepancy table.
- [x] **Task 4.3: Simulation Dashboard**
  - High-level KPI summary cards (Total Gross Pay, Overtime Disbursal, Attendance Deductions) and itemized calculation modal.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.10.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 10 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Period Management** | Pay periods enforce non-overlapping date intervals and strict cutoff dates. | Integration tests |
| **AC-02** | **Attendance Deductions** | Absent days and unpaid leaves deduct accurate daily fractions from salary. | Integration tests |
| **AC-03** | **Overtime Ingestion** | Approved overtime hours are ingested and translated to gross earnings via base hourly rates. | Integration tests |
| **AC-04** | **Proration Logic** | Mid-month joiners receive correctly prorated basic salary based on active workdays. | Integration tests |
| **AC-05** | **Pre-Payroll Simulation**| Simulation correctly aggregates gross salary, deductions, and highlights discrepancies. | Integration tests & UI |
| **AC-06** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
