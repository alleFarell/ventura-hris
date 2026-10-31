# Database Skill

## Purpose

Guide relational database design.

## Guidelines

- Follow `docs/DatabaseConvention.md`.
- Normalize transactional data.
- Design for PostgreSQL first, with MySQL and Oracle compatibility in mind.

## Do

- Include standard audit columns.
- Use foreign keys, indexes, migrations, and history tables where appropriate.

## Don't

- Make manual schema changes outside migrations.
- Store sensitive data without documented retention and access rules.

## Examples

- Add `employee_salary_histories` for salary changes.
- Add indexes based on documented search filters.

## Checklist

- [ ] Standard columns included
- [ ] Relationships documented
- [ ] Indexes justified
- [ ] Migration planned

