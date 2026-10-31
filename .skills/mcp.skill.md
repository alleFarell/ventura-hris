# MCP Skill

## Purpose

Guide Model Context Protocol server and tool design.

## Guidelines

- MCP tools must expose explicit, permissioned HRIS capabilities.
- Tool schemas must be stable and auditable.

## Do

- Validate inputs and check permissions server-side.
- Log tool calls and outcomes.

## Don't

- Expose broad database access as a convenience tool.
- Let agents perform high-risk actions without workflow approval.

## Examples

- `createLeaveRequest` can submit a request; `approvePayrollRun` requires stricter authorization and approval state.

## Checklist

- [ ] Schema defined
- [ ] Permissions enforced
- [ ] Audit logging added
- [ ] Risk level reviewed

