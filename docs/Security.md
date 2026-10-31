# Security

## Baseline Controls

- RBAC and permission matrix
- JWT access token and refresh token
- Password policy
- Audit logs
- Encryption for sensitive data where appropriate
- Input validation
- Rate limiting
- CSRF protection for browser-sensitive flows
- CORS allowlist
- OWASP best practices

## Data Sensitivity

Employee, payroll, tax, health, identification, and performance data are sensitive. Access must be permissioned, audited, and minimized.

## Authentication

Authentication must support secure session lifecycle, refresh token rotation, revocation, expiry, and suspicious activity handling.

## Authorization

Authorization checks must happen server-side. Frontend hiding is a usability feature, not a security control.

## Audit

Security-sensitive actions must record actor, action, target, timestamp, result, source, and relevant metadata.

