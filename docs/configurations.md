# Configurations and appliesTo

Declare named variants, states, or combinations in `configurations`. Each needs a unique `id` and `name`; optional `context` and custom fields document the situation.

```yaml
schemaVersion: "0.3.0"
component:
  id: button
  platform: web
configurations:
  - id: primary
    name: Primary
  - id: secondary
    name: Secondary
notes:
  - id: accessible-name
    status: decided
    statement: The visible label supplies the accessible name.
  - id: secondary-contrast
    status: open
    question: Which text and background colors will the secondary button use?
    appliesTo: [secondary]
checks:
  - id: secondary-name
    notes: [accessible-name]
    method: manual
    procedure: Compare the accessible name with the visible label.
    appliesTo: [secondary]
```

## Selection rules

These retain the additive model from the 0.2.0-configurations branch:

1. Omitted `appliesTo` covers all declared configurations. Without configurations, the item covers the component.
2. Explicit `appliesTo` is a nonempty list of unique, declared IDs. It is supported on notes and checks.
3. Select shared items plus items naming the requested configuration, preserving order. There are no overrides, inheritance, or implicit defaults.
4. A check's scope must fit within the scope of **every** note it references. A shared check cannot reference a secondary-only note.
5. IDs are unique within each collection. Context is descriptive; it never drives selection.
6. Adding a configuration extends shared notes and checks to it, so review them when adding one.

Configurations name specific situations. Separate disabled and forced-colors entries do not imply a disabled + forced-colors combination. The list is not a completeness claim. Contradictory prose still needs human review.

## Render and resolve

```sh
node tools/fieldnote.mjs render examples/button.fieldnote.yaml --configuration secondary
node tools/fieldnote.mjs resolve examples/button.fieldnote.yaml --configuration secondary
```

Render shows applicable notes and checks, retaining original scope labels. Resolve emits a valid JSON fieldnote containing the selected configuration and applicable items; explicit scopes become a one-item list. Component references, benchmarks, and custom data are preserved. The source is never modified.

The entire record is validated before selection, so errors in another variant cannot be hidden. Unknown configurations fail. Treat resolved files as generated views. Checks remain procedures, not outcomes.

See the [button source](../examples/button.fieldnote.yaml) and [secondary view](../examples/button-secondary.accessibility.md).
