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


const collections = ['notes', 'checks'];
const covers = (item, configuration) => !item.appliesTo || item.appliesTo.includes(configuration);

export function validate(record) {
  if (record?.schemaVersion !== schema.properties.schemaVersion.const) {
    return ['schemaVersion: expected 0.3.0; use the schema and tools matching this record'];
  }
  if (!check(record)) return check.errors.map(error => `${error.instancePath || '$'}: ${error.message}`);
  const errors = [];
  const configurations = record.configurations?.map(item => item.id) ?? [];
  for (const key of [...collections, 'configurations']) {
    const ids = (record[key] ?? []).map(item => item.id);
    if (new Set(ids).size !== ids.length) errors.push(`${key}: duplicate IDs`);
  }
  for (const key of collections) {
    for (const item of record[key] ?? []) {
      for (const id of item.appliesTo ?? []) {
        if (!configurations.includes(id)) errors.push(`${key}/${item.id}: unknown configuration ${id}`);
      }
    }
  }
  const notes = new Map(record.notes.map(item => [item.id, item]));
  for (const check of record.checks ?? []) {
    for (const id of check.notes) {
      const note = notes.get(id);
      if (!note) {
        errors.push(`checks/${check.id}: unknown note ${id}`);
      } else {
        for (const configuration of check.appliesTo ?? configurations) {
          if (!covers(note, configuration)) {
            errors.push(`checks/${check.id}: note ${id} does not apply to ${configuration}`);
          }
        }
      }
    }
  }
  return errors;
}

export function resolveConfiguration(record, configuration) {
  const errors = validate(record);
  if (errors.length) throw new Error(errors.join('\n'));
  const selected = record.configurations?.find(item => item.id === configuration);
  if (!selected) throw new Error(`Unknown configuration: ${configuration}`);
  const resolved = structuredClone(record);
  resolved.configurations = [structuredClone(selected)];
  for (const key of collections) {
    if (!resolved[key]) continue;
    resolved[key] = resolved[key].filter(item => covers(item, configuration)).map(item => {
      if (item.appliesTo) item.appliesTo = [configuration];
      return item;
    });
  }
  return resolved;
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


function extras(value, known) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !known.includes(key)));
}

function scope(item, record) {
  if (!record.configurations) return [];
  return [`**Applies to:** ${item.appliesTo ? item.appliesTo.map(prose).join(', ') : 'all documented configurations'}.`, ''];
}

export function markdown(record, configuration) {
  const errors = validate(record);
  if (errors.length) throw new Error(errors.join('\n'));
  const selected = configuration !== undefined ? resolveConfiguration(record, configuration) : record;
  const component = record.component;
  const lines = [
    `# ${prose(component.name ?? component.id)} — accessibility fieldnotes`, '',
    `Component: ${prose(component.id)}. Platform: ${prose(component.platform)}. Schema version: ${record.schemaVersion}.`, '',
    'Contextual notes and check definitions; not verification results or a conformance claim.', '',
  ];
  if (component.version) lines.push(`Component version: ${prose(component.version)}.`, '');
  if (component.references?.length) lines.push('## Component references', '', ...yamlBlock(component.references));
  const componentExtra = extras(component, ['id', 'name', 'platform', 'version', 'references']);
  if (Object.keys(componentExtra).length) lines.push('## Component context', '', ...yamlBlock(componentExtra));
  if (record.benchmarks?.length) lines.push('## Benchmarks', '', 'Sources informing these notes; not a coverage claim.', '', ...yamlBlock(record.benchmarks));
  if (selected.configurations) {
    lines.push('## Configurations', '', ...yamlBlock(selected.configurations));
    if (configuration !== undefined) lines.push(`Selected configuration: **${prose(configuration)}**. Other configurations are outside this view.`, '');
    else lines.push('Only the listed configurations are documented; other combinations are unspecified.', '');
  }
  const metadata = extras(record, ['component', 'notes', '$schema', 'schemaVersion', 'configurations', 'benchmarks', 'checks']);
  if (Object.keys(metadata).length) lines.push('## Project context', '', ...yamlBlock(metadata));
  lines.push('## Notes', '');
  if (!selected.notes.length) lines.push('No notes recorded yet.', '');
  for (const note of selected.notes) {
    const original = record.notes.find(item => item.id === note.id);
    lines.push(`<a id="note-${encodeURIComponent(note.id)}"></a>`, '', `### ${prose(note.id)}`, '', ...scope(original, record));
    for (const [key, label] of [['status', 'Status'], ['topic', 'Topic'], ['statement', 'Statement'], ['question', 'Question'], ['reason', 'Reason']]) {
      if (note[key] !== undefined) lines.push(`**${label}:** ${prose(note[key])}`, '');
    }
    if (note.references?.length) lines.push('**References:**', '', ...yamlBlock(note.references));
    const custom = extras(note, ['id', 'status', 'topic', 'statement', 'question', 'reason', 'references', 'appliesTo']);
    if (Object.keys(custom).length) lines.push('**Additional context:**', '', ...yamlBlock(custom));
    if (!note.statement && !note.question && !note.reason) lines.push('Placeholder; no accessibility guidance recorded yet.', '');
  }
  if (selected.checks) {
    lines.push('## Checks', '', 'Procedures to perform, not recorded passes or failures.', '');
    if (!selected.checks.length) lines.push('No checks recorded yet.', '');
    for (const item of selected.checks) {
      const original = record.checks.find(entry => entry.id === item.id);
      lines.push(`<a id="check-${encodeURIComponent(item.id)}"></a>`, '', `### ${prose(item.id)}`, '', ...scope(original, record));
      lines.push(`**Notes:** ${item.notes.map(id => `[${prose(id)}](#note-${encodeURIComponent(id)})`).join(', ')}`, '',
        `**Method:** ${prose(item.method)}`, '', prose(item.procedure), '');
      if (item.test) lines.push('**Test reference:**', '', ...yamlBlock(item.test));
      const custom = extras(item, ['id', 'notes', 'method', 'procedure', 'test', 'appliesTo']);
      if (Object.keys(custom).length) lines.push('**Additional context:**', '', ...yamlBlock(custom));
    }
  }
  return lines.join('\n');
}

const usage = 'Usage: node tools/fieldnote.mjs validate|render|resolve FILE... [--configuration ID]';
export function main(args = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs({ args, options: {
      configuration: { type: 'string' }, help: { type: 'boolean', short: 'h' },
    }, allowPositionals: true });
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  if (options.values.help) {
    console.log(usage);
    return 0;
  }
  const [command, ...files] = options.positionals;
  const { configuration } = options.values;
  if (!['validate', 'render', 'resolve'].includes(command) || !files.length ||
      (configuration !== undefined && (command === 'validate' || !configuration)) ||
      (command === 'resolve' && (!configuration || files.length !== 1))) {
    console.error(usage);
    return 2;
  }
  let failed = false;
  for (const file of files) {
    try {
      const record = load(file);
      const errors = validate(record);
      if (errors.length) throw new Error(errors.join('\n'));
      if (command === 'render') console.log(markdown(record, configuration));
      else if (command === 'resolve') console.log(JSON.stringify(resolveConfiguration(record, configuration), null, 2));
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
