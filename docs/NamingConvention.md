# Naming Convention

## General

Names must be clear, domain-aligned, and consistent across documentation, database, API, backend, and frontend.

## Database

- Tables: `snake_case`, plural where they represent collections, such as `employees`.
- Columns: `snake_case`, such as `employment_status_id`.
- Foreign keys: `{referenced_singular}_id`.
- Indexes: `idx_{table}_{columns}`.
- Unique constraints: `uk_{table}_{columns}`.
- Foreign key constraints: `fk_{table}_{referenced_table}`.

## Backend

- Packages: lowercase domain names.
- Classes: `PascalCase`.
- Methods and fields: `camelCase`.
- DTOs: `{Action}{Resource}Request` and `{Resource}Response`.
- Services: `{Domain}Service`.
- Controllers: `{Domain}Controller`.

## Frontend

- Components: `PascalCase`.
- Hooks: `use{Feature}{Action}`.
- Services: `{feature}Service`.
- Types: `{Feature}{Entity}`.

## APIs

- Paths use plural nouns: `/api/v1/employees`.
- Query parameters use `camelCase`.
- JSON fields use `camelCase`.

