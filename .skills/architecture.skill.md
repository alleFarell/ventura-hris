# Architecture Skill

## Purpose

Guide architectural decisions for Ventura HRIS.

## Guidelines

- Read `docs/Architecture.md` before changing system boundaries.
- Prefer modular monolith boundaries before introducing distributed services.
- Record major decisions in `architecture/`.

## Do

- Protect clean architecture, scalability, maintainability, and auditability.
- Document context, tradeoffs, and rejected alternatives.

## Don't

- Add infrastructure complexity without a documented reason.
- Couple business logic to vendor-specific SDKs.

## Examples

- Add an ADR before moving payroll calculation to a separate service.
- Define module ownership before introducing shared code.

## Checklist

- [ ] Decision documented
- [ ] Boundaries reviewed
- [ ] Security and data impact considered
- [ ] AI-readiness considered

