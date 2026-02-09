# ADR-0009: Receipt upload hardening (MVP)

- Status: Accepted
- Date: 2026-02-09

## Context
Receipts may contain PII. Upload handling is a common security risk (RCE, path traversal, content-type spoofing, oversized payloads, decompression bombs).
Constraints:
- 0€/mo
- Local-first
- Keep dependencies minimal

## Decision
Implement receipt upload with strict guardrails:

### Allowlist
- File types: **JPEG** and **PNG** only.
- Enforce via:
  1) server-side magic-byte sniff (not only extension or `Content-Type`),
  2) content-type normalization to `image/jpeg` or `image/png`.

### Size limits
- Max file size: **5 MB** per receipt (config constant).
- Hard reject above limit before writing to disk.

### Storage
- Store under `apps/web/data/receipts/` (gitignored).
- Filename: random UUID (no user input) + extension based on detected type.
- Persist only `storage_key` (relative) + metadata in DB.

### EXIF stripping
- For JPEG: strip EXIF (APP1) segments.
- For PNG: accept as-is for MVP (PNG does not have EXIF in the same way; may contain ancillary metadata, but stripping requires more tooling).

Implementation note:
- Prefer **minimal custom EXIF strip** for JPEG to avoid heavy/native deps.
- If this proves brittle, escalate to using `sharp` (native) for re-encode.

### Access control
- Receipt fetch/download endpoints must enforce `account_id` ownership.
- Serve with `Content-Disposition: attachment` for download.

### Logging
- Log upload rejects (type/size) without storing sensitive filenames.

## Consequences
Pros:
- Strong baseline security without external services.
- Keeps dependency surface small.

Cons:
- Custom EXIF handling needs careful test coverage.
- PNG metadata stripping deferred.

## Tests
- Reject spoofed content-type with wrong magic bytes.
- Reject >5MB.
- Reject polyglot attempts (e.g. HTML renamed as .jpg).
- Verify stored filename cannot be influenced by user.
