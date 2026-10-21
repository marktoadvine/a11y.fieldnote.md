# Contributing

Start with a real component fieldnote. Keep Markdown readable and custom context welcome. See the [format](docs/format.md) and [direction](DIRECTION.md).

For format changes, update examples, documentation, schemas, tests, and changelog together. 0.4.0 is the Markdown draft; preserve deprecated 0.3.0 behavior while its compatibility tools remain available. Use branches and pull requests for changes.

With Node.js 22+, run `npm ci --ignore-scripts` and `npm run check`. Include structural edge cases when changing the parser. Do not treat a successful check as accessibility verification.
