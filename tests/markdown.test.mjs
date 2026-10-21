import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { lintMarkdown } from '../tools/markdown.mjs';

const header = '---\nschemaVersion: "0.4.0"\ncomponent: {id: button, platform: web}\n';
const doc = (body = '', extra = '') => header + extra + '---\n\n## Notes\n\n' + body;
const note = '### Name\n\n- ID: `name`\n\nVisible name.\n';
const check = '\n## Checks\n\n### Inspect\n\n- ID: `check`\n- Notes: `name`\n- Method: `manual`\n\nInspect the name.\n';
const errors = source => lintMarkdown(source).diagnostics.filter(d => d.severity === 'error');
const codes = source => errors(source).map(d => d.code);

test('starter and promoted button validate, preserving IDs and scopes', () => {
  for (const file of ['examples/base/component.fieldnote.md', 'examples/button.fieldnote.md']) {
    const source = readFileSync(file, 'utf8');
    assert.deepEqual(lintMarkdown(source).diagnostics, []);
  }
  const result = lintMarkdown(readFileSync('examples/button.fieldnote.md', 'utf8'));
  assert.equal(result.notes.length, 7);
  assert.equal(result.checks.length, 3);
  assert.equal(result.metadata.configurations.length, 4);
  assert.deepEqual(result.checks[2].appliesTo, ['secondary']);
  const readme = readFileSync('README.md', 'utf8').match(/````markdown\n([\s\S]*?)````/)[1];
  assert.deepEqual(errors(readme), []);
});

test('metadata errors are actionable and malformed headers never throw', () => {
  for (const source of ['', doc().replace('0.4.0','0.3.0'), doc().replace('platform: web','platform: null'), doc('', 'component: {}\n'), doc('', 'notes: []\n'), doc('', 'bad: [\n'), '---\nnull\n---\n## Notes']) {
    assert.ok(errors(source).length, source);
  }
  assert.deepEqual(errors('\uFEFF' + doc(note).replaceAll('\n','\r\n')), []);
});

test('custom context, statuses, languages, prose, and original source survive parsing', () => {
  const source = doc(note.replace('`name`','`名前 / α`').replace('\n\nVisible', '\n- Owner: Designer\n- Status: `地域のレビュー`\n\nVisible') + '\n## Project context\n\nCustom prose.\n', 'locale: ja\n');
  const r = lintMarkdown(source);
  assert.deepEqual(errors(source), []);
  assert.equal(r.source, source);
  assert.equal(r.metadata.locale, 'ja');
  assert.equal(r.notes[0].id, '名前 / α');
  assert.equal(r.notes[0].status, '地域のレビュー');
  assert.equal(r.notes[0].body, 'Visible name.');
});

test('code fences, nested lists, and blockquotes cannot create records', () => {
  const source = doc(note + '\n```md\n## Notes\n### Fake\n- ID: `fake`\n```\n\n> ### Quoted\n> - ID: `quoted`\n\n- nested\n  ### Nested\n\n#### Explanation\n\nMore detail.\n');
  const r = lintMarkdown(source);
  assert.deepEqual(r.diagnostics, []);
  assert.equal(r.notes.length, 1);
  assert.match(r.notes[0].body, /### Fake/);
});

test('duplicate sections, labels and IDs are errors with source lines', () => {
  for (const [source, code] of [[doc(note+note),'duplicate-id'], [doc(note+'\n## Notes\n'), 'duplicate-section'], [doc(note.replace('- ID: `name`','- ID: `name`\n- ID: `other`')),'duplicate-label'], [doc('', 'configurations: [{id: a, name: A}, {id: a, name: B}]\n'), 'duplicate-id']]) assert.ok(codes(source).includes(code));
  assert.equal(lintMarkdown(doc(note+note)).diagnostics.find(d=>d.code==='duplicate-id').line, 13);
});

test('entry metadata must have the right structure and required fields', () => {
  for (const mutation of ['- ID: name','- ID: `a` `b`','- ID: ``','- ID: `name` trailing','- ID: `name`\n  - nested','1. ID: `name`','Paragraph first.\n\n- ID: `name`']) assert.ok(errors(doc(note.replace('- ID: `name`',mutation))).length, mutation);
  for (const source of [doc(note+check.replace('- Method: `manual`','')), doc(note+check.replace('- Notes: `name`','')), doc(note.replace('- ID: `name`','- ID: `name`\n- Notes: `name`')), doc('#### Wrong level\n')]) assert.ok(errors(source).length);
});

test('reference checks reject missing, repeated, and incompatible targets', () => {
  const config = 'configurations: [{id: a, name: A}, {id: b, name: B}]\n';
  assert.deepEqual(errors(doc(note+check,config)), []);
  assert.ok(codes(doc(note+check.replace('Notes: `name`','Notes: `missing`'))).includes('unknown-note'));
  assert.ok(codes(doc(note+check.replace('Notes: `name`','Notes: `name`, `name`'))).includes('duplicate-reference'));
  const scoped = note.replace('- ID: `name`','- ID: `name`\n- Applies to: `a`');
  assert.ok(codes(doc(scoped)).includes('unknown-configuration'));
  assert.ok(codes(doc(scoped+check,config)).includes('scope'));
  assert.deepEqual(errors(doc(scoped+check.replace('- Method: `manual`','- Method: `local-review`\n- Applies to: `a`'),config)), []);
  assert.ok(codes(doc(scoped+check.replace('- Method: `manual`','- Method: `manual`\n- Applies to: `b`'),config)).includes('scope'));
});

test('empty collections allowed, empty bodies warn, Notes section required', () => {
  assert.deepEqual(lintMarkdown(doc()).diagnostics, []);
  const r = lintMarkdown(doc(note.replace('Visible name.','')));
  assert.equal(r.diagnostics[0].severity, 'warning');
  assert.deepEqual(errors(doc(note.replace('Visible name.',''))), []);
  assert.ok(codes(doc().replace('## Notes','## Context')).includes('required-section'));
});

test('CLI checks all files, emits JSON, preserves source, and handles usage/read errors', t => {
  const dir = mkdtempSync(join(tmpdir(),'afs-md-')); t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const good = join(dir,'good.fieldnote.md'), bad = join(dir,'bad.fieldnote.md');
  writeFileSync(good,doc(note)); writeFileSync(bad,doc(note+note));
  const cli = (...args) => { const r=spawnSync(process.execPath,['tools/fieldnote.mjs',...args],{encoding:'utf8'}); if(r.error) throw r.error; return r; };
  const r=cli('lint',good,bad,'--json');
  assert.equal(r.status,1,r.stderr);
  const reports=JSON.parse(r.stdout); assert.equal(reports.length,2); assert.deepEqual(reports[0].diagnostics,[]); assert.equal(reports[1].diagnostics[0].code,'duplicate-id');
  assert.equal(readFileSync(good,'utf8'),doc(note));
  assert.equal(cli('validate',good).status,0);
  assert.equal(cli('lint',join(dir,'missing.md')).status,1);
  assert.equal(cli('lint','examples/button.fieldnote.yaml').status,1);
  for(const args of [['lint'],['lint',good,'--configuration','a'],['lint',good,'--unknown']]) assert.equal(cli(...args).status,2);
  assert.match(cli('validate','examples/button.fieldnote.yaml').stderr,/Deprecated/);
});
