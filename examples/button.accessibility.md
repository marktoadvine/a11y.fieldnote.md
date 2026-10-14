# Action button — accessibility fieldnotes

Component: button. Platform: web. Schema version: 0.3.0.

Contextual notes and check definitions; not verification results or a conformance claim.

## Component references

```yaml
- kind: figma
  url: https://www.figma.com/design/EXAMPLE/Button?node-id=1-2
- kind: storybook
  url: https://example.com/storybook/?path=/story/button--primary
- kind: code
  path: ../../src/components/button/
```

## Benchmarks

Sources informing these notes; not a coverage claim.

```yaml
- name: WCAG
  version: "2.2"
  url: https://www.w3.org/TR/WCAG22/
```

## Configurations

```yaml
- id: primary
  name: Primary, enabled
  context:
    variant: primary
    state: enabled
- id: secondary
  name: Secondary, enabled
  context:
    variant: secondary
    state: enabled
- id: primary-disabled
  name: Primary, disabled
  context:
    variant: primary
    state: disabled
- id: primary-forced-colors
  name: Primary with forced colors
  context:
    variant: primary
    colorMode: forced
```

Only the listed configurations are documented; other combinations are unspecified.

## Project context

```yaml
example: Illustrative only; design, preview, and code references are placeholders.
```

## Notes

<a id="note-native-control"></a>

### native\-control

**Applies to:** all documented configurations.

**Status:** decided

**Topic:** semantics

**Statement:** Use a native button for actions\.

<a id="note-visible-label"></a>

### visible\-label

**Applies to:** all documented configurations.

**Status:** decided

**Statement:** Give the button visible text that describes the action\.

**Additional context:**

```yaml
owner: content designer
```

<a id="note-text-resize"></a>

### text\-resize

**Applies to:** all documented configurations.

**Status:** decided

**Topic:** visual

**Statement:** Let the label wrap and the button grow when text is enlarged\.

<a id="note-focus-indicator"></a>

### focus\-indicator

**Applies to:** primary, secondary, primary\-forced\-colors.

**Status:** decided

**Topic:** focus

**Statement:** Show a visible outline when focused; hover styling alone is insufficient\.

<a id="note-secondary-focus-color"></a>

### secondary\-focus\-color

**Applies to:** secondary.

**Status:** open

**Topic:** focus

**Question:** Which outline token is distinguishable on the secondary button's supported surfaces?

<a id="note-disabled-behavior"></a>

### disabled\-behavior

**Applies to:** primary\-disabled.

**Status:** decided

**Topic:** interaction

**Statement:** Use the native disabled attribute for this configuration; it leaves the tab order and cannot activate\.

<a id="note-forced-colors"></a>

### forced\-colors

**Applies to:** primary\-forced\-colors.

**Status:** decided

**Topic:** visual

**Statement:** Use system colors for the text, boundary, and focus indicator in forced\-colors mode\.

## Checks

Procedures to perform, not recorded passes or failures.

<a id="check-name-check"></a>

### name\-check

**Applies to:** all documented configurations.

**Notes:** [visible\-label](#note-visible-label)

**Method:** manual

Compare the computed accessible name with the visible label\.

<a id="check-focus-check"></a>

### focus\-check

**Applies to:** primary, secondary, primary\-forced\-colors.

**Notes:** [focus\-indicator](#note-focus-indicator)

**Method:** manual

Tab to the enabled button and inspect the focus outline without hovering\.

<a id="check-secondary-focus-check"></a>

### secondary\-focus\-check

**Applies to:** secondary.

**Notes:** [focus\-indicator](#note-focus-indicator), [secondary\-focus\-color](#note-secondary-focus-color)

**Method:** assisted

Measure the focus indicator against the secondary button's adjacent surfaces\.

**Test reference:**

```yaml
./tests/button-focus.test.ts (illustrative test reference)
```
