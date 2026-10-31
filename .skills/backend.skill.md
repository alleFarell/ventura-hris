# Backend Skill

## Purpose

Guide Spring Boot backend implementation.

## Guidelines

- Follow the layers in `backend/README.md`.
- Keep controllers thin and services focused on use cases.
- Expose DTOs, not entities.

## Do

- Use validation, mappers, typed exceptions, audit fields, and repository specifications.
- Add tests for business rules and security boundaries.

## Don't

- Put business rules in controllers.
- Skip migration, API, or security documentation.

## Examples

- `EmployeeController` delegates to `EmployeeService`.
- `EmployeeSearchSpecification` owns dynamic filters.

## Checklist

- [ ] DTOs defined
- [ ] Validation added
- [ ] Audit behavior handled
- [ ] Tests planned

