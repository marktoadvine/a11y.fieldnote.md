import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { ROOT, load, validate, markdown } from '../tools/fieldnote.mjs';

const minimal = () => ({ component: 'dialog', notes: [] });
const cli = (...args) => {
  const result = spawnSync(process.execPath, [join(ROOT, 'tools/fieldnote.mjs'), ...args], { encoding: 'utf8', cwd: ROOT });
  if (result.error) throw result.error;
  return result;
};
function fixture(t, contents) {
  const dir = mkdtempSync(join(tmpdir(), 'afs-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, 'test.fieldnote.yaml');
  writeFileSync(path, contents);
  return path;
}

test('minimal records and placeholders need no metadata or workflow', () => {
  assert.deepEqual(validate(minimal()), []);
  assert.deepEqual(validate({ component: 'dialog', notes: [{ id: 'name' }] }), []);
  assert.match(markdown(minimal()), /No notes recorded yet/);
  assert.match(markdown({ component: 'dialog', notes: [{ id: 'name' }] }), /Placeholder/);
});

test('optional shared fields allow questions and statements together', () => {
  const note = { id: 'focus', topic: 'local topic', statement: 'Focus Cancel.', question: 'Where should focus go?', reason: 'Avoid accidental deletion.', references: ['Project guidance', { title: 'Local policy', section: 3 }] };
  assert.deepEqual(validate({ ...minimal(), notes: [note] }), []);
  assert.deepEqual(validate({ ...minimal(), $schema: 'https://example.org/schema.json', schemaVersion: '0.3.0' }), []);
});

test('custom fields, nested context, and multilingual IDs are accepted and rendered', () => {
  const record = { component: '住所入力', language: 'ja', framework: 'native project', notes: [{ id: '住所.入力 / 名前', topic: '地域の事情', statement: '地域の形式に対応する。', owner: 'content team', context: { region: '日本', supported: ['ja', 'en'], pending: true }, references: [{ title: 'Team guidance', path: '../guidance.md' }] }] };
  assert.deepEqual(validate(record), []);
  const output = markdown(record);
  for (const text of ['ja', 'native project', 'content team', 'region: 日本', 'pending: true', '../guidance.md']) assert.ok(output.includes(text), text);
  assert.ok(output.includes(`id="note-${encodeURIComponent(record.notes[0].id)}"`));
  assert.ok(output.includes(record.notes[0].statement));
});

test('duplicate IDs are rejected within a file and compared case-sensitively', () => {
  assert.deepEqual(validate({ ...minimal(), notes: [{ id: 'name' }, { id: 'name' }] }), ['notes: duplicate IDs']);
  assert.deepEqual(validate({ ...minimal(), notes: [{ id: 'name' }, { id: 'Name' }] }), []);
  assert.deepEqual(validate({ component: 'other', notes: [{ id: 'name' }] }), []);
});

test('missing core data and malformed known fields fail', () => {
  const invalid = [null, [], {}, { component: 'dialog' }, { notes: [] }, { component: {}, notes: [] }, { component: ' ', notes: [] }, { component: 'dialog', notes: {} }, { ...minimal(), notes: [{}] }, { ...minimal(), notes: [{ id: 3 }] }, { ...minimal(), notes: [{ id: '\t' }] }];
  for (const key of ['topic', 'statement', 'question', 'reason']) for (const value of [null, '', '  ', 7]) invalid.push({ ...minimal(), notes: [{ id: 'name', [key]: value }] });
  for (const references of [null, 'url', [null], [''], [{}]]) invalid.push({ ...minimal(), notes: [{ id: 'name', references }] });
  for (const record of invalid) assert.ok(validate(record).length, JSON.stringify(record));
});

test('old explicit versions fail with migration guidance', () => {
  for (const version of ['0.1.0', '0.2.0', '9.0.0', null]) assert.match(validate({ ...minimal(), schemaVersion: version })[0], /migration/);
  assert.ok(validate({ component: { id: 'dialog' }, decisions: [] }).length);
});

test('custom scope-like fields are data, not interpreted behavior', () => {
  const record = { ...minimal(), configurations: ['project vocabulary'], notes: [{ id: 'name', appliesTo: 'my context', outcome: 'team comment' }] };
  assert.deepEqual(validate(record), []);
  for (const text of ['project vocabulary', 'my context', 'team comment']) assert.ok(markdown(record).includes(text));
});

test('rendered prose escapes markup and custom code fences stay enclosed', () => {
  const record = { component: '<script>bad</script>', notes: [{ id: 'a"<b>', statement: '**raw** <img>', details: '```\n<script>raw</script>\n```' }] };
  const output = markdown(record);
  for (const text of ['&lt;script&gt;bad&lt;/script&gt;', '\\*\\*raw\\*\\* &lt;img&gt;', 'id="note-a%22%3Cb%3E"', '````yaml', '<script>raw</script>']) assert.ok(output.includes(text), text);
});

test('rendering retains false/zero and leaves the source unchanged', () => {
  const record = { ...minimal(), notes: [{ id: 'note', count: 0, reviewed: false }] };
  const before = structuredClone(record);
  const output = markdown(record);
  assert.deepEqual(record, before);
  assert.ok(output.includes('count: 0'));
  assert.ok(output.includes('reviewed: false'));
  assert.throws(() => markdown({}), /required/);
});

test('shipped examples validate, JSON matches YAML, and generated docs stay current', () => {
  for (const directory of ['examples', 'examples/base']) for (const file of readdirSync(join(ROOT, directory)).filter(name => /\.fieldnote\.(yaml|json)$/.test(name))) assert.deepEqual(validate(load(join(ROOT, directory, file))), [], file);
  assert.deepEqual(load(join(ROOT, 'examples/dialogue.fieldnote.yaml')), load(join(ROOT, 'examples/dialogue.fieldnote.json')));
  for (const name of ['dialogue', 'button']) assert.equal(readFileSync(join(ROOT, `examples/${name}.accessibility.md`), 'utf8'), markdown(load(join(ROOT, `examples/${name}.fieldnote.yaml`))));
});

test('README starter is valid', () => {
  const yaml = readFileSync(join(ROOT, 'README.md'), 'utf8').match(/```yaml\n([\s\S]*?)```/)[1];
  assert.deepEqual(validate(YAML.parse(yaml)), []);
});

test('CLI validates and renders external custom records', t => {
  const file = fixture(t, 'component: other-project\nnotes:\n  - id: name\n    question: What names it?\n    owner: design\n');
  const validation = cli('validate', file);
  assert.equal(validation.status, 0, validation.stderr);
  assert.match(validation.stdout, /valid/);
  const rendered = cli('render', file);
  assert.equal(rendered.status, 0, rendered.stderr);
  assert.match(rendered.stdout, /owner: design/);
});

test('CLI errors on duplicate IDs, invalid YAML, and missing files', t => {
  for (const text of ['component: x\nnotes: [{id: a}, {id: a}]', 'component: [broken', 'component: x\ncomponent: y\nnotes: []']) {
    const result = cli('validate', fixture(t, text));
    assert.equal(result.status, 1);
    assert.ok(result.stderr.length);
  }
  assert.equal(cli('validate', join(tmpdir(), 'afs-no-such-file-327651.yaml')).status, 1);
});

test('CLI reports all files and rejects removed commands/options', t => {
  const bad = fixture(t, 'component: x\nnotes: [{id: a}, {id: a}]');
  const multiple = cli('validate', bad, 'examples/base/component.fieldnote.yaml');
  assert.equal(multiple.status, 1);
  assert.match(multiple.stdout, /component.fieldnote.yaml: valid/);
  for (const args of [[], ['resolve', 'examples/button.fieldnote.yaml'], ['validate', '--results', 'examples/button.fieldnote.yaml'], ['render', '--configuration', 'secondary', 'examples/button.fieldnote.yaml']]) assert.equal(cli(...args).status, 2, args.join(' '));
  assert.equal(cli('--help').status, 0);
});

test('current documentation local links resolve', () => {
  const paths = ['README.md', 'DIRECTION.md', 'CONTRIBUTING.md', 'examples/base/README.md', ...readdirSync(join(ROOT, 'docs')).filter(name => name.endsWith('.md')).map(name => `docs/${name}`)];
  for (const path of paths) for (const [, target] of readFileSync(join(ROOT, path), 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (/^[a-z]+:|^#/i.test(target)) continue;
    assert.ok(existsSync(resolve(ROOT, dirname(path), target.split('#')[0])), `${path}: ${target}`);
  }
});
