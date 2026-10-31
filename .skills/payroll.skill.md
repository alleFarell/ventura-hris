# Payroll Skill

## Purpose

Guide payroll feature design.

## Guidelines

- Treat payroll as high-risk financial and compliance functionality.
- Document formulas, periods, approvals, audit events, and corrections.

## Do

- Preserve calculation traceability.
- Version salary components and tax assumptions.

## Don't

- Change payroll rules without migration and regression tests.
- Store unexplained calculated values.

## Examples

- Payslip generation must trace allowance, deduction, tax, BPJS, THR, loan, and reimbursement inputs.

## Checklist

- [ ] Formula documented
- [ ] Audit trail defined
- [ ] Tests designed
- [ ] Approval flow mapped

