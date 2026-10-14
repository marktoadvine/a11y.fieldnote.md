# Contributing

Start with a real component example. Keep the format portable and easy for designers and developers to author. Preserve shared field meanings while allowing project-specific context.

Use a feature branch and open a pull request. Do not commit directly to main or merge without explicit approval.

The core is a schema version, component identity/platform, and notes with stable IDs. Configurations, references, benchmarks, statuses, and checks provide optional structure. Checks describe procedures; result records remain outside the format.

For a format change, update the schema, examples, documentation, and changelog. Coordinate version changes explicitly; this work refines the early 0.3.0 draft. Older snapshots remain in Git history.

Run `npm ci --ignore-scripts` and `npm run check` for schema, tooling, or example changes. [AFS-01](docs/checks.md) describes the checks.

Contributions use the [MIT license](LICENSE).
