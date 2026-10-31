# Migration Strategy

## Purpose

All database changes must be repeatable, reviewable, and reversible where feasible.

## Rules

- Use Liquibase or Flyway consistently once backend implementation begins.
- One migration should represent one coherent schema change.
- Migrations must be reviewed before release.
- Production hotfixes must be captured as migrations after emergency resolution.
- Destructive changes require backup, rollback, and data-retention review.

## Checklist

- [ ] Migration name is clear
- [ ] Rollback impact reviewed
- [ ] Existing data impact reviewed
- [ ] Index and constraint impact reviewed
- [ ] Tested on a copy of realistic data where needed
