# Sprint 1: Architecture Baseline, Authentication & Tenant/Company Setup

## 1. Sprint Overview

- **Sprint Number:** Sprint 1
- **Sprint Status:** **COMPLETED**
- **Sprint Dates:** 2026-09-14 to 2026-09-27 (2 Weeks / 10 Working Days)
  - **Start Date:** 2026-09-14
  - **End Date:** 2026-09-27
- **Target Phase:** Phase 1 – Foundation & Core HR
- **Primary Domains:** [features/Setup](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/features/Setup), Shared Architecture & Security Core

---

## 2. Sprint Goals

1. **Establish Security & Authentication Baseline:** Implement secure authentication (JWT issuance, refresh tokens, password hashing, user context propagation) in Spring Boot and Next.js frontend session handling.
2. **Implement Core Company & Branch Setup:** Enable company profile creation, multi-branch management, and company localization settings (currency, time zones, fiscal year) backed by Flyway migrations and validated REST APIs.
3. **Establish End-to-End Delivery Standards:** Implement consistent API envelope handling (`ApiResponse`, `ApiError`), global exception handling, React Query data fetching hooks, and UI layouts with Tailwind CSS.

---

## 3. Expected Output & Deliverables

- **Database Migrations:**
  - `V1__create_setup_tables.sql`: Tables for `companies`, `branches`, `system_configurations`, indexes, and foreign keys.
  - `V2__create_security_tables.sql`: Tables for `roles`, `users`, `user_roles`, `refresh_tokens`, and seeded admin credentials.
- **Backend Services & APIs:**
  - Authentication controller (`/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`, `/api/v1/auth/logout`).
  - Company management endpoints (`GET /api/v1/companies`, `POST /api/v1/companies`, `PUT /api/v1/companies/{id}`).
  - Branch management endpoints (`GET /api/v1/branches`, `POST /api/v1/branches`, `PUT /api/v1/branches/{id}`).
  - System configuration lookup endpoints (`GET /api/v1/configurations`).
  - Spring Security configuration with stateless JWT authentication filter and CORS.
- **Frontend Applications & Views:**
  - Responsive Auth Shell with Login page (`/login`) integrating with Zustand auth store.
  - Setup Wizard & Administration Layout (`/setup`, `/setup/company`, `/setup/branches`).
  - Dynamic company loading in branch creation.
  - Axios interceptors with automatic Bearer token injection and 401 handling.
- **Testing & Quality:**
  - 100% passing test suite across Auth and Setup controllers and repositories.
  - Zero ESLint errors.
  - Next.js production build passing with 7 prerendered routes.

---

## 4. Task Detail Breakdown with Checkpoints

### Milestone 1: Database & Flyway Schema Baseline (Days 1–2)

