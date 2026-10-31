# Security Skill

## Purpose

Guide secure design and implementation.

## Guidelines

- Follow `docs/Security.md`.
- Treat employee, payroll, tax, performance, and identity data as sensitive.

## Do

- Enforce RBAC server-side.
- Audit security-sensitive actions.
- Validate all input.

## Don't

- Rely on frontend hiding for authorization.
- Log secrets or unnecessary personal data.

## Examples

- Check permission before exporting payroll.
- Audit refresh token rotation and revocation.

## Checklist

- [ ] Permissions checked
- [ ] Audit event defined
- [ ] Sensitive data minimized
- [ ] OWASP risks reviewed

