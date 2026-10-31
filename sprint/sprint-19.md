# Sprint 19: Company Asset Inventory, Allocation & Tracking

## 1. Sprint Overview

- **Sprint Number:** Sprint 19
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2027-05-24 to 2027-06-06 (2 Weeks / 10 Working Days)
  - **Start Date:** 2027-05-24
  - **End Date:** 2027-06-06
- **Target Phase:** Phase 5 – Employee Development, Assets & Offboarding (Sprint 2 of Phase 5)
- **Primary Domains:** [features/Assets](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Assets), [features/Employee](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Employee)

---

## 2. Sprint Goals

1. **Asset Master Registry:** Catalog physical and digital assets (Laptops, Monitors, Phones, SIM cards, Vehicles, Software Licenses) with asset tags, serial numbers, and warranty details.
2. **Asset Allocation & Handover:** Manage custodian assignments to active employees with digital handover acknowledgment slips and condition grading (`EXCELLENT`, `GOOD`, `FAIR`, `DAMAGED`).
3. **Asset Maintenance & Return Tracking:** Schedule maintenance logs, repair history, and return processing upon role change or offboarding.
4. **Interactive Asset Manager:** Next.js views for inventory auditing, custodian assignments, and asset condition reporting.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V20__create_asset_inventory_and_allocations_tables.sql`:
    - Table `asset_categories`: ID, code, name, description.
    - Table `company_assets`: ID, asset_tag, serial_number, category_id, name, model, purchase_date, purchase_cost, status (`AVAILABLE`, `ALLOCATED`, `MAINTENANCE`, `DISPOSED`), condition_grade (`EXCELLENT`, `GOOD`, `FAIR`, `DAMAGED`).
    - Table `asset_allocations`: ID, asset_id, employee_id, allocated_date, return_date, handover_notes, return_notes, status (`ACTIVE`, `RETURNED`).
- **Backend Services & APIs:**
  - Categories & Assets: `GET /api/v1/assets/categories`, `POST /api/v1/assets/categories`, `GET /api/v1/assets`, `POST /api/v1/assets`, `GET /api/v1/assets/{id}`.
  - Allocations: `GET /api/v1/assets/allocations`, `POST /api/v1/assets/allocations`, `PUT /api/v1/assets/allocations/{id}/return`.
- **Frontend Applications & Views:**
  - `/assets`: Company asset inventory catalog with status chips and filters.
  - `/assets/allocations`: Custodian allocation registry and return processing modal.
- **Testing & Quality:**
  - Integration tests for unique asset tags, allocation status updates, and return flows.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.19.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V20 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V20**
  - Create `asset_categories`, `company_assets`, and `asset_allocations` tables.
- [x] **Checkpoint 1:** Flyway migration V20 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `AssetCategory`, `CompanyAsset`, `AssetAllocation` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement repositories and request/response DTOs.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Asset Engine (Days 5–7)
- [x] **Task 3.1: Asset Registry Service**
  - `CompanyAssetService`: Tag uniqueness and state transitions.
- [x] **Task 3.2: Allocation Service**
  - `AssetAllocationService`: Allocation to employee and release handling.
- [x] **Task 3.3: REST Controllers**
  - `AssetCategoryController`, `CompanyAssetController`, `AssetAllocationController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Views (Days 8–9)
- [x] **Task 4.1: API Clients & Types**
  - TypeScript types and client functions for asset management.
- [x] **Task 4.2: Asset Catalog & Allocation Views**
  - `/assets` and `/assets/allocations`.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.19.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 19 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Asset Status** | Allocating an asset marks its status `ALLOCATED` and prevents duplicate concurrent assignment. | Integration tests |
| **AC-02** | **Asset Return** | Returning an asset marks its allocation `RETURNED` and restores asset status to `AVAILABLE`. | Integration tests |
| **AC-03** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
