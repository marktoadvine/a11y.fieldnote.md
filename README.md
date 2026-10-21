# Accessibility Fieldnotes

Portable accessibility intent and check instructions for people and agents. Write decisions, questions, rationale, and check procedures in Markdown; keep a small YAML header for component context.

**0.4.0 draft: author fieldnotes in Markdown.**

Copy the [starter](examples/base/component.fieldnote.md) into your project as `fieldnotes/component.fieldnote.md`:

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

## Use with agents

Keep fieldnotes in a `fieldnotes/` directory at your project root, or alongside the components they describe. No manifest or configuration is required. Add the [copyable instruction](docs/agents.md#repository-layout-and-discovery) to your project's `AGENTS.md` so agents know where to look.

Treat accessibility as part of planning, implementation, and verification. Ask your agent to read the relevant `*.fieldnote.md` files before planning or changing UI, and use them again when running accessibility checks. Fieldnotes explain intended behavior, variants, open questions, and check procedures. They supplement applicable accessibility standards; missing notes do not mean missing obligations.

See [agent guidance](docs/agents.md) for interpreting scope and reporting findings against stable note IDs. Use “fieldnotes” for short.

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
