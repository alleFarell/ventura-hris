# Sprint 13: Benefits Administration, Social Security (BPJS / National Schemes)

## 1. Sprint Overview

- **Sprint Number:** Sprint 13
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-03-01 to 2027-03-14 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-03-01
  - **End Date:** 2027-03-14
- **Target Phase:** Phase 3 – Compensation, Benefits & Payroll Engine (Sprint 5 of Phase 3 - Concluding Phase 3)
- **Primary Domains:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Statutory Social Security Framework:** Configure social security programs (BPJS Ketenagakerjaan: JKK, JKM, JHT, JP; BPJS Kesehatan) with employer and employee percentage splits and wage ceilings.
2. **Employee Benefit Plans:** Create supplementary benefit plans (Corporate Health Insurance, Optical, Dental, Wellness Allowance) with annual allowances and eligibility rules.
3. **Benefit Enrollment & Claims Engine:** Enable employee enrollment, claim submission, balance tracking, and review workflows.
4. **Social Security Reporting:** Aggregate monthly statutory contributions for regulatory filing and compliance reporting.
5. **Interactive Benefits Portal:** Next.js views for BPJS configuration, company benefit plans, employee claim submissions, and claims administration.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V14__create_benefits_and_social_security_tables.sql`:
    - Table `bpjs_configurations`: ID, program_type (`BPJS_KESEHATAN`, `BPJS_TK_JKK`, `BPJS_TK_JKM`, `BPJS_TK_JHT`, `BPJS_TK_JP`), employer_rate, employee_rate, wage_ceiling, active.
    - Table `employee_bpjs_enrollments`: ID, employee_id, bpjs_kes_number, bpjs_tk_number, jkk_risk_grade, is_active.
    - Table `benefit_plans`: ID, code, name, category (`HEALTH_INSURANCE`, `DENTAL`, `OPTICAL`, `WELLNESS`), annual_limit, description, is_active.
    - Table `employee_benefit_claims`: ID, employee_id, benefit_plan_id, claim_number, claim_date, amount, description, receipt_url, status (`SUBMITTED`, `APPROVED`, `REJECTED`, `PAID`).
- **Backend Services & APIs:**
  - BPJS Config: `GET /api/v1/payroll/bpjs`, `PUT /api/v1/payroll/bpjs/{id}`.
  - Benefit Plans: `GET /api/v1/payroll/benefits/plans`, `POST /api/v1/payroll/benefits/plans`.
  - Claims: `GET /api/v1/payroll/benefits/claims`, `POST /api/v1/payroll/benefits/claims`, `PUT /api/v1/payroll/benefits/claims/{id}/status`.
- **Frontend Applications & Views:**
  - `/payroll/bpjs`: BPJS statutory configuration and monthly contribution reports.
  - `/payroll/benefits`: Corporate benefit plans catalog and claims management console.
- **Testing & Quality:**
  - Integration tests for BPJS calculation rates, benefit plan creation, and claims reimbursement limits.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.13.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V14 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V14**
  - Create `bpjs_configurations`, `employee_bpjs_enrollments`, `benefit_plans`, and `employee_benefit_claims` tables.
  - Seed Indonesian BPJS statutory contribution standard rates.
- [x] **Checkpoint 1:** Flyway migration V14 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `BpjsConfiguration`, `EmployeeBpjsEnrollment`, `BenefitPlan`, `EmployeeBenefitClaim` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Calculations (Days 5–7)
- [x] **Task 3.1: BPJS Calculation Service**
  - `BpjsService`: Rate lookups, wage ceiling caps, and employer/employee share calculation.
- [x] **Task 3.2: Benefit Plan & Claims Service**
  - `BenefitPlanService`: Plan definitions and annual quota validations.
  - `BenefitClaimService`: Claim submission, review workflow, and payout approvals.
- [x] **Task 3.3: REST Controllers**
  - `BpjsController` and `BenefitPlanController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for BPJS and benefits.
- [x] **Task 4.2: BPJS & Benefit Views**
  - `/payroll/bpjs` and `/payroll/benefits`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.13.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 13 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **BPJS Splits** | BPJS calculations strictly adhere to employer vs employee statutory splits and wage caps. | Integration tests |
| **AC-02** | **Benefit Limits** | Claims exceeding available plan annual balances are prevented. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
