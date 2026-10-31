# RAG Skill

## Purpose

Guide retrieval augmented generation.

## Guidelines

- Use RAG for policy Q&A, knowledge search, and document-grounded answers.
- Keep source attribution and permission filtering mandatory.

## Do

- Chunk documents intentionally.
- Store metadata for permissions, source, version, and retention.

## Don't

- Retrieve documents a user cannot access.
- Present ungrounded answers as policy truth.

## Examples

- Policy Q&A must cite the policy document version used.

## Checklist

- [ ] Sources permission-filtered
- [ ] Citations available
- [ ] Index version tracked
- [ ] Evaluation cases defined

