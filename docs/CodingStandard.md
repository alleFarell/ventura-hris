# Coding Standard

## General

- Prefer readable, boring, maintainable code.
- Keep classes, functions, and components small.
- Avoid duplicated logic.
- Use strong typing at API, DTO, frontend, and database boundaries.
- Add comments only when they explain non-obvious intent or tradeoffs.
- Use consistent names across database, API, backend, and frontend.

## Backend

- Use constructor injection.
- Keep controllers thin.
- Keep business rules in services or domain policies.
- Use DTOs for all external contracts.
- Use mappers instead of exposing entities.
- Use typed exceptions and consistent error responses.
- Use repository specifications for filtering and search.

## Frontend

- Use TypeScript for all feature code.
- Keep server-state logic in React Query hooks.
- Keep client UI state in local state or Zustand when shared.
- Use schema validation for forms.
- Keep visual components reusable but avoid premature abstraction.

## Tests

- Add tests proportional to risk and blast radius.
- Cover business rules, security boundaries, payroll calculations, attendance rules, and approval flows.

