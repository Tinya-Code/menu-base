import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../cli.js', import.meta.url));

const scratch = mkdtempSync(join(tmpdir(), 'create-digital-menu-'));

const run = (args, cwd = scratch) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });

test.after(() => rmSync(scratch, { recursive: true, force: true }));

test('scaffolds the template into a new directory', () => {
  const res = run(['my-menu']);
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /Template copied/);

  const dir = join(scratch, 'my-menu');
  for (const file of [
    'astro.config.mjs',
    'src/pages/index.astro',
    'src/data/api/settings.json',
    'src/styles/tokens.css',
    'scripts/smoke.mjs',
    'doc/template-guide.md',
    '.gitattributes',
    'package.json',
    '.template.json',
  ]) {
    assert.ok(existsSync(join(dir, file)), `missing ${file}`);
  }

  // Excluded: dependencies, build output, env, repo internals of the source.
  assert.ok(!existsSync(join(dir, 'node_modules')));
  assert.ok(!existsSync(join(dir, 'dist')));
  assert.ok(!existsSync(join(dir, '.env')));
  assert.ok(!existsSync(join(dir, 'AGENTS.md')), 'repo bookkeeping must not ship');

  // Package renamed after the target folder.
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'my-menu');

  // Provenance record.
  const provenance = JSON.parse(readFileSync(join(dir, '.template.json'), 'utf8'));
  assert.equal(provenance.template, 'create-digital-menu');
  assert.match(provenance.version, /^\d+\.\d+\.\d+/);

  // git init + initial commit happened by default.
  assert.ok(existsSync(join(dir, '.git')), 'git repo expected by default');
});

test('--no-git skips repository initialization', () => {
  const res = run(['plain-copy', '--no-git']);
  assert.equal(res.status, 0, res.stderr);
  assert.ok(!existsSync(join(scratch, 'plain-copy/.git')));
});

test('refuses a non-empty target directory', () => {
  const dir = join(scratch, 'occupied');
  mkdirSync(dir);
  writeFileSync(join(dir, 'keep.txt'), 'hi');

  const res = run(['occupied']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /not empty/);
  assert.ok(existsSync(join(dir, 'keep.txt')), 'existing file must stay untouched');
});

test('--help prints usage and exits 0', () => {
  const res = run(['--help']);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /Usage:/);
  assert.match(res.stdout, /--upstream/);
});
