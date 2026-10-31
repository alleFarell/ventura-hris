# Deployment

## Environments

- Development
- Staging
- Production

## Required Capabilities

- Dockerized backend and frontend
- Docker Compose for local orchestration
- Environment-specific configuration
- Database migrations
- Health checks
- Rollback procedure
- Structured logs
- CI/CD pipeline

## Configuration

Secrets must not be committed. Runtime configuration must be loaded from environment variables or approved secret management.

## Release Readiness

Production deployment requires passing tests, reviewed migrations, updated API docs, release notes, and rollback notes.

