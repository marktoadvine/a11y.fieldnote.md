# Confirmation dialog — accessibility fieldnotes

Component: confirmation\-dialog. Platform: web. Schema version: 0.3.0.

Contextual notes and check definitions; not verification results or a conformance claim.

## Component references

```yaml
- kind: guidance
  url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
```

## Benchmarks

Sources informing these notes; not a coverage claim.

```yaml
- name: WCAG
  version: "2.2"
  url: https://www.w3.org/TR/WCAG22/
```

## Notes

<a id="note-accessible-name"></a>

### accessible\-name

**Status:** open

**Topic:** semantics

**Question:** What visible title will name this dialog?

<a id="note-initial-focus"></a>

### initial\-focus

**Status:** decided

**Topic:** focus

**Statement:** For this destructive confirmation, focus Cancel when the dialog opens\.

**Reason:** Avoid positioning focus on the destructive action\.

**References:**

```yaml
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
```

<a id="note-return-focus"></a>

### return\-focus

**Status:** open

**Topic:** focus

**Question:** Where should focus return if the trigger no longer exists?

<a id="note-provide-title"></a>

### provide\-title

**Status:** decided

**Statement:** Supply a visible title describing the action\.

**Additional context:**

```yaml
owner: consuming team
```

## Checks

Procedures to perform, not recorded passes or failures.

<a id="check-initial-focus-check"></a>

### initial\-focus\-check

**Notes:** [initial\-focus](#note-initial-focus)

**Method:** manual

Open the dialog from its trigger and confirm that focus lands on Cancel\.
