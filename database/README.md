# Database

This folder contains database design, migration, ERD, audit, history, seed, indexing, and compatibility documentation.

## Purpose

Design a normalized relational database that supports PostgreSQL, MySQL, and future Oracle compatibility.

## Table Requirements

Every business table must include:

- `id`
- `created_by`
- `created_at`
- `updated_by`
- `updated_at`
- `deleted`
- `version`

## Standards

- Use foreign keys for relational integrity.
- Use audit and history tables for sensitive HR and payroll data.
- Use migrations for all schema changes.
- Design indexes from documented query patterns.

