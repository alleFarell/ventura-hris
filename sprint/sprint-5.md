# Sprint 5: Shift Scheduling, Calendar & Policy Engine

## 1. Sprint Overview

- **Sprint Number:** Sprint 5
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-11-09 to 2026-11-22 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-11-09
  - **End Date:** 2026-11-22
- **Target Phase:** Phase 2 – Time, Attendance & Leave Management (Sprint 1 of Phase 2)
- **Primary Domains:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance), [features/Setup](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Setup)

---

## 2. Sprint Goals

1. **Shift Definition & Work Schedule Engine:** Model flexible, fixed, rotating, and night shifts with configurable start/end times, break durations, and grace period thresholds for tardiness.
2. **Company & National Holiday Calendars:** Centralize national, religious, and company-specific holiday schedules with multi-branch holiday assignment and weekend override rules.
3. **Employee Shift Rostering & Patterns:** Enable automated and manual roster assignments, cyclical shift patterns (e.g. 5-2, 6-1, 2-2-2), and employee shift swaps/overrides with conflict detection.
4. **Interactive Shift & Calendar Portal:** Provide HR administrators and managers with an interactive weekly/monthly shift scheduling grid, holiday manager, and shift template builder in Next.js.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V6__create_shift_and_calendar_tables.sql`:
    - Table `shifts`: Shift code, name, start time, end time, break minutes, grace period minutes, overnight flag, active flag.
    - Table `shift_patterns`: Pre-defined recurring shift cycles (e.g. Day, Night, Off).
    - Table `roster_assignments`: Shift assigned per employee per date with status and override reason.
    - Table `company_holidays`: Holiday date, name, description, company/branch scoping, mandatory flag.
- **Backend Services & APIs:**
  - Shifts: `GET /api/v1/shifts`, `POST /api/v1/shifts`, `GET /api/v1/shifts/{id}`, `PUT /api/v1/shifts/{id}`, `DELETE /api/v1/shifts/{id}`.
  - Holidays: `GET /api/v1/holidays`, `POST /api/v1/holidays`, `PUT /api/v1/holidays/{id}`, `DELETE /api/v1/holidays/{id}`.
  - Roster: `GET /api/v1/roster`, `POST /api/v1/roster/assign`, `POST /api/v1/roster/bulk-pattern`, `DELETE /api/v1/roster/{id}`.
- **Frontend Applications & Views:**
  - `/attendance/shifts`: Shift template management, grace period and overnight shift configuration.
  - `/attendance/holidays`: Holiday calendar view and multi-branch holiday creator.
  - `/attendance/roster`: Interactive employee roster grid (weekly/monthly) with shift dropdown selector and bulk pattern applier.
  - Navigation updates in `AppShell` for the Attendance domain.
- **Testing & Quality:**
  - Integration tests for shift CRUD, roster pattern assignment, overnight shift boundary handling, and holiday conflict validation.
  - 100% test pass rate on backend and 0 build errors on Next.js frontend.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.5.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V6 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V6**
  - Create `shifts`, `shift_patterns`, `roster_assignments`, and `company_holidays` tables.
  - Add indexes on `roster_assignments(employee_id, shift_date)` and `company_holidays(holiday_date)`.
  - Seed standard shifts (Standard Office 08:00-17:00, Morning 07:00-15:00, Afternoon 15:00-23:00, Night 23:00-07:00).
- [x] **Checkpoint 1:** Flyway migration V6 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `Shift`, `ShiftPattern`, `RosterAssignment`, and `CompanyHoliday` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement `ShiftRepository`, `RosterAssignmentRepository`, `CompanyHolidayRepository`.
  - Implement request and response records for shifts, holidays, and roster assignments.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Controllers (Days 5–7)
- [x] **Task 3.1: Shift & Holiday Services**
  - `ShiftService`: CRUD, validation of time ranges and grace periods.
  - `HolidayService`: Holiday scheduling, branch filtering, conflict checks.
- [x] **Task 3.2: Rostering & Pattern Engine**
  - `RosterService`: Single and bulk employee schedule assignment, recurring pattern application, date range queries.
- [x] **Task 3.3: REST Controllers**
  - `ShiftController`, `HolidayController`, `RosterController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Attendance Scheduling Views (Days 8–9)
- [x] **Task 4.1: Attendance API Client & Types**
  - TypeScript types for shifts, holidays, roster entries, and Axios API client.
- [x] **Task 4.2: Shifts & Holiday Management Pages**
  - Shift configuration table and modal.
  - Holiday list and calendar view with branch assignment.
- [x] **Task 4.3: Roster Schedule Grid**
  - Interactive grid displaying employees as rows and dates as columns with shift badges.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.5.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 5 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Shift Configuration** | Shifts can be created with custom working hours, grace periods, and overnight support. | Integration tests |
| **AC-02** | **Holiday Calendars** | Company holidays prevent absent penalties on scheduled dates and support branch scoping. | Integration tests |
| **AC-03** | **Roster Assignment** | Rosters can be assigned per employee or batch-generated using cyclical shift patterns. | Integration tests |
| **AC-04** | **Schedule Queries** | Rosters are queryable by date range, department, and employee ID. | Integration tests |
| **AC-05** | **UI Usability** | Roster scheduling grid renders responsively with clear shift color coding. | UI validation |
| **AC-06** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
