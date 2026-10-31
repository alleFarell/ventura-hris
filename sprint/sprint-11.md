# Sprint 11: Payroll Processing Engine, Deductions, Loans & Reimbursements

## 1. Sprint Overview

- **Sprint Number:** Sprint 11
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-02-01 to 2027-02-14 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-02-01
  - **End Date:** 2027-02-14
- **Target Phase:** Phase 3 – Compensation, Benefits & Payroll Engine (Sprint 3 of Phase 3)
- **Primary Domains:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Atomic Batch Payroll Execution:** Implement the definitive payroll batch processing worker that locks a payroll period, resolves active employee compensations, incorporates attendance cutoffs, and persists final line-item calculations.
2. **Employee Loans & Installment Amortization:** Track company-issued cash loans, monthly amortization schedules, and automatic payroll deductions.
3. **Expense Reimbursement Workflow:** Handle business claims (travel, medical, operational expense) from submission, approval, to one-click inclusion into payroll earnings.
4. **Payroll Lock, Freeze & Re-Run Capabilities:** Enforce strict status lifecycle (`DRAFT` -> `PROCESSING` -> `REVIEW` -> `CONFIRMED` -> `FROZEN`) with rollback and re-calculation controls.
5. **Interactive Payroll Run Portal:** Provide Next.js consoles for launching payroll batch calculations, reviewing individual payslip line items, managing loan ledgers, and approving expense reimbursements.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V12__create_payroll_processing_and_adjustment_tables.sql`:
    - Table `payroll_runs`: ID, period_id, run_number, execution_date, total_gross_amount, total_deduction_amount, total_net_amount, total_employees, status (`DRAFT`, `PROCESSING`, `CONFIRMED`, `FROZEN`), approved_by, approved_at.
    - Table `payroll_run_items`: ID, payroll_run_id, employee_id, basic_salary, prorated_amount, allowances_amount, overtime_amount, reimbursement_amount, attendance_deduction_amount, loan_deduction_amount, tax_amount, net_salary, line_items_json.
    - Table `employee_loans`: ID, employee_id, loan_number, loan_amount, installment_count, monthly_installment, remaining_balance, start_date, status (`PENDING`, `ACTIVE`, `COMPLETED`, `WRITTEN_OFF`).
    - Table `employee_loan_installments`: ID, loan_id, payroll_run_id, installment_number, amount, payment_date, status (`SCHEDULED`, `PAID`, `DEFERRED`).
    - Table `employee_reimbursements`: ID, employee_id, payroll_run_id, claim_number, title, claim_type (`TRAVEL`, `MEDICAL`, `OFFICE`, `MEAL`), amount, receipt_url, status (`SUBMITTED`, `APPROVED`, `REJECTED`, `DISBURSED`).
- **Backend Services & APIs:**
  - Payroll Runs: `GET /api/v1/payroll/runs`, `POST /api/v1/payroll/runs/execute`, `GET /api/v1/payroll/runs/{id}`, `POST /api/v1/payroll/runs/{id}/confirm`, `POST /api/v1/payroll/runs/{id}/freeze`.
  - Loans: `GET /api/v1/payroll/loans`, `POST /api/v1/payroll/loans`, `GET /api/v1/payroll/loans/{id}`.
  - Reimbursements: `GET /api/v1/payroll/reimbursements`, `POST /api/v1/payroll/reimbursements`, `PUT /api/v1/payroll/reimbursements/{id}/approve`, `PUT /api/v1/payroll/reimbursements/{id}/reject`.
- **Frontend Applications & Views:**
  - `/payroll/runs`: Payroll run batch dashboard with run status indicator, batch execution trigger, and employee payslip table.
  - `/payroll/loans`: Employee loan register, loan application modal, and installment payment tracking.
  - `/payroll/reimbursements`: Expense reimbursement submission, receipt viewer, and manager approval board.
- **Testing & Quality:**
  - Integration tests for batch payroll calculation, loan deduction amortization, reimbursement integration, and payroll freezing.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.11.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V12 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V12**
  - Create `payroll_runs`, `payroll_run_items`, `employee_loans`, `employee_loan_installments`, and `employee_reimbursements` tables.
- [x] **Checkpoint 1:** Flyway migration V12 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `PayrollRun`, `PayrollRunItem`, `EmployeeLoan`, `EmployeeLoanInstallment`, `EmployeeReimbursement` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Processing Engine (Days 5–7)
- [x] **Task 3.1: Payroll Processing Service**
  - `PayrollProcessingService`: Executes batch calculation across all active employees, aggregating basic pay, overtime, attendance deductions, loan installments, approved reimbursements, and tax withholdings.
- [x] **Task 3.2: Loan & Reimbursement Services**
  - `EmployeeLoanService`: Schedule generation, amortization tracking.
  - `EmployeeReimbursementService`: Claim submission, review workflow, and inclusion into pending runs.
- [x] **Task 3.3: REST Controllers**
  - `PayrollRunController`, `EmployeeLoanController`, `EmployeeReimbursementController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Consoles (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript interfaces and client methods for payroll runs, loans, and reimbursements.
- [x] **Task 4.2: Payroll Batch Execution View**
  - `/payroll/runs`: Run wizard, progress state, and detailed breakdown drawer.
- [x] **Task 4.3: Loans and Reimbursements Management**
  - `/payroll/loans` and `/payroll/reimbursements`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.11.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 11 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Batch Execution** | Batch payroll run calculates and persists individual `PayrollRunItem` records with net pay = gross - deductions. | Integration tests |
| **AC-02** | **Loan Amortization** | Active loan installments are automatically deducted and amortized upon payroll run execution. | Integration tests |
| **AC-03** | **Reimbursement Payout** | Approved reimbursements are automatically bundled into earnings and marked `DISBURSED`. | Integration tests |
| **AC-04** | **Lifecycle Freeze** | Frozen payroll runs reject modifications or recalculations to guarantee audit compliance. | Integration tests |
| **AC-05** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
