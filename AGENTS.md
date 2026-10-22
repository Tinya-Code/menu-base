## Project

Template repository for digital menu storefronts, home of the
`create-digital-menu` npm scaffolder (`packages/create-digital-menu/`).
Package manager: `pnpm` (Node >= 22 for the template, >= 20 for the CLI).

The template itself lives at `packages/create-digital-menu/template/` and is a
standalone Astro project: run commands from inside that directory.

## Development

Work on the template from its directory:

```bash
cd packages/create-digital-menu/template
pnpm install
pnpm dev                 # background mode when available
pnpm build                # must produce 4 pages (/, /menu, /galeria, /enlaces)
pnpm preview &
node scripts/smoke.mjs    # gate: 0 console problems
```

When starting the dev server prefer background mode (`astro dev --background`,
then `astro dev stop` / `astro dev status` / `astro dev logs`).

## Data mode

`PUBLIC_DATA_MODE` (env/.env) switches the data source:

- **Default (LOCAL)**: fixtures in `src/data/api/*.json` — no network calls.
- **`api`**: live mode fetching the owner's Google Apps Script endpoint (v1),
  adapted to the v2 contract (`// TEMP: v1→v2 adapter`).

Fixtures are the source of truth for local development and the target shape of
the API migration (see `doc/proposal-api-v2.md`).

## Update zones (template policy)

See `template/doc/template-guide.md` — “What to copy” and “Update zones”:

- **Core** (`src/storefront/`, `src/pages/`, `scripts/smoke.mjs`): template
  code; consumers do not edit (extend via seams).
- **App** (`src/data/api/*.json`, `src/styles/tokens.css`, `public/`,
  `scripts/smoke-data.json`): site-specific; protected with
  `.gitattributes merge=ours`.
- **Composition**: customized parts of `src/pages/*.astro` (manual conflicts).

Edit fixtures/tokens, never components, for site-specific needs.

## Verification

No test runner/linter/CI configured. The gate is `pnpm build` + the smoke
script against a running preview. `scripts/smoke.mjs` takes `PREVIEW_URL` and
`CHROME_PATH` env overrides. For scripted UI checks drive
`chrome-headless-shell` (Playwright cache) over CDP.

## Conventions

- Technical artifacts (code, docs, commits) in English; conventional commits;
  no AI attribution in commits.
- Keep the CLI zero-dependency (Node built-ins only).
- Never commit `node_modules`, `dist`, `.astro`, `.env*`.
