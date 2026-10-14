import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import YAML from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(resolve(ROOT, 'schema/fieldnote.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const check = ajv.compile(schema);

export function load(path) {
  return YAML.parse(readFileSync(path, 'utf8'));
}

export function validate(record) {
  if (record?.schemaVersion !== undefined && record.schemaVersion !== schema.properties.schemaVersion.const) {
    return ['schemaVersion: expected 0.3.0; see docs/migration.md or use the matching older AFS checkout'];
  }
  if (!check(record)) return check.errors.map(error => `${error.instancePath || '$'}: ${error.message}`);
  const ids = record.notes.map(note => note.id);
  return new Set(ids).size === ids.length ? [] : ['notes: duplicate IDs'];
}

// Escape Markdown/HTML syntax in prose. References remain readable citations;
// richer linking and custom presentation can be implemented by a consuming site.
function prose(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/([\\\x60*_{}\[\]()#+.!|~-])/g, '\\$1');
}

function yamlBlock(value) {
  const text = YAML.stringify(value).trimEnd();
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map(run => run.length));
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return [fence + 'yaml', text, fence, ''];
}

export function markdown(record) {
  const errors = validate(record);
  if (errors.length) throw new Error(errors.join('\n'));
  const lines = [
    `# ${prose(record.component)} — accessibility fieldnotes`, '',
    'Contextual notes and open questions; not verification results or a conformance claim.', '',
  ];
  const metadata = Object.fromEntries(Object.entries(record).filter(([key]) =>
    !['component', 'notes', '$schema', 'schemaVersion'].includes(key)));
  if (Object.keys(metadata).length) lines.push('## Project context', '', ...yamlBlock(metadata));
  if (!record.notes.length) lines.push('No notes recorded yet.', '');
  for (const note of record.notes) {
    lines.push(`<a id="note-${encodeURIComponent(note.id)}"></a>`, '', `## ${prose(note.id)}`, '');
    for (const [key, label] of [['topic', 'Topic'], ['statement', 'Statement'], ['question', 'Question'], ['reason', 'Reason']]) {
      if (note[key] !== undefined) lines.push(`**${label}:** ${prose(note[key])}`, '');
    }
    if (note.references?.length) lines.push('**References:**', '', ...yamlBlock(note.references));
    const custom = Object.fromEntries(Object.entries(note).filter(([key]) =>
      !['id', 'topic', 'statement', 'question', 'reason', 'references'].includes(key)));
    if (Object.keys(custom).length) lines.push('**Additional context:**', '', ...yamlBlock(custom));
    if (Object.keys(note).length === 1) lines.push('Placeholder; no accessibility guidance recorded yet.', '');
  }
  return lines.join('\n');
}

const usage = 'Usage: node tools/fieldnote.mjs validate|render FILE...';
export function main(args = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs({ args, options: { help: { type: 'boolean', short: 'h' } }, allowPositionals: true });
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  if (options.values.help) {
    console.log(usage);
    return 0;
  }
  const [command, ...files] = options.positionals;
  if (!['validate', 'render'].includes(command) || !files.length) {
    console.error(usage);
    return 2;
  }
  let failed = false;
  for (const file of files) {
    try {
      const record = load(file);
      const errors = validate(record);
      if (errors.length) throw new Error(errors.join('\n'));
      if (command === 'render') console.log(markdown(record));
      else console.log(`${file}: valid`);
    } catch (error) {
      console.error(`${file}: ${error.message}`);
      failed = true;
    }
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = main();
}
