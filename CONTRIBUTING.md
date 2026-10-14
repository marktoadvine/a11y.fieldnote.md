# Contributing

Start with a real component example. Keep the format small, portable, and easy for designers and developers to author.

The core is a component identifier and notes with stable IDs. Custom topics and fields are welcome. Preserve shared field meanings; avoid adding mandatory workflow, configuration selection, or verification-result machinery.

For a format change, update the schema and optional schemaVersion, package version, examples, migration guide, and changelog. Older versions remain in Git history.

Run `npm ci --ignore-scripts` and `npm run check` for schema, tooling, or example changes. [AFS-01](docs/checks.md) describes the checks.

Contributions use the [MIT license](LICENSE).
