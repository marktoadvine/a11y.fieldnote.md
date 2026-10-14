# confirmation\-dialog — accessibility fieldnotes

Contextual notes and open questions; not verification results or a conformance claim.

<a id="note-accessible-name"></a>

## accessible\-name

**Topic:** semantics

**Question:** What visible title will name this dialog?

<a id="note-initial-focus"></a>

## initial\-focus

**Topic:** focus

**Statement:** For this destructive confirmation, focus Cancel when the dialog opens\.

**Reason:** Avoid positioning focus on the destructive action\.

**References:**

```yaml
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
```

<a id="note-return-focus"></a>

## return\-focus

**Topic:** focus

**Question:** Where should focus return if the trigger no longer exists?

<a id="note-provide-title"></a>

## provide\-title

**Statement:** Supply a visible title describing the action\.

**Additional context:**

```yaml
owner: consuming team
```
