# Ventura HRIS Roadmap

## 1. Executive Summary & Vision

Ventura HRIS is an enterprise-grade, architecture-first Human Resource Information System built for SMEs with progressive scaling to large enterprise organizations. 

The platform adheres to an uncompromising delivery lifecycle:
1. **Analyze Feature Requirements** (Business, Functional, Non-Functional)
2. **Architecture & Design** (Business Rules, Normalized DB Design, ERD, OpenAPI Contracts, UI/UX Flows, Sequence Diagrams)
3. **Architecture Review & Gate Approval**
4. **Implementation & Test Coverage** (Backend clean architecture + Next.js feature modules)
5. **Release & Audit Verification**

---

## 2. Multi-Phase Roadmap Overview

```
Phase 1: Foundation & Core HR (Sprints 1 - 4)
  ├── Sprint 1: Architecture Baseline, Auth & Tenant/Company Setup
  ├── Sprint 2: Organization Hierarchy & Job Structures
  ├── Sprint 3: Employee Master Data, Documents & Profile Management
  └── Sprint 4: Role-Based Access Control (RBAC), Audit Trails & Notification Engine

Phase 2: Time, Attendance & Leave Management (Sprints 5 - 8)
  ├── Sprint 5: Shift Scheduling, Calendar & Policy Engine
  ├── Sprint 6: Daily Attendance Tracking, Geofencing & Biometrics / Clock-in
  ├── Sprint 7: Leave Management & Time-Off Approvals
  └── Sprint 8: Overtime, Timesheets, WFH & Attendance Approvals

Phase 3: Compensation, Benefits & Payroll Engine (Sprints 9 - 13)
  ├── Sprint 9: Salary Components, Tax Structures (PPh21 / Standard) & Grade Scales
  ├── Sprint 10: Attendance & Leave Integration into Payroll Calculations
  ├── Sprint 11: Payroll Processing Engine, Deductions, Loans & Reimbursements
  ├── Sprint 12: Payslip Generation, Bank Transfer Disbursal Formats & Reporting
  └── Sprint 13: Benefits Administration, Social Security (BPJS / National Schemes)

Phase 4: Talent Acquisition & Performance Management (Sprints 14 - 17)
  ├── Sprint 14: Job Requisitions, Postings & Applicant Tracking System (ATS)
  ├── Sprint 15: Interview Scheduling, Candidate Evaluation & Job Offer Letters
  ├── Sprint 16: Goal Setting (OKRs / KPIs) & Performance Review Cycles
  └── Sprint 17: 360-Degree Feedback, Appraisals & Competency Matrix

Phase 5: Employee Development, Assets & Offboarding (Sprints 18 - 20)
  ├── Sprint 18: Training Catalog, Course Management & Certifications
  ├── Sprint 19: Company Asset Inventory, Allocation & Tracking
  └── Sprint 20: Offboarding, Asset Returns, Resignation Workflows & Exit Interviews

Phase 6: Advanced Analytics, Reporting & AI Capabilities (Sprints 21 - 24)
  ├── Sprint 21: Executive Dashboards, Headcount & Turnover Metrics
  ├── Sprint 22: Compliance Reporting, Custom Report Builder & Data Export
  ├── Sprint 23: AI-Assisted HR Workflows (MCP Tools, RAG HR Policy Assistant)
  └── Sprint 24: Intelligent Resume Screening & AI Performance Insights
```

---

## 3. Detailed Phase Breakdown

### Phase 1: Foundation & Core HR (Target: Sprints 1 – 4)
*Objective: Build an immutable foundation, multi-branch company setup, organizational hierarchy, master employee registry, and secure authentication framework.*

#### Sprint 1: Architecture Baseline, Authentication & Tenant/Company Setup
- **Domain:** [features/Setup](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Setup) & Shared Infrastructure
- **Deliverables:**
  - Database schema & Flyway migrations for `companies`, `branches`, `system_configurations`.
  - Spring Security JWT-based authentication & session handling.
  - Setup APIs for company profile, branch management, localization parameters.
  - Next.js Admin shell, authentication pages (Login/Forgot Password), and Setup wizard UI.

#### Sprint 2: Organization Hierarchy & Job Structures
- **Domain:** [features/Organization](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Organization)
- **Deliverables:**
  - Database schema for `departments`, `divisions`, `positions`, `job_grades`, `job_levels`.
  - Nested hierarchy tree management (parent-child relationships, department heads).
  - Position budget/headcount allocation tracking.
  - Interactive Organization Chart UI in Next.js.

