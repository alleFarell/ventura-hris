# Migration Skill

## Purpose

Guide database migration work.

## Guidelines

- Read database/MigrationStrategy.md before creating migrations.
- Keep migrations reviewable and tied to feature documentation.

## Do

- Review data impact, rollback needs, and compatibility.

## Don't

- Make manual schema changes without a migration.

## Examples

- Add an employee history table before implementing employment status tracking.

## Checklist

- [ ] Migration reviewed
- [ ] Rollback considered
- [ ] Data impact checked
- [ ] Tests planned
