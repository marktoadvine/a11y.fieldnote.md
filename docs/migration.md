# Migrating to 0.3.0

0.3.0 is a breaking simplification. Keep the original fieldnote and any historical results in version control before converting them. Older schemas and tools remain available at their Git revisions.

1. Replace the component object with its identifier: `component: dialog`. Preserve useful name, source, design, platform, and version information as custom file-level fields.
2. Create one `notes` list. Keep existing decision IDs; rename IDs that collide across the old collections and update external links.
3. Move decision `answer` to `statement`. Keep `question`, `topic`, `reason`, and `references`. Status is no longer required; preserve it as a custom field if useful. For a not-applicable decision, explain what does not apply and why in a statement/reason.
4. Turn responsibilities and limitations into notes with statements. Owner and workaround can remain custom fields. Keep useful check procedures as prose notes or links to project tests; AFS no longer interprets check references or outcomes.
5. Rewrite configuration scopes into explicit prose or custom context before removing `configurations` and `appliesTo`. Preserve exactly which situations a statement covers. There is no automatic selection, inheritance, or scope validation.
6. Keep verification results in your project's testing or audit records. The result schema and `--results` command are removed; do not present old outcomes as newly verified notes.
7. Update `schemaVersion` to `"0.3.0"` or omit it. Update any pinned `$schema` URL to the new schema or omit it. Run the current validator and review the content.

Versioned guidance packs are replaced by [optional questions](questions.md). Existing source references can remain on notes; custom metadata can preserve authoring provenance.

## Before

```yaml
schemaVersion: "0.2.0"
component:
  id: dialog
  name: Confirmation
  platform: web
decisions:
  - id: initial-focus
    topic: focus
    status: decided
    answer: Focus Cancel for this destructive confirmation.
responsibilities: []
limitations: []
checks: []
```

## After

```yaml
component: dialog
name: Confirmation
platform: web
notes:
  - id: initial-focus
    topic: focus
    statement: Focus Cancel for this destructive confirmation.
```

Use `validate` or `render`; `resolve` and `--configuration` are removed. Generated note anchors are now `note-<URI-encoded-id>`, replacing `decision-<id>`; update incoming links.

The validator deliberately permits custom fields. A leftover legacy field can therefore pass as custom data without retaining its old meaning. Migration requires human review; validation is not an automatic conversion.
