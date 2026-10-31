# Architecture

## Target Architecture

Ventura HRIS uses a modular monolith as the default starting point, with clear boundaries that allow selected domains to become services later if scale, ownership, or operational constraints justify it.

## Backend Architecture

The backend uses Spring Boot with layered, domain-oriented modules:

- Controller for HTTP boundaries
- DTO for request and response contracts
- Validator for input and business validation
- Service for application use cases
- Entity for persistence model
- Repository for data access
- Specification for dynamic filtering
- Mapper for DTO/entity conversion
- Exception for domain and application errors
- Audit, logging, security, configuration, common, and utility packages as shared infrastructure

## Frontend Architecture

The frontend uses Next.js and feature-based organization. Each feature owns its pages, components, hooks, services, types, validation, and utilities.

## Data Architecture

The database is relational and normalized. PostgreSQL is the preferred primary target, MySQL must remain feasible, and Oracle compatibility should be considered for naming, data types, and migration strategy.

## Integration Architecture

Integrations must be designed through stable API contracts, event documentation, authentication rules, retry rules, and audit trails.

## AI Architecture

AI features access HRIS capabilities through explicit tools, MCP servers, RAG pipelines, prompt management, and audited approval workflows. Business services must not depend directly on a specific LLM vendor SDK.

