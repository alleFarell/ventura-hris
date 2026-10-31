# Frontend Skill

## Purpose

Guide Next.js frontend implementation.

## Guidelines

- Use feature-based folders.
- Keep server state in React Query.
- Use typed services and validation schemas.

## Do

- Document flows before building screens.
- Respect permissions, loading states, errors, and empty states.

## Don't

- Create UI without documented roles and acceptance criteria.
- Mix unrelated feature logic.

## Examples

- `features/attendance/hooks/useAttendanceQuery.ts`
- `features/payroll/components/PayslipPreview.tsx`

## Checklist

- [ ] User roles known
- [ ] API contract reviewed
- [ ] Validation defined
- [ ] States covered

