# Development Environment

## Purpose

This document defines the Sprint 01 development baseline for Ventura HRIS. It captures the stack choices, local environment variables, expected commands, and readiness checks needed before feature implementation starts.

## Stack Baseline

| Area | Choice | Version Baseline | Notes |
| --- | --- | --- | --- |
| Backend language | Java | 21 | Required for modern Spring Boot development and long-term support. |
| Backend framework | Spring Boot | 3.5.9 | Conservative stable baseline for enterprise implementation. |
| Backend build tool | Maven | 3.9.x | Standard build and dependency lifecycle. |
| Database | PostgreSQL | 16.x or newer | Primary database per database convention. |
| Database migration | Flyway | Managed by Spring Boot dependency management | All schema changes must be migrations. |
| API documentation | OpenAPI | 3.1 | Contracts live under `apis/v1/`. |
| Frontend framework | Next.js | 16.2.9 | App Router and TypeScript baseline. |
| Frontend runtime | React | 19.x | Used through Next.js. |
| Styling | Tailwind CSS | 4.x | CSS-first setup with `@import "tailwindcss"`. |
| UI components | shadcn/ui-compatible | Project-local components | Components remain owned by this repository. |
| Server state | TanStack Query | 5.x | Frontend API state, caching, and mutations. |
| HTTP client | Axios | 1.x | Shared API client. |
| Client state | Zustand | 5.x | Shared UI state only when local state is insufficient. |

## Backend Environment Variables

| Variable | Example | Required | Description |
| --- | --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `local` | Yes | Active Spring profile. |
| `VENTURA_DB_URL` | `jdbc:postgresql://localhost:5432/ventura_hris` | Yes | PostgreSQL JDBC URL. |
| `VENTURA_DB_USERNAME` | `ventura` | Yes | Database username. |
| `VENTURA_DB_PASSWORD` | `ventura_local_password` | Yes | Database password for local development. |
| `VENTURA_JWT_SECRET` | `replace-with-local-secret-only` | Yes | Local signing secret placeholder. |
| `VENTURA_CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Yes | Frontend origins allowed by backend. |

## Frontend Environment Variables

| Variable | Example | Required | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api/v1` | Yes | Backend API base URL used by browser code. |
| `NEXT_PUBLIC_APP_ENV` | `local` | Yes | Frontend environment label. |

## Local Commands

### Backend

```bash
cd backend
mvn spring-boot:run
mvn test
mvn -DskipTests package
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run lint
npm run build
```

### Database

```bash
docker compose up -d postgres
cd backend
mvn flyway:info
```

## Local Service Ports

| Service | Port | URL |
| --- | --- | --- |
| Backend API | 8080 | `http://localhost:8080` |
| Backend health | 8080 | `http://localhost:8080/actuator/health` |
| Frontend | 3000 | `http://localhost:3000` |
| PostgreSQL | 5432 | `localhost:5432` |

## Project Structure Baseline

Backend packages start at:

```text
backend/src/main/java/com/ventura/hris
```

Frontend source starts at:

```text
frontend/src
```

## Readiness Checks

- [ ] Java 21 is installed.
- [ ] Maven 3.9.x is installed.
- [ ] Node.js LTS is installed.
- [ ] npm is installed.
- [ ] PostgreSQL is available locally or through Docker.
- [ ] Backend environment variables are configured.
- [ ] Frontend environment variables are configured.
- [ ] Backend health endpoint starts locally.
- [ ] Frontend starts locally.
- [ ] OpenAPI contract is available under `apis/v1/`.

## Sprint 01 Decision Notes

- Spring Boot 3.5.9 is selected instead of a newer major line to reduce enterprise adoption risk for the first implementation sprint.
- Flyway is selected as the first migration tool to keep migrations simple, ordered, and easy to review.
- Next.js App Router is selected for the frontend shell.
- Tailwind CSS 4 style setup is selected with a PostCSS plugin and `@import "tailwindcss"` in global CSS.

