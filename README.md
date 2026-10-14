# Accessibility Fieldnote Schema

Portable accessibility notes for designers and developers. Keep choices, open questions, and check procedures beside a component through handoff and reuse. Readable by people and software, independent of frameworks and documentation tools.

**Draft 0.3.0 · experimental.** Fieldnotes document context and intent; they do not certify accessibility or conformance.

## Start here

Copy [the starter](examples/base/component.fieldnote.yaml):

```yaml
schemaVersion: "0.3.0"
component:
  id: dialog
  platform: web
notes:
  - id: initial-focus
    topic: focus
    status: decided
    statement: Focus the heading when this dialog opens.
    reason: Users need context before choosing an action.
  - id: accessible-name
    status: open
    question: What will name this dialog?
```

The focus choice is contextual, not a universal dialog instruction. No installation is required.

## VS Code hints and error checking

Install [YAML by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml), then add this comment at the top of your `.fieldnote.yaml` file:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/marktoadvine/accessibility-fieldnote-schema/main/schema/fieldnote.schema.json
```

VS Code provides field suggestions and flags schema errors, such as missing required fields or incorrect types. For JSON files, use the same URL in a top-level `$schema` property; no extension is needed. Use the CLI for duplicate IDs and note/configuration reference checks. Custom fields remain allowed.

## The structure

| Field | Use |
| --- | --- |
| `schemaVersion` | Required format version: `"0.3.0"` |
| `component` | Required `id` and `platform`; optional name, version, and references |
| `notes` | Notes with stable IDs, unique within this file |
| `configurations` | Optional named variants or states |
| `benchmarks` | Optional source names, versions, and URLs |
| `checks` | Optional procedures linked to note IDs |

Platform is your own term, such as `web`, `ios`, `android`, or `desktop`. Component `references` accepts objects with a `url` or a `path`, and optional `kind` and `label`. Link Figma nodes, Storybook previews, source directories, or any other context. Paths are relative to the fieldnote file; tools do not fetch or verify the destinations.

Notes may include `topic`, `statement`, `question`, `reason`, `references`, `status`, and `appliesTo`. Keep IDs stable; any language or naming convention is welcome.

- `open`: an unresolved choice or question.
- `decided`: requires a `statement`.
- `not-applicable`: requires a `reason`.

Status is optional; omission means unspecified. Custom statuses, topics, and fields are welcome. Add owner, language, framework, local guidance, or other context without changing shared field meanings. Empty notes and ID-only entries are placeholders, not completed guidance.

## Variants and checks

Declare `configurations` with IDs and names. Use `appliesTo: [secondary]` on a note or check to restrict it. Without `appliesTo`, it covers every documented configuration. Items are additive, with no overrides or implied combinations. See [configuration rules](docs/configurations.md).

Each check has an `id`, `notes` (note IDs), `method`, and `procedure`; `test` can point to a test file or URL. A check can only cover configurations supported by every note it references. Checks define how to verify behavior; they do not record a passed result.

Benchmarks preserve the source and version informing a record, such as WCAG 2.2. They make no claim of coverage or conformance. See the [button](examples/button.fieldnote.yaml), [dialog](examples/dialogue.fieldnote.yaml), and [custom context](examples/custom.fieldnote.yaml) examples.

## Use it in a project

Link the fieldnote from component documentation and review it when behavior changes. Generate a readable view from the file to maintain one source. [Suggested questions](docs/questions.md) can help you start.

Optional CLI, using Node.js 22+:

```sh
npm ci --ignore-scripts
node tools/fieldnote.mjs validate examples/button.fieldnote.yaml
node tools/fieldnote.mjs render examples/button.fieldnote.yaml
node tools/fieldnote.mjs render examples/button.fieldnote.yaml --configuration secondary
node tools/fieldnote.mjs resolve examples/button.fieldnote.yaml --configuration secondary
```

JSON and YAML represent the same model. The optional `$schema` field supports editor setup; `schemaVersion` is required. See [validation](docs/validation.md). Schema validity does not establish accessibility, and accepting custom fields means it cannot catch every typo.

[Direction](DIRECTION.md) · [Contributing](CONTRIBUTING.md) · [MIT license](LICENSE)
