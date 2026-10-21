# Accessibility Fieldnote Schema (AFS)

Portable, accessibility-first documentation for designers and developers. Write decisions, questions, rationale, and check procedures in Markdown; keep a small YAML header for component context.

**0.4.0 draft: Markdown is the recommended authoring format.** YAML/JSON 0.3.0 is deprecated; its schema and existing commands remain available.

Copy the [starter](examples/base/component.fieldnote.md) into your project as `component.fieldnote.md`:

````markdown
---
schemaVersion: "0.4.0"
component:
  id: button
  platform: web
---

# Button accessibility

## Notes

### Give the action a name

- ID: `visible-label`
- Status: `open`

What visible label best describes this action?
````

Add only what you need: component references, configurations, benchmarks, note status, or checks. Custom fields, sections, vocabulary, and languages are welcome. See the [button example](examples/button.fieldnote.md) and [format](docs/format.md).

## Check the structure

With Node.js 22+ in this repository:

```sh
npm ci --ignore-scripts
npm run lint -- /path/to/button.fieldnote.md
```

The checker catches malformed metadata, duplicate IDs, and broken note/configuration references. It does not test accessibility or claim conformance. Write in any Markdown editor; VS Code is optional. [Checker details](docs/validation.md).

## More

- [Configurations](docs/configurations.md)
- [Checks](docs/checks.md)
- [Questions and decisions](docs/questions.md)
- [Direction](DIRECTION.md)
- [Contributing](CONTRIBUTING.md)

Legacy `.fieldnote.yaml`, `.fieldnote.json`, and generated `.accessibility.md` examples remain as 0.3.0 references. New authored documents use `.fieldnote.md`.
