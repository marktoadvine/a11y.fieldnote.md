import { readFileSync } from 'node:fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import YAML from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const checkHeader = ajv.compile(JSON.parse(readFileSync(new URL('../schema/frontmatter.schema.json', import.meta.url), 'utf8')));
const labels = { ID: 'id', Status: 'status', Topic: 'topic', 'Applies to': 'appliesTo', Notes: 'notes', Method: 'method', Test: 'test' };
const text = node => node.value ?? (node.children ?? []).map(text).join('');

// Parse blocks, not lines: fenced examples and nested headings are ordinary content.
// Retain the source and raw entry bodies so custom content is never rewritten.
export function lintMarkdown(source) {
  const diagnostics = [];
  const report = (code, message, line = 1, severity = 'error') => diagnostics.push({ severity, code, line, message });
  const result = { source, metadata: null, notes: [], checks: [], diagnostics };
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const header = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!header) { report('frontmatter', 'Start with YAML frontmatter enclosed by --- lines.'); return result; }
  try {
    const doc = YAML.parseDocument(header[1]);
    if (doc.errors.length) throw doc.errors[0];
    result.metadata = doc.toJS({ maxAliasCount: 100 });
    if (!checkHeader(result.metadata)) {
      for (const error of checkHeader.errors) report('metadata', `${error.instancePath || '/'}: ${error.message}`);
      return result;
    }
  } catch (error) { report('frontmatter', error.message); return result; }
  const body = normalized.slice(header[0].length);
  const offset = header[0].split('\n').length - 1;
  const nodes = fromMarkdown(body).children;
  const line = node => offset + node.position.start.line;
  const seen = new Set();
  let section;
  let entry;
  const finish = () => {
    if (!entry) return;
    const { blocks, record, kind, heading } = entry;
    const list = blocks[0];
    let content = blocks;
    if (list?.type === 'list' && !list.ordered) {
      content = blocks.slice(1);
      const used = new Set();
      for (const item of list.children) {
        const paragraph = item.children[0];
        const match = paragraph?.type === 'paragraph' && text(paragraph).match(/^([^:]+):\s*/);
        if (!match) { report('metadata-list', 'Metadata items use Label: value.', line(item)); continue; }
        const label = match[1];
        if (used.has(label)) report('duplicate-label', `Duplicate metadata label: ${label}`, line(item));
        used.add(label);
        const key = labels[label];
        if (!key) continue; // Project-defined metadata stays in the original source.
        const allowed = kind === 'notes' ? ['id', 'status', 'topic', 'appliesTo'] : ['id', 'notes', 'method', 'test', 'appliesTo'];
        if (!allowed.includes(key)) { report('misplaced-label', `${label} is not a ${kind} field.`, line(item)); continue; }
        const children = paragraph.children;
        const values = children.filter(n => n.type === 'inlineCode').map(n => n.value);
        const validSyntax = item.children.length === 1 && children[0]?.type === 'text' && children[0].value.trim() === `${label}:` &&
          children.slice(1).every(n => n.type === 'inlineCode' || (n.type === 'text' && /^[\s,]*$/.test(n.value)));
        const multiple = ['notes', 'appliesTo'].includes(key);
        if (!validSyntax || !values.length || (!multiple && values.length !== 1) || values.some(v => !v.trim())) {
          report('metadata-value', `${label} requires ${multiple ? 'one or more separate' : 'one'} inline-code value(s).`, line(item)); continue;
        }
        if (new Set(values).size !== values.length) report('duplicate-reference', `${label} repeats a value.`, line(item));
        record[key] = multiple ? values : values[0];
      }
    }
    for (const key of kind === 'checks' ? ['id', 'notes', 'method'] : ['id']) {
      if (record[key] === undefined) report('required', `${kind} entry requires ${key} in its first list.`, line(heading));
    }
    record.body = content.length ? body.slice(content[0].position.start.offset, content.at(-1).position.end.offset) : '';
    if (!record.body.trim()) report('empty-body', 'Add guidance, a question, or a procedure; explain decided/not-applicable notes.', line(heading), 'warning');
    result[kind].push(record);
    entry = undefined;
  };
  for (const node of nodes) {
    if (node.type === 'heading' && node.depth <= 2) {
      finish();
      const name = text(node);
      section = node.depth === 2 && ['Notes', 'Checks'].includes(name) ? name.toLowerCase() : undefined;
      if (section) {
        if (seen.has(section)) report('duplicate-section', `Duplicate ${name} section.`, line(node));
        seen.add(section);
      }
    } else if (section && node.type === 'heading' && node.depth === 3) {
      finish();
      entry = { kind: section, heading: node, blocks: [], record: { title: text(node), line: line(node) } };
    } else if (entry) entry.blocks.push(node);
    else if (section && node.type === 'heading') report('entry-heading', 'Start an entry with a level-three heading (###).', line(node));
  }
  finish();
  if (!seen.has('notes')) report('required-section', 'Include a ## Notes section (it may be empty).');
  const configs = result.metadata.configurations ?? [];
  for (const items of [configs, result.notes, result.checks]) {
    const ids = new Set();
    for (const item of items) {
      if (item.id !== undefined && ids.has(item.id)) report('duplicate-id', `Duplicate ID: ${item.id}`, item.line);
      ids.add(item.id);
    }
  }
  const configIds = configs.map(c => c.id);
  for (const item of [...result.notes, ...result.checks]) for (const id of item.appliesTo ?? []) {
    if (!configIds.includes(id)) report('unknown-configuration', `Unknown configuration: ${id}`, item.line);
  }
  const notes = new Map(result.notes.map(n => [n.id, n]));
  for (const check of result.checks) for (const id of check.notes ?? []) {
    const note = notes.get(id);
    if (!note) report('unknown-note', `Unknown note: ${id}`, check.line);
    else for (const config of check.appliesTo ?? configIds) {
      if (note.appliesTo && !note.appliesTo.includes(config)) report('scope', `Note ${id} does not apply to ${config}.`, check.line);
    }
  }
  return result;
}

export function lintFiles(files, json = false) {
  const reports = files.map(file => {
    try {
      if (!file.endsWith('.md')) throw new Error('Use .fieldnote.md for Markdown; validate still supports deprecated YAML/JSON.');
      return { file, diagnostics: lintMarkdown(readFileSync(file, 'utf8')).diagnostics };
    } catch (error) { return { file, diagnostics: [{ severity: 'error', code: 'file', line: 1, message: error.message }] }; }
  });
  if (json) console.log(JSON.stringify(reports, null, 2));
  else for (const { file, diagnostics } of reports) {
    for (const d of diagnostics) console.log(`${file}:${d.line}: ${d.severity} ${d.code}: ${d.message}`);
    if (!diagnostics.some(d => d.severity === 'error')) console.log(`${file}: structure valid`);
  }
  return reports.some(r => r.diagnostics.some(d => d.severity === 'error')) ? 1 : 0;
}
