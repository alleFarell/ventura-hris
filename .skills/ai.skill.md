# AI Skill

## Purpose

Guide AI-native HRIS feature design.

## Guidelines

- Follow `docs/AIArchitecture.md`.
- AI must be permission-aware, auditable, and replaceable by provider.

## Do

- Use tools for business actions.
- Require human approval for high-risk actions.

## Don't

- Put canonical business rules only in prompts.
- Let AI bypass RBAC.

## Examples

- Leave assistant can draft a recommendation, but approval remains workflow-controlled.

## Checklist

- [ ] Permissions enforced
- [ ] Prompt versioned
- [ ] Audit event defined
- [ ] Human approval assessed

