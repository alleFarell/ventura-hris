# Sprint 9: Salary Components, Tax Structures & Grade Pay Scales

## 1. Sprint Overview

- **Sprint Number:** Sprint 9
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-01-04 to 2027-01-17 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-01-04
  - **End Date:** 2027-01-17
- **Target Phase:** Phase 3 – Compensation, Benefits & Payroll Engine (Sprint 1 of Phase 3)
- **Primary Domains:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll), [features/Organization](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Organization)

---

## 2. Sprint Goals

1. **Salary Component Catalog:** Model modular earnings and deduction components (Basic Salary, Transport Allowance, Meal Allowance, Position Allowance, BPJS Employee/Company Shares, Tax Deductions).
2. **Salary Structures & Grade Scales:** Bind salary components to organizational job grades/levels with minimum, midpoint, and maximum compensation ranges.
3. **Employee Compensation Profiles:** Assign individual baseline salary packages with effective dating, history tracking, and currency formatting.
4. **Statutory Tax & Social Security Configuration:** Centralize progressive income tax tables (e.g. standard progressive brackets, PTKP non-taxable allowances) and statutory social security percentage rates.
5. **Interactive Compensation Portal:** Build Next.js configuration views for Salary Components, Grade Scale matrices, Tax parameters, and Employee Compensation profile inspector.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V10__create_salary_components_and_tax_tables.sql`:
    - Table `salary_components`: Code, name, type (`EARNING_FIXED`, `EARNING_VARIABLE`, `DEDUCTION_FIXED`, `DEDUCTION_VARIABLE`, `BENEFIT_IN_KIND`), is_taxable, is_bpjs_applicable, default_amount, active flag.
    - Table `salary_structures`: Job grade ID, min_salary, midpoint_salary, max_salary.
    - Table `employee_salary_profiles`: Employee ID, basic_salary, effective_date, payment_method (`BANK_TRANSFER`, `CASH`), bank_name, bank_account_number, bank_account_holder, tax_status (`TK/0`, `K/0`, `K/1`, etc.).
    - Table `employee_salary_components`: Employee salary profile ID, component ID, override_amount.
    - Table `tax_configurations`: Tax year, bracket_order, min_taxable_income, max_taxable_income, tax_rate_percent.
- **Backend Services & APIs:**
  - Components: `GET /api/v1/payroll/components`, `POST /api/v1/payroll/components`, `PUT /api/v1/payroll/components/{id}`.
  - Grade Pay Scales: `GET /api/v1/payroll/structures`, `POST /api/v1/payroll/structures`.
  - Employee Compensation: `GET /api/v1/payroll/compensation/{employeeId}`, `PUT /api/v1/payroll/compensation/{employeeId}`.
  - Tax Tables: `GET /api/v1/payroll/tax-config`, `PUT /api/v1/payroll/tax-config`.
- **Frontend Applications & Views:**
  - `/payroll/components`: Catalog management for earnings and deduction components.
  - `/payroll/structures`: Pay grade matrix builder with min/mid/max visualization.
  - `/payroll/tax-config`: Progressive tax bracket tables and PTKP reference matrix.
  - `/employees/[id]` (Compensation Tab): Employee salary profile editor with bank account information.
- **Testing & Quality:**
  - Integration tests for salary component creation, employee compensation assignment, grade salary boundary validation, and tax bracket resolution.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.9.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V10 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V10**
  - Create `salary_components`, `salary_structures`, `employee_salary_profiles`, `employee_salary_components`, and `tax_configurations` tables.
  - Seed standard salary components (Basic Salary, Transport Allowance, Meal Allowance, Overtime Pay, PPh21 Tax, BPJS Ketenagakerjaan, BPJS Kesehatan).
  - Seed statutory progressive tax brackets and standard PTKP categories.
- [x] **Checkpoint 1:** Flyway migration V10 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `SalaryComponent`, `SalaryStructure`, `EmployeeSalaryProfile`, `EmployeeSalaryComponent`, `TaxConfiguration` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and DTOs for salary setup and employee profiles.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Controllers (Days 5–7)
- [x] **Task 3.1: Compensation & Component Services**
  - `SalaryComponentService`: Component catalog rules, taxability tags.
  - `CompensationService`: Assign salary profiles, audit pay changes.
- [x] **Task 3.2: Tax Calculation Rules Engine**
  - `TaxConfigurationService`: Progressive bracket lookups and PTKP evaluation.
- [x] **Task 3.3: REST Controllers**
  - `SalaryComponentController`, `SalaryStructureController`, `EmployeeCompensationController`, `TaxConfigController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Payroll Configuration Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and Axios calls for payroll settings and employee compensation.
- [x] **Task 4.2: Salary Component & Structure Configuration Views**
  - Component list and drawer editor; Grade pay scale table.
- [x] **Task 4.3: Employee Profile Compensation Tab**
  - Interactive compensation card with bank details and custom component additions.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.9.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 9 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Component Rules** | Components can be configured with taxability and BPJS eligibility flags. | Integration tests |
| **AC-02** | **Salary Profiles** | Employee basic salary and customized allowances are securely persisted and auditable. | Integration tests |
| **AC-03** | **Grade Validation** | Warnings/guards trigger if employee basic salary falls outside job grade min/max boundaries. | Integration tests |
| **AC-04** | **Tax Configuration** | Progressive tax brackets correctly compute annualized taxable bands. | Integration tests |
| **AC-05** | **UI Usability** | HR can configure components and assign employee compensation smoothly. | UI validation |
| **AC-06** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
