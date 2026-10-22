# digital-menu

Template + scaffolder for digital menu storefronts (Astro 7, Tailwind v4, Zod-typed
data contract, WhatsApp/cart checkout, smoke-test gate).

## Layout

```
packages/create-digital-menu/    npm package: `npm create digital-menu`
├── cli.js                       zero-dependency Node scaffolder
├── template/                    the portable storefront (copied verbatim)
└── README.md                    npm landing page
```

## Use it (consumers)

```bash
npm create digital-menu my-menu
cd my-menu && pnpm install && pnpm dev
```

## Develop it (template repo)

```bash
cd packages/create-digital-menu/template
pnpm install
pnpm build                     # must produce 4 pages
pnpm preview &                 # http://localhost:4321 (port 4323 when the demo is up)
node scripts/smoke.mjs         # console must report 0 problems
```

Zones and update policy live in `packages/create-digital-menu/template/doc/template-guide.md`
(“What to copy” + “Update zones”): **Core** = storefront code (don't edit),
**App** = fixtures/tokens/public/smoke-data (yours; `merge=ours` protected),
**Composition** = page wiring (manual conflicts).

## Publish (maintainers)

1. Bump `packages/create-digital-menu/package.json` version + add a `CHANGELOG.md` entry.
2. Ensure `repository.url` points at this repo (the CLI uses it for the `upstream` remote).
3. `npm publish --access public` from `packages/create-digital-menu`.
4. Tag: `git tag v0.1.0 && git push --follow-tags` (human decision).

## Verification

No test runner/linter/CI: the gate is `pnpm build` + `node scripts/smoke.mjs`
against a running preview (override with `PREVIEW_URL=…`, `CHROME_PATH=…`).
