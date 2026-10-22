# Changelog

All notable changes to `create-digital-menu` are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/) — versions are semver.

## 0.1.1 — 2026-10-21

### Fixed

- Ship the template ignore rules as `_gitignore` and materialize `.gitignore`
  during scaffolding: npm renames `.gitignore` to `.npmignore` when a package is
  installed, which left projects scaffolded from npm without ignore rules.
- Scaffold tests now assert `.gitignore` exists and no `_gitignore` /
  `.npmignore` residue remains.

## 0.1.0 — 2026-10-21

### Added

- Initial release of the `create-digital-menu` scaffolder (zero-dependency Node CLI):
  template copy, package rename, `.template.json` provenance, `git init` +
  initial commit, optional `upstream` remote (`--upstream`, `--no-git`).
- Portable storefront template: Astro 7 + Tailwind v4, storefront domain
  (`src/storefront/`), Zod v2 data contract, endpoint manifest, update zones
  with `.gitattributes merge=ours` protection, smoke-test gate with
  data-pinned expectations (`scripts/smoke-data.json`).
- Generic demo brand “Sazón Digital” with placeholder contact data and
  placeholder images (no client assets, no commercial fonts).

### Notes

- Template fixture images point at `picsum.photos` placeholders — replace them
  with your own media in real projects.
