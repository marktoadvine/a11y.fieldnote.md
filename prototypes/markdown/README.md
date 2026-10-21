# Markdown authoring trial

Read [the button fieldnote](button.fieldnote.md) as both source and rendered
Markdown. Compare it with [the YAML button](../../examples/button.fieldnote.yaml).
This is a hand-authored alternative exploring the same seven note IDs, four
configurations, and three checks, with fuller explanations. It is not a
generated view or a second file to keep synchronized in a real project.

The hypothesis: keep precise component context in YAML frontmatter, then let
designers write decisions, questions, and procedures as normal Markdown.

## Proposed conventions

- Frontmatter identifies the experimental format with
  `schemaVersion: "markdown-prototype-1"`. It holds component identity/platform,
  optional references, benchmarks, and configuration names.
- `## Notes` and `## Checks` identify the two collections. Each `###` heading
  starts one entry. Headings are readable titles; renaming one does not change
  the entry's ID. Use `####` or deeper headings inside an entry.
- The first list under an entry is metadata. `ID`, `Status`, `Topic`,
  `Applies to`, `Notes`, `Method`, and `Test` are recognized labels.
  IDs, statuses, methods, and referenced IDs use inline code; multiple references
  are separate code spans, not one comma-delimited string.
- Each entry requires an ID. Checks also require Notes and Method. Status is
  optional; omission means unspecified. Suggested statuses remain open,
  decided, and not-applicable; custom statuses remain welcome.
- Everything after the metadata list is the note's narrative or check
  procedure. Writers can use paragraphs, lists, links, images, and subheadings.
  There is no second copy of that prose in YAML.
- Omitted Applies to means all documented configurations. Explicit scope is
  additive, with no overrides. A check must fit every referenced note's scope.
- Custom metadata and sections are preserved. Titles, prose, and IDs can use
  any language. The small set of recognized labels is fixed for this trial;
  localized labels are an authoring question to evaluate.

## What a future checker would do

**Errors:** missing/unsupported format version, missing component ID/platform,
malformed frontmatter, duplicate metadata keys or IDs within a collection,
unknown note/configuration references, incompatible check scopes, and duplicate
Notes/Checks sections.

**Warnings:** empty entry bodies, decided/not-applicable entries without an
explanation, and likely misspellings of recognized metadata labels. Custom
sections and fields should otherwise be accepted.

Checking can confirm structure and relationships. It cannot judge whether prose
really explains a decision, whether a check passed, or whether a component is
accessible. A parser should use Markdown syntax nodes so headings inside code
examples cannot accidentally become notes.

## Review the writing experience

1. Change a decision, add a question, and rename a heading while retaining its ID.
2. Add a variant-specific note and a check that references it.
3. Read the rendered document: are status, scope, and open questions easy to find?
4. Try it in the intended authoring tool and export it again. Does it preserve
   frontmatter, code spans, heading levels, and metadata lists? Figma Specs
   round-tripping has not been tested.
5. Decide whether the metadata feels useful or still too much like a form.

This branch contains the document and proposed conventions only. No Markdown
parser, linter, export, or Figma integration is implemented. The current AFS
0.3.0 schema and CLI continue to accept YAML/JSON; do not send this prototype
to that validator.

If this format works, implement an optional checker next. The authored Markdown
would be the source of truth; any machine-readable export would be generated.
