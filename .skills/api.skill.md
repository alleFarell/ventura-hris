# API Skill

## Purpose

Guide REST API design and documentation.

## Guidelines

- Follow `docs/APIStandard.md`.
- Create OpenAPI contracts before implementation.
- Standardize pagination, filtering, sorting, and errors.

## Do

- Version APIs under `/api/v1`.
- Use consistent response envelopes.

## Don't

- Return entities directly.
- Create undocumented query behavior.

## Examples

- `GET /api/v1/employees?page=0&size=20`
- `POST /api/v1/leave-requests`

## Checklist

- [ ] Endpoint documented
- [ ] Request/response schemas defined
- [ ] Errors defined
- [ ] Permissions mapped

