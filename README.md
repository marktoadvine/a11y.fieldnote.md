# Accessibility Fieldnote Schema

Portable accessibility notes for designers and developers. Copy one file into a project, record choices and questions, and keep it beside the component through handoff and reuse. Readable by people and software, independent of frameworks and documentation tools.

**Draft 0.3.0 · experimental.** Fieldnotes document context and intent; they do not certify accessibility or conformance.

## Start here

Copy [the starter](examples/base/component.fieldnote.yaml) as `your-component.fieldnote.yaml`:

```yaml
component: dialog
notes:
  - id: initial-focus
    topic: focus
    statement: Focus the heading when this dialog opens.
    reason: Users need context before choosing an action.

  - id: accessible-name
    topic: semantics
    question: What will name this dialog?
```

This focus choice is an example for a particular dialog, not a universal instruction. Write what fits your component and the people using it. No installation is required.

## A small shared structure

Require only `component`, `notes`, and an `id` on each note. Keep IDs stable and unique within the file; use your own language and naming conventions. Empty notes and ID-only placeholders are allowed but contain no completed guidance.

| Field | Use |
| --- | --- |
| `topic` | Any useful grouping, such as focus, content, or localisation |
| `statement` | A choice, expectation, responsibility, or known limitation |
| `question` | Something still to work out |
| `reason` | Why this matters in this context |
| `references` | A list of links, citations, or custom reference objects |

All five fields are optional. Add your own fields at the file or note level: `owner`, `language`, `framework`, or whatever helps. Preserve the meaning of the shared fields so tools can read them consistently. JSON represents the same model.

See [dialog](examples/dialogue.fieldnote.yaml), [button](examples/button.fieldnote.yaml), and [custom context](examples/custom.fieldnote.yaml) examples. [Suggested questions](docs/questions.md) can help you start; they are not a required checklist.

## Use it in a project

Link the fieldnote from component documentation. Review it when the component changes. Write relevant language, regional, platform, or framework context directly into notes or custom fields. Teams decide their own workflow; AFS has no configuration selection or verification-result model.

Documentation tools and agents can read the file directly. Generate a human-facing view from it when helpful, so you maintain one source.

## Optional tools

The reference CLI needs Node.js 22+:

```sh
npm ci --ignore-scripts
node tools/fieldnote.mjs validate examples/dialogue.fieldnote.yaml
node tools/fieldnote.mjs render examples/dialogue.fieldnote.yaml > dialogue.accessibility.md
```

Validation checks structure and duplicate note IDs, not the quality or completeness of accessibility guidance. The renderer includes custom fields as YAML context.

For editor setup and version pinning, see [validation](docs/validation.md). Both `$schema` and `schemaVersion: "0.3.0"` are optional. The CLI uses its bundled schema when they are omitted; it does not fetch a schema from the record. Unknown fields are accepted, so validation cannot catch every misspelled field.

## Moving from 0.2.0

This is a breaking simplification: one notes list replaces decisions, responsibilities, limitations, and checks. Configuration machinery, result records, and versioned guidance packs have been removed. See [migration](docs/migration.md) before converting an existing record.

[Direction](DIRECTION.md) · [Contributing](CONTRIBUTING.md) · [MIT license](LICENSE)
