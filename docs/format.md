# Markdown format — 0.4.0 draft

A `.fieldnote.md` file has YAML frontmatter followed by ordinary Markdown. Copy the [starter](../examples/base/component.fieldnote.md) or [button](../examples/button.fieldnote.md).

Frontmatter requires `schemaVersion: "0.4.0"` and `component.id` / `component.platform`. Optional component `name`, `version`, and `references` link Figma nodes, Storybook instances, or code paths (`kind`, plus `url` or `path`). Relative paths resolve from the fieldnote. Optional `benchmarks` contain `name`, `version`, and `url`; they describe sources, not coverage. Optional `configurations` contain unique `id` and `name`, with custom context as needed. See the [frontmatter schema](../schema/frontmatter.schema.json).

## Entries

Use one `## Notes` section (required, may be empty) and optionally one `## Checks`. A `###` heading starts each entry; its title is free text. Use deeper headings within an entry. Other level-one/two sections are project-defined. Exact section and metadata labels are the small machine-readable vocabulary; titles, IDs, and prose can use any language.

The first block after an entry heading is an unordered metadata list. Every entry requires `ID`. Notes optionally accept `Status`, `Topic`, and `Applies to`. Checks require `Notes` and `Method`, and optionally accept `Applies to` and `Test`. Values for these labels use inline code; multiple references use separate code spans, for example:

```markdown
- ID: `focus-check`
- Notes: `focus-indicator`, `visible-label`
- Method: `manual`
- Applies to: `primary`, `secondary`
```

IDs are nonblank, case-sensitive, and unique within their collection in a file. Spaces and Unicode are supported. Keep IDs stable when changing titles. References are local to this file.

After the list, write guidance, questions, rationale, links, images, or procedures as normal Markdown. `open`, `decided`, and `not-applicable` are suggested statuses; custom statuses and methods are accepted. Explain decisions and exclusions in prose. Empty bodies receive a warning; the checker cannot judge the explanation's meaning.

Custom metadata labels (such as `Owner`), header fields, and sections are accepted. The checker reads without rewriting the source. Standard labels are reserved; misspelled optional labels are treated as custom, so review them carefully. Keep notes/checks in the body, not duplicated in frontmatter. Code fences and quoted examples do not create entries.

Markdown rendering works independently of the checker. Figma Specs import/export and round-tripping have not been tested.
