# Check a fieldnote

With Node.js 22+, run `npm ci --ignore-scripts` in this repository, then:

```sh
node tools/fieldnote.mjs lint /path/to/button.fieldnote.md
node tools/fieldnote.mjs lint /path/to/button.fieldnote.md --json
```

Multiple files are supported. `validate` also accepts Markdown-only input. Diagnostics identify files, lines, severity, and codes; header schema errors point to line 1 with the property path. Exit codes: 0 means no structural errors (warnings may remain), 1 means invalid/unreadable files, 2 means invalid command usage. JSON output is an array of file reports.

Errors cover frontmatter/version/identity, malformed required metadata, duplicate IDs/sections/labels, unknown references, and incompatible check scopes. Empty entry bodies warn. Custom fields and vocabulary are allowed; review spelling and prose yourself. No files are modified. This checks document structure, not accessibility, test outcomes, or conformance.

## Editor support

Write in any Markdown editor. VS Code previews the prose; run the checker in its terminal to catch document errors. The [frontmatter JSON Schema](../schema/frontmatter.schema.json) is available to editors/extensions that support YAML frontmatter schemas; it covers the header only. Ordinary Markdown editing does not automatically enable AFS validation.

