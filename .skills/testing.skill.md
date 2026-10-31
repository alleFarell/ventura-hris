# Testing Skill

## Purpose

Guide risk-based testing.

## Guidelines

- Test business rules, permissions, migrations, APIs, and critical user flows.
- Scale coverage with blast radius.

## Do

- Add unit, integration, repository, controller, API, and end-to-end tests where relevant.
- Prioritize payroll, attendance, leave, security, and approval logic.

## Don't

- Treat snapshots as a substitute for business-rule tests.
- Ship untested migrations.

## Examples

- Test overtime calculation across holiday and shift boundaries.
- Test manager cannot approve unauthorized leave.

## Checklist

- [ ] Rules covered
- [ ] API covered
- [ ] Permissions covered
- [ ] Regression risk assessed

