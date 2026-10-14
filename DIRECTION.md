# Direction: lightweight accessibility fieldnotes

AFS should make accessibility thinking easy to record, share, and carry into a project. Designers and developers should be able to copy one file, write useful notes, and keep those notes beside a component through handoff and reuse. The same file should be readable by people and software.

The next revision should center on a component identifier and a list of notes with stable IDs, unique within that file. Offer optional fields such as `topic`, `statement`, `question`, `reason`, and `references`. Allow custom topics and fields without requiring a prescribed workflow. Keep the shared fields consistent so tools can recognize them; extensions should add meaning without redefining them.

Illustrative shape for the next revision (not valid against the current 0.2.0 schema):

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

These are contextual notes, not universal dialog instructions. Accessibility depends on the people, language, region, platform, framework, and implementation involved. Authors should be free to document those nuances in their own terms and link relevant guidance. IDs identify notes; they do not establish checklist coverage or compliance.

Keep configuration machinery and verification-result records out of the intended format. Prioritize a copyable starter, suggested accessibility questions, and a few realistic examples. No installation or mandatory tooling should be needed to author a fieldnote.

Success means someone can pick up the file, understand the accessibility choices and open questions, and use it in their project with little explanation.

This records the agreed direction. The existing 0.2.0 schemas and tools remain the current implementation until a separately versioned simplification and migration are made.
