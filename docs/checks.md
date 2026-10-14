# Repository checks

## AFS-01 — Schema, examples, and export integrity

Checks on AFS itself, not component accessibility:

- Required version and component identity/platform.
- Custom fields, multilingual IDs, optional statuses, and status requirements.
- Component references, benchmarks, and check definitions.
- Duplicate IDs, dangling references, and note/check configuration scope.
- Additive selection, unknown configurations, and source immutability.
- Complete and selected Markdown preservation of metadata and test references.
- CLI behavior, examples, generated docs, and local documentation links.

Run `npm ci --ignore-scripts` then `npm run check`.
