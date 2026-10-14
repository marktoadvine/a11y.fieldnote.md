import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { ROOT, load, validate, markdown, resolveConfiguration } from '../tools/fieldnote.mjs';

const minimal = () => ({ schemaVersion: '0.3.0', component: { id: 'dialog', platform: 'web' }, notes: [] });
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

test('versioned component records allow minimal notes and placeholders', () => {
  assert.deepEqual(validate(minimal()), []);
  assert.deepEqual(validate({ ...minimal(), notes: [{ id: 'name' }] }), []);
  assert.match(markdown(minimal()), /No notes recorded yet/);
  assert.match(markdown({ ...minimal(), notes: [{ id: 'name' }] }), /Placeholder/);
});

test('optional shared fields allow questions and statements together', () => {
  const note = { id: 'focus', topic: 'local topic', statement: 'Focus Cancel.', question: 'Where should focus go?', reason: 'Avoid accidental deletion.', references: ['Project guidance', { title: 'Local policy', section: 3 }] };
  assert.deepEqual(validate({ ...minimal(), notes: [note] }), []);
  assert.deepEqual(validate({ ...minimal(), $schema: 'https://example.org/schema.json', schemaVersion: '0.3.0' }), []);
});

test('custom fields, nested context, and multilingual IDs are accepted and rendered', () => {
  const record = { ...minimal(), component: { id: '住所入力', platform: 'native' }, language: 'ja', framework: 'native project', notes: [{ id: '住所.入力 / 名前', topic: '地域の事情', statement: '地域の形式に対応する。', owner: 'content team', context: { region: '日本', supported: ['ja', 'en'], pending: true }, references: [{ title: 'Team guidance', path: '../guidance.md' }] }] };
  assert.deepEqual(validate(record), []);
  const output = markdown(record);
  for (const text of ['ja', 'native project', 'content team', 'region: 日本', 'pending: true', '../guidance.md']) assert.ok(output.includes(text), text);
  assert.ok(output.includes(`id="note-${encodeURIComponent(record.notes[0].id)}"`));
  assert.ok(output.includes(record.notes[0].statement));
});

test('duplicate IDs are rejected within a file and compared case-sensitively', () => {
  assert.deepEqual(validate({ ...minimal(), notes: [{ id: 'name' }, { id: 'name' }] }), ['notes: duplicate IDs']);
  assert.deepEqual(validate({ ...minimal(), notes: [{ id: 'name' }, { id: 'Name' }] }), []);
  assert.deepEqual(validate({ ...minimal(), component: { id: 'other', platform: 'ios' }, notes: [{ id: 'name' }] }), []);
});

test('missing core data and malformed known fields fail', () => {
  const invalid = [null, [], {}, { component: 'dialog' }, { notes: [] }, { component: {}, notes: [] }, { component: ' ', notes: [] }, { component: 'dialog', notes: {} }, { ...minimal(), notes: [{}] }, { ...minimal(), notes: [{ id: 3 }] }, { ...minimal(), notes: [{ id: '\t' }] }];
  for (const key of ['topic', 'statement', 'question', 'reason']) for (const value of [null, '', '  ', 7]) invalid.push({ ...minimal(), notes: [{ id: 'name', [key]: value }] });
  for (const references of [null, 'url', [null], [''], [{}]]) invalid.push({ ...minimal(), notes: [{ id: 'name', references }] });
  for (const record of invalid) assert.ok(validate(record).length, JSON.stringify(record));
});

test('missing and unsupported schema versions fail', () => {
  for (const version of ['0.1.0', '0.2.0', '9.0.0', null, undefined]) assert.match(validate({ ...minimal(), schemaVersion: version })[0], /schemaVersion: expected 0.3.0/);
  assert.ok(validate({ component: { id: 'dialog' }, decisions: [] }).length);
});

