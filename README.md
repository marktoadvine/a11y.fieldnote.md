# Accessibility Fieldnote Schema

Living accessibility decisions for components. A small, versioned sidecar that starts during design and ships with component documentation. Independent of documentation frameworks, component libraries, and agent platforms.

**Draft 0.2.0 · web components · experimental.** This records expectations and responsibilities; it does not certify accessibility or WCAG conformance.

**Next direction:** [Lightweight, customizable fieldnotes](DIRECTION.md): a component identifier and notes with stable IDs, optional guidance fields, and room for project-specific context. Configuration machinery and verification results are outside that intended scope. The documentation below describes the existing 0.2.0 implementation.

## Start with one file — no installation

Copy [the smallest valid fieldnote](examples/base/component.fieldnote.yaml), rename it to `your-component.fieldnote.yaml`, and place it beside your component documentation. Change the component ID and name, then add decisions as you work. No installation is required to write or share the file.

```yaml
$schema: https://raw.githubusercontent.com/marktoadvine/accessibility-fieldnote-schema/main/schema/fieldnote.schema.json
schemaVersion: "0.2.0"
component:
  id: my-component
  name: My component
  platform: web
decisions: []
responsibilities: []
limitations: []
checks: []
```

Empty lists are valid placeholders, not completed accessibility work. Start with one question:

```yaml
decisions:
  - id: accessible-name
    topic: semantics
    question: What gives this component its accessible name?
    status: open
```

When decided, change `status` to `decided` and add an `answer`. Use `not-applicable` with a `reason` when the question does not apply. See [the base guide](examples/base/README.md) and [a fuller dialog example](examples/dialogue.fieldnote.yaml).

## Carry it into your design system docs

Keep the fieldnote as the source of truth. Link it from the component page for an immediate, portable handoff. To show its contents inline, your documentation system can parse the YAML (or equivalent JSON) and render decisions, responsibilities, limitations, and checks. Any language or documentation stack can implement this; AFS is the data format, not a JavaScript dependency.

Retain stable decision IDs as the component changes. Add the implementation version when available; keep unresolved questions and limitations visible after release. Check definitions describe how to verify behavior, not whether it has passed.

The optional renderer below generates Markdown for documentation systems that accept it. Generate that page during your docs build rather than maintaining a second copy by hand.

## Share decisions across variants and states

Declare optional `configurations` in one component fieldnote. Decisions apply
to all documented configurations unless scoped with `appliesTo: [secondary]`.
The same scope field works on responsibilities, limitations, and checks.

See the [button example](examples/button.fieldnote.yaml) and
[selection rules](docs/configurations.md). The base template stays minimal.

```sh
node tools/fieldnote.mjs render examples/button.fieldnote.yaml --configuration secondary
node tools/fieldnote.mjs resolve examples/button.fieldnote.yaml --configuration secondary
```

`resolve` outputs a valid JSON fieldnote with shared and selected items.
[Migration to 0.2.0](docs/migration.md) covers existing records and results.

## Validate your own entries

See [validation instructions](docs/validation.md) for files in another repository and local editor validation. A hosted service or published package is not required. Use local schema files when a remote schema URL is unavailable.

## Optional tools

### Validation and Markdown generation

The included reference CLI uses Node.js 22+. Install its dependencies only if you want to run it:

```sh
npm ci
node tools/fieldnote.mjs validate examples/base/component.fieldnote.yaml
node tools/fieldnote.mjs render examples/dialogue.fieldnote.yaml > dialogue.accessibility.md
```

An editor or another validator supporting JSON Schema Draft 2020-12 can use the `$schema` URL for structural checks. The reference CLI additionally checks duplicate IDs, decision references, and configuration scopes.

## The model

| Field | Purpose |
| --- | --- |
| `component` | Identity, platform, optional implementation version and design/source links |
| `configurations` | Optional named combinations of variant, state, theme, or other conditions |
| `benchmarks` | Optional record-level source names, versions, and URLs; no conformance claim |
| `guidance` | Optional profile ID and the version used to author the decisions |
| `decisions` | Stable IDs, topics, optional questions, status, answers, rationale, and optional versioned source references |
| `responsibilities` | What designers, implementers, or consumers must supply |
| `limitations` | Known limitations and optional workarounds |
| `checks` | Procedures and test references linked to decision IDs |

`open` is a valid state. `decided` requires an answer; `not-applicable` requires a reason. The CLI also rejects duplicate IDs and dangling decision references. Schema validity does not establish that the guidance, implementation, or answers are correct.

JSON and YAML represent the same model. UTF-8 files use the `.fieldnote.yaml` or `.fieldnote.json` suffix. Unknown fields are rejected in 0.2.0 to catch mistakes early.

## Separate verification results

[The results schema](schema/results.schema.json) records the fieldnote location, assessed implementation revision, check ID, outcome, observation date, environment, and evidence. Validate it using `node tools/fieldnote.mjs validate --results results.json`.

The CLI resolves the local fieldnote path relative to the results file and checks that each check ID and configuration applies. For configured components, each observation names exactly one `configuration`; shared procedures do not share outcomes. The shipped result fixture is synthetic. Validation does not execute checks or refresh evidence.

## Benchmarks

Optionally identify the sources informing a record:

```yaml
benchmarks:
  - name: WCAG
    version: "2.2"
    url: https://www.w3.org/TR/WCAG22/
```

This does not assert coverage or conformance. Benchmark versions are independent
of `schemaVersion`. For a draft, identify its date in `version` and use the
exact dated source URL. Individual criteria remain optional decision references.

## Guidance and maintenance

**AFS structures records; guidance packs help author them.** Neither questions nor packs are mandatory. Record custom behavior directly with a decision ID, topic, status, and answer; see [the custom component example](examples/custom.fieldnote.yaml) and [guidance/migration documentation](docs/guidance.md).


The optional, experimental web modal-dialog guidance pack draws on the [W3C APG modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). APG guidance and WCAG requirements are distinct. Questions need contextual answers; the pack does not prescribe one initial focus target for every dialog.

Profiles are versioned separately from the schema. Updating guidance must prompt review rather than silently rewriting decisions. Automated profile comparison is a future feature.

Only the current schemas live in `schema/`. The `schemaVersion` field identifies the record format; the CLI validates against the current version only. Older schemas remain in Git history. Use a release tag or commit-pinned URL when you need a fixed version. Current schema URLs use `main`; they change as the schema is updated.

## Scope of this prototype

Portable component records, versioned schemas, examples, and optional validation and Markdown rendering. Next: use the format in real component documentation and refine it from those trials.

## License and contributions

[MIT](LICENSE). See [contribution guidance](CONTRIBUTING.md).
