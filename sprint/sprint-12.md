# Sprint 12: Payslip Generation, Bank Transfer Disbursal Formats & Reporting

## 1. Sprint Overview

- **Sprint Number:** Sprint 12
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-02-15 to 2027-02-28 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-02-15
  - **End Date:** 2027-02-28
- **Target Phase:** Phase 3 – Compensation, Benefits & Payroll Engine (Sprint 4 of Phase 3)
- **Primary Domains:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Digital Payslip Generation:** Generate formatted payslip documents with line-item breakdowns (earnings, allowances, overtime, tax withholdings, attendance/loan deductions, net payout).
2. **Employee Self-Service Payslip Access:** Allow employees to inspect and download historical payslips via a secure self-service portal.
3. **Banking Disbursal Exporters:** Generate standard banking bulk transfer files for Indonesian and regional clearing networks (e.g. BCA Payroll CSV/TXT, Mandiri MCM, Generic Bank Transfer format).
4. **Disbursal Batch Lifecycle:** Manage disbursal batches (`DRAFT`, `EXPORTED`, `DISBURSED`) with tracking of reference numbers and payment verification.
5. **Interactive Payslip & Disbursal Hub:** Next.js interfaces for HR disbursal file generation, payslip distribution, and employee self-service payslip viewer.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V13__create_payslip_and_disbursal_tables.sql`:
    - Table `payslips`: ID, payroll_run_item_id, employee_id, payslip_number, period_name, issue_date, gross_salary, total_deductions, net_salary, payslip_data_json, is_published.
    - Table `bank_disbursal_batches`: ID, payroll_run_id, batch_number, bank_code (`BCA`, `MANDIRI`, `BRI`, `BNI`, `GENERIC`), total_amount, total_records, status (`PENDING`, `GENERATED`, `DISBURSED`), generated_at.
    - Table `bank_disbursal_items`: ID, batch_id, employee_id, bank_name, account_number, account_holder, amount, status (`PENDING`, `PROCESSED`, `FAILED`).
- **Backend Services & APIs:**
  - Payslips: `GET /api/v1/payroll/payslips`, `GET /api/v1/payroll/payslips/{id}`, `GET /api/v1/payroll/payslips/my-payslips`, `POST /api/v1/payroll/payslips/publish/{payrollRunId}`.
  - Bank Disbursal: `GET /api/v1/payroll/disbursals`, `POST /api/v1/payroll/disbursals/generate`, `GET /api/v1/payroll/disbursals/{id}/download`, `PUT /api/v1/payroll/disbursals/{id}/status`.
- **Frontend Applications & Views:**
  - `/payroll/payslips`: Admin payslip distribution and publication center.
  - `/payroll/disbursals`: Bank disbursal batch generator and file exporter (BCA/Mandiri/CSV).
  - `/payroll/my-payslips`: Employee self-service payslip history and itemized breakdown viewer.
- **Testing & Quality:**
  - Integration tests for payslip publication, security authorization, and bank transfer export batch creation.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.12.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V13 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V13**
  - Create `payslips`, `bank_disbursal_batches`, and `bank_disbursal_items` tables.
- [x] **Checkpoint 1:** Flyway migration V13 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `Payslip`, `BankDisbursalBatch`, `BankDisbursalItem` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Disbursal Generators (Days 5–7)
- [x] **Task 3.1: Payslip Generation Service**
  - `PayslipService`: Bulk generation from confirmed payroll runs, publishing to employee portal.
- [x] **Task 3.2: Bank Disbursal File Generator**
  - `BankDisbursalService`: Generates bank-compliant payment files and manages disbursal reconciliations.
- [x] **Task 3.3: REST Controllers**
  - `PayslipController` and `BankDisbursalController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and Axios calls for payslips and bank disbursal batches.
- [x] **Task 4.2: Admin Payslip & Disbursal Views**
  - `/payroll/payslips` and `/payroll/disbursals`.
- [x] **Task 4.3: Self-Service Payslip Portal**
  - `/payroll/my-payslips` with print/download view.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.12.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 12 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Payslip Generation** | Payslips are generated accurately from confirmed payroll runs with unique tracking numbers. | Integration tests |
| **AC-02** | **Self-Service Security**| Employees can only retrieve their own payslips; HR admins can view all payslips. | Integration tests |
| **AC-03** | **Bank Export Formatting**| Disbursal exporter generates structured banking records with account validation. | Integration tests |
| **AC-04** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