test('rendered prose escapes markup and custom code fences stay enclosed', () => {
  const record = { ...minimal(), component: { id: '<script>bad</script>', platform: 'web' }, notes: [{ id: 'a"<b>', statement: '**raw** <img>', details: '```\n<script>raw</script>\n```' }] };
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
  assert.throws(() => markdown({}), /schemaVersion/);
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

test('component id and platform are required; references accept URLs and paths', () => {
  for (const component of ['dialog', {}, { id: 'dialog' }, { platform: 'web' }, { id: '', platform: 'web' }, { id: 'dialog', platform: ' ' }]) {
    assert.ok(validate({ ...minimal(), component }).length, JSON.stringify(component));
  }
  const record = minimal();
  record.component.references = [{ kind: 'figma', url: 'https://www.figma.com/design/example?node-id=1-2' }, { kind: 'storybook', url: 'https://example.com/storybook/' }, { kind: 'code', path: '../../components/dialog/', owner: 'team' }];
  record.component.version = 'build-42';
  record.component.locale = 'fr';
  assert.deepEqual(validate(record), []);
  const rendered = markdown(record);
  for (const text of ['figma', 'storybook', '../../components/dialog/', 'locale: fr', 'build']) assert.ok(rendered.includes(text));
  for (const ref of [{}, { kind: 'code' }, { url: 'not a URI' }, { path: ' ' }]) {
    record.component.references = [ref];
    assert.ok(validate(record).length, JSON.stringify(ref));
  }
});

test('benchmarks retain source/version and accept custom metadata', () => {
  const record = { ...minimal(), benchmarks: [{ name: 'WCAG', version: '2.2', url: 'https://www.w3.org/TR/WCAG22/', region: 'project-defined' }] };
  assert.deepEqual(validate(record), []);
  for (const text of ['Benchmarks', 'WCAG', '2.2', 'https://www.w3.org/TR/WCAG22/', 'project-defined']) assert.ok(markdown(record).includes(text));
  for (const key of ['name', 'version', 'url']) {
    const invalid = structuredClone(record);
    delete invalid.benchmarks[0][key];
    assert.ok(validate(invalid).length);
  }
});

test('standard statuses enforce meaningful content while custom workflows remain possible', () => {
  for (const note of [{ id: 'a' }, { id: 'a', status: 'open' }, { id: 'a', status: 'decided', statement: 'Use the title.' }, { id: 'a', status: 'not-applicable', reason: 'There is no motion.' }, { id: 'a', status: 'awaiting-local-review', owner: 'design' }]) {
    const record = { ...minimal(), notes: [note] };
    assert.deepEqual(validate(record), []);
    if (note.status) assert.match(markdown(record), /\*\*Status:\*\*/);
  }
  for (const note of [{ id: 'a', status: '' }, { id: 'a', status: 'decided' }, { id: 'a', status: 'not-applicable' }]) assert.ok(validate({ ...minimal(), notes: [note] }).length);
});

function configured() {
  return { ...minimal(), custom: { keep: true }, component: { id: 'button', platform: 'web', references: [{ path: './button.ts' }] },
    benchmarks: [{ name: 'WCAG', version: '2.2', url: 'https://www.w3.org/TR/WCAG22/' }],
    configurations: [{ id: 'primary', name: 'Primary' }, { id: 'secondary', name: 'Secondary', context: { locale: 'fr', highContrast: true } }],
    notes: [{ id: 'shared', status: 'decided', statement: 'Shared behavior.' }, { id: 'secondary-only', status: 'open', question: 'Which outline?', appliesTo: ['secondary'] }, { id: 'primary-only', statement: 'Primary behavior.', appliesTo: ['primary'] }],
    checks: [{ id: 'shared-test', notes: ['shared'], method: 'manual', procedure: 'Inspect it.', owner: 'team' }, { id: 'secondary-test', notes: ['shared', 'secondary-only'], method: 'assisted', procedure: 'Measure outline.', test: 'tests/secondary.ts', appliesTo: ['secondary'], environment: 'project-defined' }] };
}

test('configuration resolution is additive, preserves metadata, and never mutates input', () => {
  const record = configured();
  const before = structuredClone(record);
  assert.deepEqual(validate(record), []);
  const selected = resolveConfiguration(record, 'secondary');
  assert.deepEqual(selected.notes.map(n => n.id), ['shared', 'secondary-only']);
  assert.deepEqual(selected.checks.map(n => n.id), ['shared-test', 'secondary-test']);
  assert.deepEqual(selected.configurations.map(c => c.id), ['secondary']);
  assert.deepEqual(selected.component, record.component);
  assert.deepEqual(selected.benchmarks, record.benchmarks);
  assert.deepEqual(selected.custom, record.custom);
  assert.deepEqual(validate(selected), []);
  assert.deepEqual(record, before);
  const primary = resolveConfiguration(record, 'primary');
  assert.deepEqual(primary.notes.map(n => n.id), ['shared', 'primary-only']);
  assert.deepEqual(primary.checks.map(c => c.id), ['shared-test']);
  delete record.checks;
  assert.equal(resolveConfiguration(record, 'primary').checks, undefined);
  assert.throws(() => resolveConfiguration(record, 'missing'), /Unknown configuration/);
});

test('configuration IDs and appliesTo memberships must be valid and unique', () => {
  const mutations = [
    r => r.configurations.push(r.configurations[0]),
    r => r.notes[0].appliesTo = ['missing'],
    r => r.notes[0].appliesTo = [],
    r => r.notes[0].appliesTo = ['primary', 'primary'],
    r => r.checks[0].appliesTo = ['missing'],
    r => r.configurations = [],
    r => delete r.configurations,
  ];
  for (const mutate of mutations) { const record = configured(); mutate(record); assert.ok(validate(record).length); }
});

test('check definitions require note references and compatible scopes', () => {
  const mutations = [
    r => r.checks.push(r.checks[0]),
    r => r.checks[0].notes = ['missing'],
    r => r.checks[0].notes = [],
    r => r.checks[0].notes = ['shared', 'shared'],
    r => r.checks[0].notes = ['secondary-only'],
    r => r.checks[1].appliesTo = ['primary'],
    r => delete r.checks[0].procedure,
    r => delete r.checks[0].method,
  ];
  for (const mutate of mutations) { const record = configured(); mutate(record); assert.ok(validate(record).length); }
  const record = configured(); record.checks[0].method = 'local-review'; assert.deepEqual(validate(record), []);
  // Selection must not hide an invalid note/check in another configuration.
  record.checks[1].notes = ['missing'];
  assert.throws(() => resolveConfiguration(record, 'primary'), /unknown note/);
  assert.throws(() => markdown(record, 'primary'), /unknown note/);
});

test('selected rendering preserves scope, status, benchmarks, and test references', () => {
  const output = markdown(configured(), 'secondary');
  for (const text of ['**Status:** open', 'all documented configurations', '**Applies to:** secondary', 'tests/secondary.ts', './button.ts', 'WCAG', 'environment: project-defined', 'Procedures to perform', '#note-secondary-only']) assert.ok(output.includes(text), text);
  assert.ok(!output.includes('Primary behavior'));
  assert.equal(readFileSync(join(ROOT, 'examples/button-secondary.accessibility.md'), 'utf8'), markdown(load(join(ROOT, 'examples/button.fieldnote.yaml')), 'secondary'));
});

test('CLI renders and resolves configurations and rejects unknown selections', () => {
  const resolved = cli('resolve', 'examples/button.fieldnote.yaml', '--configuration', 'secondary');
  assert.equal(resolved.status, 0, resolved.stderr);
  assert.deepEqual(validate(JSON.parse(resolved.stdout)), []);
  const rendered = cli('render', 'examples/button.fieldnote.yaml', '--configuration', 'secondary');
  assert.equal(rendered.status, 0, rendered.stderr);
  assert.match(rendered.stdout, /Selected configuration/);
  assert.equal(cli('resolve', 'examples/button.fieldnote.yaml', '--configuration', 'missing').status, 1);
  assert.equal(cli('resolve', 'examples/button.fieldnote.yaml', 'examples/button.fieldnote.yaml', '--configuration', 'secondary').status, 2);
});

test('CLI validates and renders external custom records', t => {
  const file = fixture(t, 'schemaVersion: \"0.3.0\"\ncomponent: {id: other-project, platform: web}\nnotes:\n  - id: name\n    question: What names it?\n    owner: design\n');
  const validation = cli('validate', file);
  assert.equal(validation.status, 0, validation.stderr);
  assert.match(validation.stdout, /valid/);
  const rendered = cli('render', file);
  assert.equal(rendered.status, 0, rendered.stderr);
  assert.match(rendered.stdout, /owner: design/);
});

test('CLI errors on duplicate IDs, invalid YAML, and missing files', t => {
  for (const text of ['schemaVersion: \"0.3.0\"\ncomponent: {id: x, platform: web}\nnotes: [{id: a}, {id: a}]', 'component: [broken', 'component: x\ncomponent: y\nnotes: []']) {
    const result = cli('validate', fixture(t, text));
    assert.equal(result.status, 1);
    assert.ok(result.stderr.length);
  }
  assert.equal(cli('validate', join(tmpdir(), 'afs-no-such-file-327651.yaml')).status, 1);
});

test('CLI reports all files and rejects removed commands/options', t => {
  const bad = fixture(t, 'schemaVersion: \"0.3.0\"\ncomponent: {id: x, platform: web}\nnotes: [{id: a}, {id: a}]');
  const multiple = cli('validate', bad, 'examples/base/component.fieldnote.yaml');
  assert.equal(multiple.status, 1);
  assert.match(multiple.stdout, /component.fieldnote.yaml: valid/);
  for (const args of [[], ['resolve', 'examples/button.fieldnote.yaml'], ['validate', '--results', 'examples/button.fieldnote.yaml'], ['validate', '--configuration', 'secondary', 'examples/button.fieldnote.yaml']]) assert.equal(cli(...args).status, 2, args.join(' '));
  assert.equal(cli('--help').status, 0);
});

test('current documentation local links resolve', () => {
  const paths = ['README.md', 'DIRECTION.md', 'CONTRIBUTING.md', 'examples/base/README.md', ...readdirSync(join(ROOT, 'docs')).filter(name => name.endsWith('.md')).map(name => `docs/${name}`)];
  for (const path of paths) for (const [, target] of readFileSync(join(ROOT, path), 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (/^[a-z]+:|^#/i.test(target)) continue;
    assert.ok(existsSync(resolve(ROOT, dirname(path), target.split('#')[0])), `${path}: ${target}`);
  }
});


test('check links resolve to note anchors after browser fragment decoding', () => {
  const ids = ['plain-id', 'two words', '名前', 'adresse-é', '100%', 'literal%20name', 'part/section#name', 'a(b)', 'a)b(', 'quoted" & <name>'];
  const record = {
    ...minimal(),
    configurations: [{ id: 'one', name: 'One' }],
    notes: ids.map(id => ({ id, statement: 'A note.' })),
    checks: [{ id: 'navigation', notes: ids, method: 'manual', procedure: 'Follow each note link.' }],
  };
  for (const configuration of [undefined, 'one']) {
    const output = markdown(record, configuration);
    const anchors = [...output.matchAll(/<a id="(note-[^"]+)"><\/a>/g)].map(match => match[1]);
    const links = [...output.matchAll(/\]\(#([^()\s]+)\)/g)].map(match => match[1]);
    assert.equal(links.length, ids.length, 'every check reference has a complete Markdown destination');
    // Browsers percent-decode the fragment once before matching an element ID.
    const targets = links.map(fragment => decodeURIComponent(new URL('#' + fragment, 'https://example.com/notes').hash.slice(1)));
    assert.deepEqual(targets, anchors);
    assert.equal(links[0], 'note-plain-id', 'existing ASCII links remain stable');
  }
});
