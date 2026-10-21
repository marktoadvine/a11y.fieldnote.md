# Configurations

Optionally list named variants/states in frontmatter under `configurations`, each with `id` and `name`. Add project-defined context when useful. See the [button](../examples/button.fieldnote.md).

An entry's `Applies to` list references configuration IDs using separate inline-code spans. Omit it for all documented configurations. Notes accumulate; scoped notes do not override shared notes. Unlisted configurations are unspecified.

A check's scope must fit every note it references. An unscoped check covers all documented configurations, so it cannot reference a note limited to only some of them. The checker validates these relationships.
