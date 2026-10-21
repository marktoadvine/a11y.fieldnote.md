---
schemaVersion: "0.4.0"
component:
  id: button
  name: Action button
  platform: web
  references:
    - kind: figma
      url: https://www.figma.com/design/EXAMPLE/Button?node-id=1-2
    - kind: storybook
      url: https://example.com/storybook/?path=/story/button--primary
    - kind: code
      path: ../../src/components/button/
benchmarks:
  - name: WCAG
    version: "2.2"
    url: https://www.w3.org/TR/WCAG22/
configurations:
  - id: primary
    name: Primary, enabled
  - id: secondary
    name: Secondary, enabled
  - id: primary-disabled
    name: Primary, disabled
  - id: primary-forced-colors
    name: Primary with forced colors
---

# Action button — accessibility fieldnotes

An illustrative fieldnote for a web action button. Design, preview, and code
references above are placeholders. These notes describe intended behavior and
open questions, not a tested implementation or a conformance assessment.

## Notes

### Use the native control

- ID: `native-control`
- Status: `decided`
- Topic: `semantics`

Use a native button for actions. An action changes something in the current
experience; a destination should use a link instead.

The native element supplies familiar keyboard behavior and semantics. Avoid
recreating those behaviors with a generic element.

### Give the action a visible name

- ID: `visible-label`
- Status: `decided`
- Owner: Content designer

Give the button visible text that describes the action. That text supplies its
accessible name.

Prefer a specific label such as “Save address” when “Save” would be ambiguous
in the surrounding page. Revisit the wording with the people using each language.

### Let the label grow

- ID: `text-resize`
- Status: `decided`
- Topic: `visual`

Let the label wrap and the button grow when text is enlarged. Keep the whole
label readable rather than truncating it to preserve a fixed button size.

Consider longer translated labels as part of the layout.

### Make keyboard focus visible

- ID: `focus-indicator`
- Status: `decided`
- Topic: `focus`
- Applies to: `primary`, `secondary`, `primary-forced-colors`

Show a visible outline when the button receives keyboard focus. Hover styling
alone is insufficient.

The outline needs to remain distinguishable on the surfaces where the button
is used. The secondary button's color choice is still open in the next note.

### Choose the secondary focus color

- ID: `secondary-focus-color`
- Status: `open`
- Topic: `focus`
- Applies to: `secondary`

Which outline token is distinguishable on the secondary button's supported
surfaces?

Record the chosen token and the relevant surfaces here when that decision is
made. An open decision is not evidence that the current implementation fails.

### Explain disabled behavior

- ID: `disabled-behavior`
- Status: `decided`
- Topic: `interaction`
- Applies to: `primary-disabled`

Use the native disabled attribute for this configuration. The button cannot
activate and leaves the tab order.

If someone needs to understand why the action is unavailable, put the
explanation in nearby content; do not rely on focusing the disabled button.
This is a choice for this configuration, not a rule for every unavailable action.

### Keep the boundary in forced colors

- ID: `forced-colors`
- Status: `decided`
- Topic: `visual`
- Applies to: `primary-forced-colors`

Use system colors for the text, boundary, and focus indicator in forced-colors
mode. Keep the control identifiable when decorative fills disappear.

## Checks

These are procedures to perform. No check below records a pass or failure.

### Compare the visible and accessible names

- ID: `name-check`
- Notes: `visible-label`
- Method: `manual`

Inspect the computed accessible name and compare it with the visible label.
Repeat for the documented configurations and supported language contexts.

### Follow keyboard focus

- ID: `focus-check`
- Notes: `focus-indicator`
- Method: `manual`
- Applies to: `primary`, `secondary`, `primary-forced-colors`

Tab to the enabled button and inspect the focus outline without hovering.
Check it on the adjacent surfaces used by the component.

### Evaluate the secondary focus choice

- ID: `secondary-focus-check`
- Notes: `focus-indicator`, `secondary-focus-color`
- Method: `assisted`
- Applies to: `secondary`
- Test: `./tests/button-focus.test.ts`

The test path above is an illustrative reference.

Once a token is proposed, measure the focus indicator against the secondary
button's adjacent surfaces. Use the cited benchmark to interpret the
measurements and record any unresolved conditions in the note.

## Project context

Add regional guidance, supporting research, screenshots, or team-specific
questions here. Custom sections and metadata are part of the document, not
content to discard when a tool reads it.
