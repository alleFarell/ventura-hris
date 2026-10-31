# Ventura HRIS

Ventura HRIS is a documentation-first Human Resource Information System platform designed for SMEs today and scalable enterprise HR operations over time.

The project follows an architecture-first lifecycle:

1. Analyze the feature.
2. Create documentation.
3. Create database design.
4. Create API design.
5. Create frontend flow.
6. Review architecture.
7. Implement only after design approval.

## Repository Map

- `backend/` - Spring Boot backend source, organized by domain modules and clean layers.
- `frontend/` - Next.js frontend source, organized by feature.
- `docs/` - Enterprise documentation standards, architecture decisions, and operating processes.
- `database/` - ERDs, conventions, migration strategy, seed data, and database documentation.
- `.skills/` - Agent instructions for future AI-assisted work in this repository.
- `prompts/` - Prompt templates and prompt governance assets.
- `architecture/` - Architecture decision records, diagrams, and system design artifacts.
- `features/` - Feature documentation folders, one per HRIS domain.
- `apis/` - OpenAPI contracts, examples, and API governance files.
- `scripts/` - Automation scripts for local development, validation, and operations.
- `deployment/` - Docker, CI/CD, and environment management assets.
- `tests/` - Cross-cutting test strategy, fixtures, and end-to-end test assets.

## Current Phase

This repository is in the foundation phase. The priority is to establish standards, module boundaries, documentation, and reusable AI-agent guidance before production implementation begins.

