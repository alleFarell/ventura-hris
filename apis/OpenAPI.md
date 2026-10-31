# OpenAPI Contract Strategy

## Purpose

OpenAPI contracts are required for backend and frontend alignment.

## Rules

- Define endpoints before implementation.
- Include request schemas, response schemas, error schemas, security requirements, and examples.
- Version contracts under API version folders when implementation begins.
- Generated clients must not replace API design review.

## Initial Location

Future OpenAPI files should be stored under `apis/v1/`.
