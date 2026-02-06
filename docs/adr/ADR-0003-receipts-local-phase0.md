# ADR-0003: Receipt photo storage (Phase 0: local-only)

- Status: Proposed
- Date: 2026-02-06

## Context
Receipt photo uploads are required, but we want 0€/mo and to avoid cloud storage initially.

## Decision
Store receipt images **locally on the server** in a project data directory (gitignored), and store only metadata + file path/key in the database.

## Guardrails
- Enforce file type allowlist and size limits.
- Verify magic bytes.
- Strip EXIF metadata.
- Use random UUID filenames.
- Access-controlled download endpoint (owner-only).

## Path
- Directory: `./data/receipts/`
- Metadata: `Receipt` table references `fillUpId` + `storageKey` (relative path) + `contentType` + `sha256`.
