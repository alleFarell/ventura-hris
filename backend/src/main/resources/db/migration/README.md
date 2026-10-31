# Backend Migrations

Flyway migrations for Ventura HRIS live in this folder.

Migration filenames must follow:

```text
V{version}__{clear_description}.sql
```

Example:

```text
V1__create_foundation_setup_tables.sql
```

Sprint 01 prepares the migration location only. Feature migrations must be created after the related database design is reviewed.

