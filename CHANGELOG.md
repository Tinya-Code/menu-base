# Changelog

All notable changes to `create-digital-menu` are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/) — versions are semver.

## 0.2.0 — 2026-10-21

### Changed

- Ship a slim, fully generic package: drop `public/images/` and `public/fonts/`
  from the template (13.9 MB → 0.6 MB unpacked, 138 files).
- Decoration fixtures now point at remote URLs: the `fila-*` decorations use
  their original Cloudinary links, and the remaining decorations/backgrounds
  use `picsum.photos` placeholders. Hardcoded `/images/*` defaults in
  `menu-page.astro`, `product-detail.astro`, `endpoints.js`, and
  `developer-signature.astro` were replaced with remote URLs.
- Load Noto Sans from the Google Fonts CDN (preconnect + stylesheet in
  `Layout.astro`); remove the local `@font-face` declarations from
  `tokens.css`. Self-hosting fonts is still documented as an option in that
  file's comment.

## 0.1.2 — 2026-10-21

### Fixed

- Restore `template/.gitignore` as the pack-time ignore source (it must exist
  in the tree so npm-packlist excludes `node_modules`, `dist`, and `.astro`),
  and normalize whatever the installer delivers: the CLI maps an installed
  `.npmignore` (npm's rename of `.gitignore`) back to `.gitignore` and removes
  residue. This fixes the 0.1.1 tarball, which shipped ~10k dependency files.

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
