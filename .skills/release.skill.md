# Release Skill

## Purpose

Guide release readiness.

## Guidelines

- Follow `docs/ReleaseProcess.md`.
- Releases require test evidence, migration review, security review, and rollback notes.

## Do

- Document user-facing and technical changes.
- Verify staging before production.

## Don't

- Release undocumented database changes.
- Skip monitoring after deployment.

## Examples

- Include migration and rollback notes for payroll schema changes.

## Checklist

- [ ] Tests passed
- [ ] Migrations reviewed
- [ ] Release notes written
- [ ] Rollback documented

