import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { lintFiles } from './markdown.mjs';

const usage = 'Usage: node tools/fieldnote.mjs lint|validate FILE.fieldnote.md... [--json]';
export function main(args = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs({ args, options: {
      json: { type: 'boolean' }, help: { type: 'boolean', short: 'h' },
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
  if (!['lint', 'validate'].includes(command) || !files.length) {
    console.error(usage);
    return 2;
  }
  return lintFiles(files, options.values.json);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = main();
}
