# Database Convention

## Supported Databases

- Primary: PostgreSQL
- Secondary compatibility: MySQL
- Future compatibility: Oracle

## Required Columns

Every business table includes:

```sql
id
created_by
created_at
updated_by
updated_at
deleted
version
```

## Design Rules

- Normalize transactional data.
- Use foreign keys.
- Use `deleted` for soft deletes unless hard delete is explicitly required.
- Use optimistic locking with `version`.
- Store dates and timestamps deliberately with documented timezone behavior.
- Maintain history tables for sensitive data changes.

## Migrations

All schema changes must be expressed as migrations. Manual database changes are not allowed outside emergency procedures, and emergency changes must be backfilled into migrations.

## Indexing

Indexes must be justified by query patterns, uniqueness rules, foreign keys, or reporting needs.