#### Sprint 3: Employee Master Data & Profile Management
- **Domain:** [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)
- **Deliverables:**
  - Database schema for `employees`, `employee_identities`, `employment_histories`, `emergency_contacts`, `employee_documents`.
  - Dynamic employee ID sequence generator per company/branch.
  - Employee status lifecycle (Probation, Permanent, Contract, Suspended, Terminated).
  - Employee directory with multi-criteria filtering, search, and tabbed profile editing interface.

#### Sprint 4: Role-Based Access Control (RBAC), Audit & Notifications
- **Domain:** [features/Settings](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Settings) & [features/Workflow](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Workflow)
- **Deliverables:**
  - Granular RBAC: Roles, Permissions, User Role mappings.
  - Centralized audit logging table and event interceptors (`AuditLog`).
  - In-app notification center and email notification dispatchers.

---

### Phase 2: Time, Attendance & Leave Management (Target: Sprints 5 – 8)
*Objective: Automate time tracking, shift scheduling, clock-in validations, and leave management.*

#### Sprint 5: Shift Scheduling, Calendar & Policy Engine
- **Domain:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance)
- **Deliverables:**
  - Shift definitions (Flexible, Fixed, Rotating, Night Shifts, Grace Periods).
  - Employee roster assignment and company holiday calendars.

#### Sprint 6: Daily Attendance Tracking & Clock-In Engine
- **Domain:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance)
- **Deliverables:**
  - Clock-in/Clock-out API with geolocation verification (radius geofencing) and IP restriction.
  - Biometric device log import integration.
  - Daily attendance calculation worker (late arrivals, early departure, absent status).

#### Sprint 7: Leave Management & Time-Off Approvals
- **Domain:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance) & [features/Workflow](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Workflow)
- **Deliverables:**
  - Leave types (Annual, Sick with medical cert, Maternity, Unpaid, Bereavement).
  - Leave entitlement quotas, accruals, carry-over rules.
  - Multi-tier approval workflows (Supervisor -> HR).

#### Sprint 8: Overtime, Timesheets, WFH & Final Verification
- **Domain:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance)
- **Deliverables:**
  - Work-From-Home (WFH) requests and approvals.
  - Overtime (OT) pre-approval and calculation multipliers (statutory compliant).
  - Monthly attendance recap sign-off ready for payroll processing.

---

### Phase 3: Compensation, Benefits & Payroll Engine (Target: Sprints 9 – 13)
*Objective: Deliver an accurate, compliant payroll engine supporting taxes, deductions, allowances, and direct disbursement generation.*

#### Sprint 9: Salary Structure & Tax Configuration
- **Domain:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll)
- **Deliverables:**
  - Salary component configuration (Base pay, fixed allowances, variable allowances, deductions).
  - Statutory tax brackets and contribution rate rules (e.g. income tax, social security schemes).

#### Sprint 10: Attendance & Deduction Integration
- **Domain:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll)
- **Deliverables:**
  - Ingestion pipeline for monthly attendance cuts, unpaid leaves, and approved overtime hours.
  - Proration logic for mid-month hires and exits.

#### Sprint 11: Payroll Processing Engine & Adjustments
- **Domain:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll)
- **Deliverables:**
  - Batch payroll computation engine (atomic calculation runs per pay period).
  - Employee loan deductions, reimbursement approvals, and bonus distributions.
  - Payroll freeze and recalculation mechanism.

#### Sprint 12: Payslip Generation & Bank Disbursal Files
- **Domain:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll)
- **Deliverables:**
  - Automated PDF payslip generator with password-protection.
  - Bank transfer file exporter (BCA, Mandiri, generic CSV/TXT banking formats).
  - Employee self-service payslip download portal.

#### Sprint 13: Benefits Administration & Social Security Filings
- **Domain:** [features/Payroll](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Payroll)
- **Deliverables:**
  - Health and employment social security calculations and export reports.
  - Company medical benefits balance tracking.

---

### Phase 4: Talent Acquisition & Performance Management (Target: Sprints 14 – 17)
*Objective: Streamline recruitment from job opening to offer letter, and support continuous performance appraisals.*

#### Sprint 14: Job Requisition & Applicant Tracking System (ATS)
- **Domain:** [features/Recruitment](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Recruitment)
- **Deliverables:**
  - Headcount job requisition request and approval.
  - Job vacancy posting engine.
  - Candidate pipeline stages (Applied, Screening, Interview, Offered, Hired, Rejected).

