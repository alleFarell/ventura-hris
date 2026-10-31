# Sprint 8: Overtime, Timesheets, WFH & Attendance Sign-Off

## 1. Sprint Overview

- **Sprint Number:** Sprint 8
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-12-21 to 2027-01-03 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-12-21
  - **End Date:** 2027-01-03
- **Target Phase:** Phase 2 – Time, Attendance & Leave Management (Final Sprint of Phase 2)
- **Primary Domains:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance), [features/Workflow](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Workflow)

---

## 2. Sprint Goals

1. **Work-From-Home (WFH) Management:** Configurable WFH allowances, application submission, geofence bypass authorization, and manager approval tracking.
2. **Overtime (OT) Calculation Engine:** Support pre-approval and post-shift overtime requests, statutory multiplier calculation tiers (e.g. 1.5x first hour, 2.0x subsequent hours on workdays; 2.0x - 3.0x on rest/holidays).
3. **Timesheet Submission & Verification:** Weekly/monthly employee timesheet review, manager sign-off, and discrepancy flags.
4. **Monthly Attendance Sign-Off Portal:** Centralized monthly attendance cutoff recap (Total workdays, Present, Late minutes, Early leaves, Overtime hours, Unpaid leaves) locked and signed off for payroll handoff.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V9__create_overtime_wfh_timesheet_tables.sql`:
    - Table `wfh_requests`: Employee ID, date, reason, approval status, manager comment.
    - Table `overtime_requests`: Employee ID, date, start time, end time, calculated overtime hours, multiplier rate, status (`SUBMITTED`, `APPROVED`, `REJECTED`), compensation type (`PAID`, `TIME_OFF_IN_LIEU`).
    - Table `monthly_attendance_recaps`: Employee ID, period_year, period_month, total_days_present, total_days_absent, total_late_minutes, total_overtime_hours, total_unpaid_leave_days, status (`DRAFT`, `VERIFIED`, `LOCKED_FOR_PAYROLL`).
- **Backend Services & APIs:**
  - WFH: `GET /api/v1/attendance/wfh`, `POST /api/v1/attendance/wfh`, `PUT /api/v1/attendance/wfh/{id}/status`.
  - Overtime: `GET /api/v1/attendance/overtime`, `POST /api/v1/attendance/overtime`, `PUT /api/v1/attendance/overtime/{id}/approve`.
  - Monthly Recap: `GET /api/v1/attendance/recaps`, `POST /api/v1/attendance/recaps/generate`, `PUT /api/v1/attendance/recaps/lock`.
- **Frontend Applications & Views:**
  - `/attendance/wfh`: WFH submission dialog and manager approval cards.
  - `/attendance/overtime`: Overtime request filing with dynamic multiplier calculator preview.
  - `/attendance/monthly-recap`: HR attendance recap dashboard with bulk sign-off and lock mechanism for payroll.
- **Testing & Quality:**
  - Integration tests for WFH approval bypass, statutory overtime multiplier tiered formulas, and monthly recap aggregation with locking protection.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.8.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V9 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V9**
  - Create `wfh_requests`, `overtime_requests`, and `monthly_attendance_recaps` tables.
  - Add composite unique index on `monthly_attendance_recaps(employee_id, period_year, period_month)`.
- [x] **Checkpoint 1:** Flyway migration V9 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `WfhRequest`, `OvertimeRequest`, `MonthlyAttendanceRecap` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement `WfhRequestRepository`, `OvertimeRequestRepository`, `MonthlyAttendanceRecapRepository`.
  - Implement request and response DTOs for WFH, Overtime, and Monthly recap sign-offs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Controllers (Days 5–7)
- [x] **Task 3.1: WFH & Overtime Services**
  - `WfhService`: Allowance quota enforcement, date conflict checks.
  - `OvertimeService`: Statutory rate multiplier logic (regular day vs holiday/weekend tiers).
- [x] **Task 3.2: Monthly Attendance Recap Aggregator**
  - `AttendanceRecapService`: Aggregates daily attendance records, approved leaves, and overtime for a target month; locks data for payroll export.
- [x] **Task 3.3: REST Controllers**
  - `WfhController`, `OvertimeController`, `AttendanceRecapController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Overtime, WFH & Recap Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - Overtime and WFH TypeScript types, Axios methods.
- [x] **Task 4.2: Overtime & WFH Pages**
  - Request forms with live multiplier preview and approval list.
- [x] **Task 4.3: Monthly Attendance Recap Portal**
  - High-density table summarizing employee monthly time metrics with one-click "Lock for Payroll".
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.8.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 8 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **WFH Validation** | Approved WFH requests permit clock-in from remote IP/locations without geofence penalties. | Integration tests |
| **AC-02** | **Overtime Multiplier** | Overtime hours calculate statutory tiered multipliers accurately. | Integration tests |
| **AC-03** | **Recap Aggregation** | Monthly recap correctly sums present days, late minutes, overtime hours, and unpaid leave days. | Integration tests |
| **AC-04** | **Payroll Lock** | Locked recaps become immutable and cannot be altered by daily punch modifications. | Integration tests |
| **AC-05** | **UI Usability** | HR can review and lock all employee recaps in bulk. | UI validation |
| **AC-06** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
