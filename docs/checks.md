# Repository checks

## AFS-01 — Schema, examples, and export integrity

This checks AFS itself, not the accessibility of documented components:

- Minimal records and optional shared fields.
- Custom fields, topics, multilingual IDs, and duplicate-ID rejection.
- Unsupported version and malformed record rejection.
- Markdown preservation of custom context and references.
- YAML/JSON example equivalence and generated-document consistency.
- CLI validation/rendering and rejection of removed commands.

Run `npm ci --ignore-scripts` then `npm run check`.
