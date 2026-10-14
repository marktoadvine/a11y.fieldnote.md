# Optional validation

Authoring requires no tools. To use the reference validator, get this repository and run:

```sh
npm ci --ignore-scripts
node tools/fieldnote.mjs validate /path/to/project/button.fieldnote.yaml
node tools/fieldnote.mjs render /path/to/project/button.fieldnote.yaml
```

Node.js 22+ is required for this CLI. It accepts YAML and JSON, supports multiple files, and returns a nonzero exit status for invalid records. Supported commands are `validate` and `render`.

Only `component`, `notes`, and each note's `id` are required. Known prose fields must contain non-whitespace text. References are arrays of citation strings or nonempty custom objects. Other file-level and note-level fields are accepted without AFS-specific constraints. Custom topics and identifiers may use any language.

IDs are case-sensitive and must be unique within a file. The CLI checks uniqueness; JSON Schema alone cannot compare IDs across note objects. An ID-only note or empty notes list is a placeholder, not evidence of completed accessibility work.

## Editor schemas and versions

An editor supporting JSON Schema Draft 2020-12 may associate `*.fieldnote.yaml` or `*.fieldnote.json` with `schema/fieldnote.schema.json`. YAML editors may need their own schema-association setting. You may optionally add:

```yaml
$schema: https://raw.githubusercontent.com/marktoadvine/accessibility-fieldnote-schema/main/schema/fieldnote.schema.json
schemaVersion: "0.3.0"
```

The URL above tracks main and can change. For reproducibility, replace `main` with a known commit SHA, or keep a local schema copy. The optional schemaVersion records the format version; it does not pin a remote schema URL.

The CLI always uses its bundled schema and never fetches the record's schema URL. An explicit unsupported schemaVersion is rejected; an omitted version is interpreted using the bundled schema. See [migration](migration.md) for older records.

Validation does not assess conformance, correctness, or completeness. Permitting custom fields means a typo can look like an extension, so review both source and generated documentation.

## Rendering

Markdown includes shared prose fields, references, custom note fields, and custom file metadata. Custom data appears in YAML code blocks; consumers can build a richer view. It does not interpret custom data or produce verification results.

Note anchors use `note-` followed by the URI-encoded ID. Keep IDs stable when editing prose.
