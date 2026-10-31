# Sprint 7: Leave Management & Time-Off Approvals

## 1. Sprint Overview

- **Sprint Number:** Sprint 7
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-12-07 to 2026-12-20 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-12-07
  - **End Date:** 2026-12-20
- **Target Phase:** Phase 2 – Time, Attendance & Leave Management (Sprint 3 of Phase 2)
- **Primary Domains:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance), [features/Workflow](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Workflow)

---

## 2. Sprint Goals

1. **Leave Policy & Entitlement Engine:** Define leave categories (Annual, Sick with medical slip, Maternity/Paternity, Unpaid, Bereavement, Marriage) with quota allocations, prorated accruals, and carry-over expiration limits.
2. **Employee Leave Balance Ledger:** Track entitlement allocations, used days, pending days, and remaining balances per employee per year with immutable ledger transactions.
3. **Multi-Tier Leave Approval Workflow:** Implement configurable approval chains (Direct Manager -> Department Head -> HR Administrator) with email and in-app notifications.
4. **Interactive Leave Portal:** Deliver employee self-service leave balance widgets, leave application dialog with document attachment support, manager approval inbox, and team leave calendar in Next.js.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V8__create_leave_management_tables.sql`:
    - Table `leave_types`: Code, name, default quota, is_paid, requires_attachment, max_consecutive_days, carry_forward_allowed, max_carry_forward.
    - Table `leave_balances`: Employee ID, leave type ID, year, total quota, carried_over, used, pending.
    - Table `leave_requests`: Employee ID, leave type ID, start date, end date, total days, reason, attachment_id, status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
    - Table `leave_approvals`: Request ID, approver ID, step order, status, comments, actioned_at.
- **Backend Services & APIs:**
  - Leave Types: `GET /api/v1/leave/types`, `POST /api/v1/leave/types`, `PUT /api/v1/leave/types/{id}`.
  - Balances: `GET /api/v1/leave/balances/my`, `GET /api/v1/leave/balances/employee/{id}`, `POST /api/v1/leave/balances/adjust`.
  - Requests: `GET /api/v1/leave/requests`, `POST /api/v1/leave/requests`, `PUT /api/v1/leave/requests/{id}/cancel`.
  - Approvals: `GET /api/v1/leave/approvals/inbox`, `POST /api/v1/leave/approvals/{id}/approve`, `POST /api/v1/leave/approvals/{id}/reject`.
- **Frontend Applications & Views:**
  - `/leave/my-leave`: Employee balance dashboard with quota visual progress bars, request history, and leave apply modal.
  - `/leave/approvals`: Manager approval inbox with single-click approve/reject actions and comment dialog.
  - `/leave/calendar`: Organization/department calendar displaying team time-off schedules.
  - `/leave/settings`: HR configuration for leave types and annual quota rules.
- **Testing & Quality:**
  - Integration tests for leave balance deduction, concurrent request quota exhaustion protection, multi-tier approval state transitions, and cancellation balance restorations.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.7.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V8 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V8**
  - Create `leave_types`, `leave_balances`, `leave_requests`, and `leave_approvals` tables.
  - Add indexes on `leave_balances(employee_id, year)` and `leave_requests(employee_id, status)`.
  - Seed default leave types (Annual 12 days, Sick Leave, Maternity 90 days, Marriage 3 days, Bereavement 2 days, Unpaid Leave).
- [x] **Checkpoint 1:** Flyway migration V8 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `LeaveType`, `LeaveBalance`, `LeaveRequest`, and `LeaveApproval` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement `LeaveTypeRepository`, `LeaveBalanceRepository`, `LeaveRequestRepository`, `LeaveApprovalRepository`.
  - Implement request and response DTOs for leave applications, approvals, and balance summaries.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Workflow Engine (Days 5–7)
- [x] **Task 3.1: Leave Balance & Quota Service**
  - `LeaveBalanceService`: Accruals, balance deduction, hold/pending allocation, and restoration upon rejection/cancellation.
- [x] **Task 3.2: Leave Request & Approval Workflow**
  - `LeaveRequestService`: Overlap validation, holiday/weekend day exclusion, workflow generation.
  - `LeaveApprovalService`: Multi-stage approval progression, notifications dispatch.
- [x] **Task 3.3: REST Controllers**
  - `LeaveController`, `LeaveApprovalController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Leave Management Views (Days 8–9)
- [x] **Task 4.1: Leave API Client & Types**
  - TypeScript interfaces for leave requests, quotas, and approvals.
- [x] **Task 4.2: Self-Service Leave Portal**
  - Balance cards with circular progress indicators and "Request Leave" dialog.
- [x] **Task 4.3: Manager Approval Inbox & Department Calendar**
  - Inbox with badge counters, request detail drawer, approval history timeline, and full calendar view.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.7.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 7 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Leave Balance Quotas** | Balances are checked before request submission; insufficient quota prevents submission. | Integration tests |
| **AC-02** | **Working Day Calculation** | Weekends and declared company holidays are excluded from leave duration count. | Integration tests |
| **AC-03** | **Approval Flow** | Multi-tier approval transitions requests from `PENDING` -> `APPROVED` or `REJECTED`. | Integration tests |
| **AC-04** | **Balance Restoration** | Rejected or cancelled leave requests immediately restore the employee's pending balance. | Integration tests |
| **AC-05** | **UI Usability** | Manager inbox allows review and one-click action with audit comment support. | UI validation |
| **AC-06** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