#### Sprint 15: Interview Scheduling & Offer Generation
- **Domain:** [features/Recruitment](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Recruitment)
- **Deliverables:**
  - Interview scheduling, panel scorecards, and candidate feedback forms.
  - Offer letter generation from template and e-signature tracking.
  - One-click convert applicant to employee record upon acceptance.

#### Sprint 16: Goal Setting (OKRs / KPIs) & Review Cycles
- **Domain:** [features/Performance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Performance)
- **Deliverables:**
  - Organization, department, and individual goal cascading.
  - Configurable appraisal periods (Annual, Semi-annual, Quarterly).

#### Sprint 17: 360-Degree Feedback & Appraisals
- **Domain:** [features/Performance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Performance)
- **Deliverables:**
  - Self-appraisal, peer evaluation, and manager evaluation forms.
  - Rating calibration and promotion/bonus recommendations.

---

### Phase 5: Employee Development, Assets & Offboarding (Target: Sprints 18 – 20)
*Objective: Manage company equipment lifecycle, skills development, and employee departure workflows.*

#### Sprint 18: Training & Certification Management
- **Domain:** [features/Training](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Training)
- **Deliverables:**
  - Training course catalog, provider management, and enrollment.
  - Employee skill matrix, license/certification expiration alerts.

#### Sprint 19: Asset Inventory & Allocation
- **Domain:** [features/Assets](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Assets)
- **Deliverables:**
  - Asset inventory tracking (Laptops, SIM cards, vehicles, keycards) with serial numbers.
  - Handover and return protocol with digital handover acknowledgment slips.

#### Sprint 20: Offboarding & Exit Management
- **Domain:** [features/Workflow](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Workflow) & [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)
- **Deliverables:**
  - Resignation submission, notice period calculation, and clearance checklist (IT, Asset, Finance, HR).
  - Exit interview survey recording.
  - Automated access revocation trigger and archive processing.

---

### Phase 6: Advanced Analytics, Reporting & AI Capabilities (Target: Sprints 21 – 24)
*Objective: Deliver executive decision support, compliance reports, and agentic AI features.*

#### Sprint 21: Executive Dashboard & People Analytics
- **Domain:** [features/Analytics](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Analytics)
- **Deliverables:**
  - Interactive dashboards: Headcount demographics, attrition rates, gender distribution.
  - Departmental overtime and absenteeism heatmaps.

#### Sprint 22: Compliance & Custom Report Builder
- **Domain:** [features/Analytics](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Analytics)
- **Deliverables:**
  - Regulatory report generators (Statutory workforce filings).
  - Ad-hoc tabular report builder with custom column selection and CSV/XLSX/PDF export.

#### Sprint 23: AI-Assisted HR Policy & Employee Assistant (MCP-enabled)
- **Domain:** Architecture AI layer & [features/Setup](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Setup)
- **Deliverables:**
  - Vector search / RAG implementation on company employee handbooks and HR policies.
  - MCP server tool endpoints for self-service leave balance lookup and company policy queries.

#### Sprint 24: AI Resume Screening & Smart Performance Summarizer
- **Domain:** Architecture AI layer & [features/Recruitment](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Recruitment)
- **Deliverables:**
  - Automatic resume extraction and requirement match scoring against job requisitions.
  - AI synthesis of peer reviews and 360-degree feedback for annual appraisals.

---

## 4. Governance & Architecture Review Gates

Before any sprint transitions from design to code implementation, the **7-Gate Architecture Checklist** must be fulfilled:
1. **Gate 1 - Requirements Approval:** Business scope, functional user stories, non-functional criteria.
2. **Gate 2 - Business Rules Approval:** Domain validations, transition constraints, permission matrices.
3. **Gate 3 - Database Review:** Third-normal-form (3NF) relational design, audit columns, indexes, foreign keys.
4. **Gate 4 - API Contract Review:** OpenAPI 3.0 specification with complete error models (`ApiResponse`, `ApiError`).
5. **Gate 5 - Frontend UI/UX Review:** Component breakdown, loading/error states, responsive layout plan.
6. **Gate 6 - Architecture Sign-Off:** Modular monolith boundaries respected, no direct vendor LLM coupling.
7. **Gate 7 - Implementation Task Approval:** Granular task tickets with checkpoints and test criteria.
