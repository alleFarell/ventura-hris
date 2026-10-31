# Sprint 6: Daily Attendance Tracking, Geofencing & Biometric Ingestion

## 1. Sprint Overview

- **Sprint Number:** Sprint 6
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-11-23 to 2026-12-06 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-11-23
  - **End Date:** 2026-12-06
- **Target Phase:** Phase 2 – Time, Attendance & Leave Management (Sprint 2 of Phase 2)
- **Primary Domains:** [features/Attendance](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Attendance)

---

## 2. Sprint Goals

1. **Daily Attendance Records Engine:** Record employee clock-in, clock-out, actual working hours, tardiness minutes, and early departure minutes evaluated against assigned shift policies.
2. **Geofencing & IP-Restricted Clocking:** Validate mobile/web clock-in coordinates against branch office geofence radius (Haversine formula) and allowable IP CIDR ranges.
3. **Biometric Machine Log Ingestion:** Support batch staging and ingestion of attendance punch logs from biometric fingerprint/facial recognition hardware.
4. **Interactive Attendance Log & Web Punch Interface:** Build employee self-service web clock-in/clock-out widget with GPS coordinate capture and manager/HR attendance log review table in Next.js.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V7__create_daily_attendance_and_clockin_tables.sql`:
    - Table `attendance_records`: Employee ID, date, shift ID, clock-in time, clock-out time, late minutes, early departure minutes, status (`PRESENT`, `LATE`, `EARLY_LEAVE`, `ABSENT`, `ON_LEAVE`, `HOLIDAY`), notes.
    - Table `attendance_punch_logs`: Raw punch events, device/source (`WEB`, `MOBILE`, `BIOMETRIC`), latitude, longitude, IP address, photo/biometric hash.
    - Table `biometric_devices`: Device code, name, branch ID, IP address, status.
- **Backend Services & APIs:**
  - Clocking: `POST /api/v1/attendance/clock-in`, `POST /api/v1/attendance/clock-out`, `GET /api/v1/attendance/my-today`.
  - Attendance Records: `GET /api/v1/attendance/records` (paginated & filtered by date, department, employee), `POST /api/v1/attendance/records/recalculate`.
  - Biometric Ingestion: `POST /api/v1/attendance/biometric-punch-import`.
- **Frontend Applications & Views:**
  - `/attendance/punch`: Employee self-service clock-in/out card with live time, location verification, and shift countdown.
  - `/attendance/records`: HR and Manager daily attendance records table with status chips, lateness indicators, and filter controls.
  - `/attendance/biometrics`: Biometric device management and raw punch ingestion monitor.
- **Testing & Quality:**
  - Integration tests for clock-in/out flows, Haversine geofencing distance calculation, late/early leave computation, and raw punch aggregation.
  - 100% backend test pass rate and 0 frontend build errors.
  - OpenAPI synchronization (`apis/v1/foundation.openapi.yaml` bumped to `0.6.0`).

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database Migration V7 (Days 1–2)
- [x] **Task 1.1: Design and write Flyway migration V7**
  - Create `attendance_records`, `attendance_punch_logs`, and `biometric_devices` tables.
  - Add composite unique indexes on `attendance_records(employee_id, record_date)`.
- [x] **Checkpoint 1:** Flyway migration V7 executes cleanly on PostgreSQL and test H2 database.

---

### Milestone 2: Backend Entities, Repositories & DTOs (Days 3–4)
- [x] **Task 2.1: Entities & Mappings**
  - Create `AttendanceRecord`, `AttendancePunchLog`, `BiometricDevice` entities.
- [x] **Task 2.2: Repositories & DTOs**
  - Implement `AttendanceRecordRepository`, `AttendancePunchLogRepository`, `BiometricDeviceRepository`.
  - Implement request and response DTOs for clocking, daily records, and batch punch ingestion.
- [x] **Checkpoint 2:** Entities and repositories compile without schema or relationship conflicts.

---

### Milestone 3: Business Logic Services & Controllers (Days 5–7)
- [x] **Task 3.1: Geofencing & Validation Utilities**
  - Haversine distance calculator between punch coordinates and branch geofence boundary.
- [x] **Task 3.2: Attendance Calculation Service**
  - `AttendanceCalculationService`: Calculates late arrivals against shift grace periods and early departure against shift end times.
- [x] **Task 3.3: Clocking & Records Services**
  - `AttendanceService`: Clock-in/out handling, daily record creation, manual adjustment.
- [x] **Task 3.4: REST Controllers**
  - `AttendanceController`, `BiometricController`.
- [x] **Checkpoint 3:** Integration tests pass with 100% success rate (`mvn test`).

---

### Milestone 4: Frontend Next.js Attendance & Web Punch Views (Days 8–9)
- [x] **Task 4.1: Attendance API Client & Geolocation Hook**
  - Browser Geolocation API integration with fallback and reverse geocode summary.
- [x] **Task 4.2: Web Punch Component**
  - Real-time digital clock, location radius badge, clock-in / clock-out button states.
- [x] **Task 4.3: Daily Attendance Log Table**
  - Searchable, filterable table showing employee attendance metrics, status badges, and punch timestamps.
- [x] **Checkpoint 4:** Next.js production build (`npm run build`) completes with 0 errors.

---

### Milestone 5: OpenAPI Synchronization & Sprint Review (Day 10)
- [x] **Task 5.1: OpenAPI Specification Update**
  - Synchronize `apis/v1/foundation.openapi.yaml` to version `0.6.0`.
- [x] **Task 5.2: Verification & Test Execution**
  - Run full backend test suite (`mvn test`) and frontend production build (`npm run build`).
- [x] **Checkpoint 5:** Sprint 6 marked COMPLETED with walkthrough report.

---

## 5. Acceptance Criteria

| Criteria ID | Category | Requirement | Validation Method |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Web Clock-In/Out** | Employees can clock in and clock out; times and coordinates are recorded accurately. | Integration tests |
| **AC-02** | **Geofence Enforcement** | Punches outside branch radius are rejected or flagged as out-of-boundary. | Unit & Integration tests |
| **AC-03** | **Lateness Calculation** | Lateness is calculated accurately based on assigned shift start time and grace period. | Integration tests |
| **AC-04** | **Biometric Import** | External raw punch log files can be ingested and aggregated into attendance records. | Integration tests |
| **AC-05** | **Records Filtering** | HR can filter attendance records by date range, branch, department, and status. | Integration tests & UI |
| **AC-06** | **Quality Gate** | 100% backend test pass rate and 0 frontend build errors. | `mvn test` & `npm run build` |
