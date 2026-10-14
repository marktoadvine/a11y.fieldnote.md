# Optional validation

Authoring needs no tools. The reference CLI requires Node.js 22+:

```sh
npm ci --ignore-scripts
node tools/fieldnote.mjs validate /path/to/project/button.fieldnote.yaml
node tools/fieldnote.mjs render /path/to/project/button.fieldnote.yaml
node tools/fieldnote.mjs resolve /path/to/project/button.fieldnote.yaml --configuration secondary
```

The required fields are `schemaVersion: "0.3.0"`, `component.id`, `component.platform`, and `notes`. Each note needs an `id`. An empty notes list or ID-only note is a placeholder.

Optional structured fields:

- Component name/version and references: references have a URL or local path, optionally kind/label.
- Note status: open, decided (requires statement), or not-applicable (requires reason). Custom nonempty statuses are accepted without additional workflow rules.
- Configurations: unique IDs and names, plus optional context.
- Benchmarks: name, version, and URL.
- Checks: ID, referenced note IDs, method, and procedure; optional test reference.
- AppliesTo on notes/checks: nonempty unique configuration IDs.

The CLI checks duplicate IDs, dangling note/configuration references, and check/note scope compatibility. JSON Schema alone cannot check these relationships. [Selection rules](configurations.md) define configuration behavior.

Known prose fields must contain non-whitespace text. Custom fields are allowed at record, component, note, configuration, benchmark, reference, and check levels. Topic, platform, status, and method vocabularies remain extensible. Validation cannot detect every typo or assess correctness, completeness, or conformance.

## Editors and versions

Associate `*.fieldnote.yaml` or `*.fieldnote.json` with `schema/fieldnote.schema.json` in an editor supporting JSON Schema Draft 2020-12. YAML editors may need a schema association setting. Optionally add:

```yaml
$schema: https://raw.githubusercontent.com/marktoadvine/accessibility-fieldnote-schema/main/schema/fieldnote.schema.json
```

That URL tracks main. To fix a schema snapshot, use a known commit SHA instead of main, or keep a local schema copy. The required schemaVersion identifies the format; it does not pin the URL. The CLI always uses its bundled schema and rejects missing or unsupported schemaVersion values. It never fetches schema or reference URLs.

## Output

Render preserves component references, benchmarks, status, scope, checks/test references, and custom context. Structured reference/custom data appears in YAML code blocks. Note/check anchors use `note-` or `check-` plus a URI-encoded ID. Links must URI-encode that complete anchor ID again so browser fragment decoding reaches the literal anchor; the renderer does this for check-to-note links.

Use `--configuration ID` with render or resolve. Resolve takes exactly one file. Validate/render accept multiple files and report a nonzero exit status for invalid input. Verification-result handling is not included.
