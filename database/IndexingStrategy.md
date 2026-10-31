# Indexing Strategy

## Purpose

Indexes must support documented query patterns without creating unnecessary write overhead.

## Required Index Categories

- Foreign key indexes
- Unique business key indexes
- Search and filter indexes
- Reporting indexes for approved dashboards
- Audit lookup indexes

## Review Rule

Every non-obvious index must name the query or workflow it supports.
