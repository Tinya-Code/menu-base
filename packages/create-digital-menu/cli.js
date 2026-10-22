#!/usr/bin/env node
/**
 * create-digital-menu — scaffold a digital menu storefront.
 * Zero runtime dependencies; Node >= 20 (fs.cpSync).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8'));
const TEMPLATE_DIR = fileURLToPath(new URL('./template/', import.meta.url));

const EXCLUDE_NAMES = new Set(['node_modules', 'dist', '.git', '.astro', '.DS_Store']);
const isEnvFile = (name) => name === '.env' || name.startsWith('.env.');

function usage() {
  console.log(`
create-digital-menu v${pkg.version}

Usage:
  npm create digital-menu [dir] [options]

Scaffolds the template into [dir] (default: current directory),
renames the package after the target folder, initializes git, and
adds an 'upstream' remote pointing at this template when known.

Options:
  --upstream <url>   Git URL to register as the 'upstream' remote
  --no-git           Skip git init and the initial commit
  -h, --help         Show this help

Examples:
  npm create digital-menu
  npm create digital-menu my-menu
  npm create digital-menu . --upstream https://github.com/you/digital-menu
`);
}

// ── arguments ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
let target = '.';
let upstream = null;
let git = true;

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '-h' || arg === '--help') {
    usage();
    process.exit(0);
  }
  if (arg === '--no-git') {
    git = false;
    continue;
  }
  if (arg === '--upstream') {
    upstream = argv[++i] ?? null;
    continue;
  }
  if (arg.startsWith('-')) {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
  if (target !== '.') {
    console.error('Only one target directory is supported.');
    process.exit(1);
  }
  target = arg;
}

const dir = resolve(process.cwd(), target);

// ── target must be empty (or missing) ────────────────────────────────────────
if (existsSync(dir)) {
  const entries = readdirSync(dir).filter((name) => name !== '.git');
  if (entries.length > 0) {
    console.error(`Target "${dir}" is not empty (${entries.length} entries). Use an empty directory.`);
    process.exit(1);
  }
} else {
  mkdirSync(dir, { recursive: true });
}

// ── copy the bundled template ────────────────────────────────────────────────
cpSync(TEMPLATE_DIR, dir, {
  recursive: true,
  filter: (src) => !EXCLUDE_NAMES.has(basename(src)) && !isEnvFile(basename(src)),
});
console.log(`✔ Template copied to ${dir}`);

// npm renames .gitignore -> .npmignore when installing packages, so the
// template ships `_gitignore`; materialize the real file here.
const shippedIgnore = join(dir, '_gitignore');
if (existsSync(shippedIgnore)) {
  renameSync(shippedIgnore, join(dir, '.gitignore'));
}

// ── package name = target folder slug ────────────────────────────────────────
const slug =
  basename(dir)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'digital-menu';

const pkgFile = join(dir, 'package.json');
if (existsSync(pkgFile)) {
  const projectPkg = JSON.parse(readFileSync(pkgFile, 'utf8'));
  projectPkg.name = slug;
  writeFileSync(pkgFile, `${JSON.stringify(projectPkg, null, 2)}\n`);
}

writeFileSync(
  join(dir, '.template.json'),
  `${JSON.stringify({ template: pkg.name, version: pkg.version, created: new Date().toISOString() }, null, 2)}\n`,
);
console.log(`✔ Package "${slug}" + .template.json written`);

// ── git init, initial commit, upstream remote ────────────────────────────────
if (git) {
  const run = (args) => spawnSync('git', args, { cwd: dir, stdio: 'pipe' });
  if (run(['init']).status !== 0) {
    console.warn('⚠ git init skipped (is git installed?)');
  } else {
    run(['add', '-A']);
    if (run(['commit', '-m', `chore: scaffold from ${pkg.name} v${pkg.version}`]).status !== 0) {
      console.warn('⚠ Initial commit skipped (configure git user.name / user.email)');
    }
    const repositoryUrl = pkg.repository?.url;
    const remoteUrl = upstream || repositoryUrl;
    if (remoteUrl) {
      const normalized = remoteUrl.replace(/^git\+/, '').replace(/^ssh:\/\/git@/, 'https://');
      if (run(['remote', 'add', 'upstream', normalized]).status === 0) {
        console.log(`✔ git remote upstream → ${normalized}`);
      }
    } else {
      console.log('ℹ No upstream URL yet — add one later: git remote add upstream <repo-url>');
    }
  }
}

// ── next steps ───────────────────────────────────────────────────────────────
const cdTarget = target === '.' ? '' : `cd ${target} && `;
console.log(`
Next steps:
  ${cdTarget}pnpm install        (or: npm install)
  pnpm dev               # http://localhost:4321
  pnpm build && pnpm preview && node scripts/smoke.mjs

Your brand:   src/styles/tokens.css
Your data:    src/data/api/*.json
Read first:   doc/template-guide.md (copy zones + update policy)
`);
