# Using fieldnotes with agents

Fieldnotes give accessibility checks project context: intended behavior, design decisions, open questions, variants, and procedures. Discover `*.fieldnote.md` files in the project and read those relevant to the component or flow being checked. Follow component references to locate the implementation; resolve relative paths from the fieldnote's directory.

1. **Read the intent.** Read the whole document, including custom context. `decided` describes intended behavior, not a verified pass. `open` identifies an unresolved question. `not-applicable` records an author's rationale; assess that rationale against the implementation and applicable requirements. Ask about unfamiliar statuses or ambiguous guidance when they affect the check.
2. **Choose the scope.** Use component platform and declared configurations to identify the variants/states to inspect. Omitted `Applies to` means all documented configurations. Scoped notes add to shared notes; they do not override them. Unlisted combinations are unspecified, not exempt. Report which configurations you actually examined.
3. **Plan and run checks.** Use `Checks` entries and their linked note IDs as procedures. Follow `Method` and `Test` references where your tools support them. Test paths are references, not proof of execution. Report manual or assistive-technology checks you could not perform as untested, with the needed follow-up.
4. **Look beyond the file.** Also apply relevant accessibility standards, platform guidance, and the user's requested scope. Benchmarks are cited sources, not a complete coverage claim. Flag missing guidance and conflicts between documented intent and accessibility requirements; never interpret silence as a pass.
5. **Report evidence separately.** Include the fieldnote path, component ID, configuration, note/check IDs where relevant, expected versus observed behavior, method/environment, and evidence. Distinguish issues, unresolved questions, and untested checks. Findings without a matching note are still valid; suggest a new note without inventing an existing ID. Do not change design statuses into test outcomes or claim conformance from passing checks.

The structural checker can help identify malformed metadata or broken references before testing. It does not run accessibility checks or evaluate the quality of the guidance. Report structural problems and any resulting ambiguity; continue independent checks where their scope is clear.

Example request:

> Read the relevant `*.fieldnote.md` files and use their intent and procedures alongside applicable accessibility guidance to check this component. Cite note/check IDs in findings, identify gaps, and list anything you could not test. Keep results separate from the fieldnotes.

Example finding reference: `examples/button.fieldnote.md` → component `button` → configuration `secondary` → note `focus-indicator` → check `focus-check`. Follow it with what you observed and the evidence.

See the [format](format.md), [configurations](configurations.md), and [checks](checks.md).
