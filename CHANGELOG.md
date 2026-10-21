# Changelog

## 0.4.0 — unreleased

- Name the project Accessibility Fieldnotes (fieldnotes for short) and document how agents use intent, scopes, and checks.

- Make authored Markdown with YAML frontmatter the recommended format.
- Add a structural checker with Markdown-aware parsing, reference/scope checks, line diagnostics, and JSON reports.
- Promote the button example and add a minimal Markdown starter.
- Remove standalone YAML/JSON tooling, schema, examples, generated views, and the prototype directory. Earlier formats remain in Git history.

## 0.3.0 — draft refinement

- Restore component id/platform, optional name/version, and references for design nodes, previews, and source paths.
- Require schemaVersion in every record; retain 0.3.0 for this early draft refinement.
- Restore optional configurations and additive appliesTo on notes/checks from the 0.2.0-configurations model.
- Restore versioned benchmarks, optional note status, and check definitions linked to notes.
- Preserve open custom fields and vocabularies; decided requires statement and not-applicable requires reason.
- Restore selected rendering and JSON resolution, including reference/scope validation.
- Remove the migration guide and its links. Verification-result records remain outside scope.

## 0.3.0 — 2026-10-14

Breaking simplification to portable, customizable accessibility notes.

- Require only a component identifier, notes list, and stable ID per note.
- Offer optional topic, statement, question, reason, and references; accept custom fields and multilingual identifiers.
- Make schema URL and format version optional.
- Replace configuration selection, verification results, and versioned guidance packs with contextual notes and optional question prompts.
- Simplify the CLI to validate/render; preserve references and custom context in Markdown.
- Rewrite examples around the notes model.

## 0.2.0 — working branch

- Added optional named configurations and additive `appliesTo` scopes for decisions, responsibilities, limitations, and checks.
- Added configuration selection for Markdown and a `resolve` command for valid JSON views.
- Check references must apply throughout the check's scope. Results name one configuration and are validated against their linked local fieldnote.
- Added an illustrative button fixture covering two variants, disabled states, and forced colors; included selection, migration, and consumer guidance.
- Kept a flat record valid with only a schema-version update. Configuration fields remain optional.

## 0.1.2

- Added optional record-level benchmarks with name, version, and URL; renders source references without implying conformance.
- Update `schemaVersion` to 0.1.2; benchmark entries remain optional.

## 0.1.1

- Point schema URLs and setup instructions to `main` after merging.

- Replaced Python tooling and tests with JavaScript, Node.js CI, and a dependency lockfile.

- Added an MIT license, contribution guidance, and external-file/editor validation instructions.

- Removed the authoring app, browser tests, generated guidance module, and Node CI setup. Fieldnotes are authored directly in YAML or JSON.
- Questions are optional: decisions can describe intended component behavior directly.
- Guidance packs are optional, independently versioned authoring aids; the web dialog pack is explicitly experimental and carries scope, provenance, and a review date.
- The validator checks the current schema version; documentation rendering handles records without questions.
- Added a custom-component example and guidance/migration documentation.
- Keep only current schemas in `schema/`; older formats remain in Git history. AFS-01 checks schemas, examples, current-version validation, and documentation rendering.

This is a draft change to the record format, not an updated accessibility standard or a conformance assessment.

## 0.1.0

- Introduced versioned fieldnote and results schemas, with separate design intent and verification evidence.
- Added a modal-dialog worksheet with YAML, JSON, and Markdown exports and local draft storage.
- Added a barebones starter record and a documented dialog example.
- Added optional Python validation and documentation rendering tools.
- Named the initial CI check AFS-01: schema, examples, and export integrity.