- [x] **Task 1.1: Design and write Flyway migration for Security and User tables**
  - Create table `roles` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`).
  - Create table `users` (`id`, `username`, `email`, `password_hash`, `status`, `failed_attempts`, `locked_until`, `created_at`, `updated_at`).
  - Create table `user_roles` (`user_id`, `role_id`).
  - Create table `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `revoked`, `created_at`).
  - Seed default roles: `ROLE_SUPER_ADMIN`, `ROLE_HR_ADMIN`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`.
  - Seed default super admin user (`admin` / `Admin@123456`).
- [x] **Task 1.2: Design and write Flyway migration for Company, Branch & Setup tables**
  - Create table `companies` (`id`, `code`, `name`, `legal_name`, `tax_identifier`, `default_locale`, `default_timezone`, `default_currency`, `status`, audit timestamps).
  - Create table `branches` (`id`, `company_id`, `code`, `name`, address fields, country code, `status`).
  - Create table `system_configurations` (`id`, `company_id`, `config_key`, `config_value`, `value_type`).
- [x] **Checkpoint 1:** Flyway migrations schema created and entity models mapped to JPA with validation.

---

### Milestone 2: Backend Authentication & Security Implementation (Days 3–5)

- [x] **Task 2.1: JWT Infrastructure & Password Security**
  - Configured `BCryptPasswordEncoder`.
  - Created `JwtTokenProvider` using JJWT 0.12 API for generating and verifying HMAC-SHA256 tokens.
  - Implemented `JwtAuthenticationFilter` extending `OncePerRequestFilter`.
  - Configured Spring Security filter chain with CORS, stateless sessions, and custom unauthorized handlers.
- [x] **Task 2.2: User Details & Authentication Service**
  - Implemented `CustomUserDetailsService` loading users and granted authorities from `UserRepository`.
  - Implemented `AuthService` handling login, token generation, refresh tokens, and logout.
  - Built `AuthController` with endpoints:
    - `POST /api/v1/auth/login` (RequestBody: `LoginRequest`, Response: `TokenResponse`)
    - `POST /api/v1/auth/refresh` (RequestBody: `RefreshTokenRequest`, Response: `TokenResponse`)
    - `GET /api/v1/auth/me` (Authenticated context -> `UserProfileResponse`)
    - `POST /api/v1/auth/logout` (Invalidate refresh token)
- [x] **Checkpoint 2:** Integration tests verify successful login, JWT issuance, protected endpoint access, and rejection of invalid credentials with `401 Unauthorized`.

---

### Milestone 3: Backend Company & Branch Domain Implementation (Days 6–7)

- [x] **Task 3.1: JPA Entities & Repositories**
  - Implemented `Company` and `Branch` entities.
  - Implemented `CompanyRepository` and `BranchRepository` with query specifications (search by name/code, pagination).
- [x] **Task 3.2: DTOs & Validation**
  - Created `CreateCompanyRequest`, `CompanyResponse`, `CreateBranchRequest`, `BranchResponse`.
  - Added JSR-380 validation annotations (`@NotBlank`, `@Size`, `@Pattern`).
- [x] **Task 3.3: Company & Branch Services and Controllers**
  - Implemented `CompanyService` enforcing unique company code.
  - Implemented `BranchService` enforcing foreign key relations and status lifecycle.
  - Exposed REST endpoints under `/api/v1/companies` and `/api/v1/branches` wrapped with `ApiResponse<T>`.
- [x] **Checkpoint 3:** Unit and integration tests pass for Company and Branch CRUD operations under authenticated contexts.

---

### Milestone 4: Frontend Authentication & App Shell Integration (Days 8–9)

- [x] **Task 4.1: Auth State Store & API Interceptor**
  - Implemented Zustand auth store (`useAuthStore`) storing current user state and token with localStorage persistence.
  - Configured Axios client interceptors in `frontend/src/lib/api/client.ts`:
    - Request interceptor: Attach `Authorization: Bearer <token>`.
    - Response interceptor: Catch `401`, clear session, and redirect to `/login`.
- [x] **Task 4.2: Login Page & Protected Navigation**
  - Created responsive Login form UI (`/login`) with username/email and password fields, loading state, error alert, and demo credentials filler.
  - Updated `AppShell` with dynamic user profile display, role badge, and Sign Out button.
- [x] **Task 4.3: Company & Branch Setup Views**
  - Enhanced Company Profile page (`/setup/company`) with form fields and validation.
  - Enhanced Branch Management page (`/setup/branches`) with dynamic company loading dropdown and active status selector.
- [x] **Checkpoint 4:** Complete user flow functional: Login page -> Zustand store update -> Header profile display -> Company & Branch setup forms.

---

### Milestone 5: Architecture Review, OpenAPI Synchronization & Sprint Wrap-Up (Day 10)

- [x] **Task 5.1: OpenAPI Spec Synchronization**
  - Updated `apis/v1/foundation.openapi.yaml` with `/auth/login`, `/auth/refresh`, and `/auth/me` endpoints and schemas.
- [x] **Task 5.2: Automated Test Execution & Quality Audit**
  - Ran backend test suite (`mvn test`): 9 tests run, 0 failures, 0 errors, 0 skipped.
  - Ran frontend lint (`npm run lint`): 0 errors, 0 warnings.
  - Ran frontend build (`npm run build`): All 7 routes prerendered successfully.
- [x] **Task 5.3: Sprint Wrap-Up & Container Baseline**
  - Created `docker-compose.yml` for local PostgreSQL 16 service.
  - Updated Sprint 1 documentation to COMPLETED.
- [x] **Checkpoint 5:** All acceptance criteria satisfied, zero regressions, ready for Sprint 2 (Organization Hierarchy).

---

## 5. Acceptance Criteria Verification

| Criteria ID | Category | Requirement | Validation Result |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Authentication** | Users can log in with valid credentials, receive access + refresh JWTs, and access authorized APIs. | **PASSED** (Verified in `AuthControllerTest`) |
| **AC-02** | **Security** | Invalid credentials return 401 with standard `ApiErrorDetail`. Unauthenticated requests to protected endpoints are blocked. | **PASSED** (Verified in `AuthControllerTest`) |
| **AC-03** | **Company Setup** | Admin can create and update company legal information, currency, timezone, and fiscal year start. | **PASSED** (Verified in `CompanyAndBranchTest`) |
| **AC-04** | **Branch Management** | Admin can create multiple branches and link them to parent companies. | **PASSED** (Verified in `CompanyAndBranchTest`) |
| **AC-05** | **Data Integrity** | All tables contain audit columns and soft-delete/status indicators where applicable. | **PASSED** (Verified in schema and JPA entities) |
| **AC-06** | **Contract Consistency** | All API responses strictly follow standard `ApiResponse<T>` and `ApiError` conventions. | **PASSED** (Verified in tests and OpenAPI spec) |
| **AC-07** | **Frontend Quality** | No ESLint errors, clean TypeScript build, responsive UI. | **PASSED** (`npm run lint` & `npm run build` exit code 0) |

---

## 6. Execution Summary & Verification Audit

- **Backend Test Run:** `mvn test` in `maven:3.9-eclipse-temurin-21` (Java 21):
  - `AuthControllerTest`: 6 tests passed (valid login, email login, invalid password, getMe authenticated, getMe unauthenticated, token refresh)
  - `CompanyAndBranchTest`: 2 tests passed (authenticated company & branch creation/listing, unauthenticated rejection)
  - `VenturaHrisApplicationTests`: 1 test passed (context load)
  - **Total:** 9 tests passed, 0 failures, 0 errors.
- **Frontend Code Quality:**
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm run build`: Next.js 16.2.10 (Turbopack) production build completed in 1.5s with TypeScript validation passed.
- **Docker Infrastructure:**
  - [`docker-compose.yml`](file:///C:/Data/FRL%20PERSONAL%20PROJECT/ventura-hris/docker-compose.yml) configured with `postgres:16-alpine` and health checks.
