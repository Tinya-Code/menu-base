## Project

Astro 7 storefront for "Mr Nikkei 6.9" (sushi delivery, Lima). Package manager: `pnpm` (Node >= 22.12). Scripts: `pnpm dev` / `pnpm build` / `pnpm preview`.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. The same background wrapper applies to `astro preview`.

## Data mode (read this first)

The menu data source is switched by the `PUBLIC_DATA_MODE` env var:

- **Default (unset or anything but `api`): LOCAL mode.** The storefront reads fixtures from `src/data/api/*.json` — no network calls at runtime.
- **`PUBLIC_DATA_MODE=api` (set in `.env`): live mode.** Fetches the owner's Google Apps Script API (v1). A TEMP adapter in the services maps v1 responses to the v2 contract (marked `// TEMP: v1→v2 adapter` — delete once the GAS endpoint emits v2).

The v2 contract is documented in `doc/proposal-api-v2.md`. The fixtures are the source of truth for local development and the target shape of the API migration: products carry an embedded `price_range`, `image` is `{url, alt}`, prices are numbers, `settings` is nested with `seo`/`timezone`/ISO weekday keys, and combos/promotions share one shape with `price_before`.

## Architecture

- `src/storefront/` — the whole domain: `services/` (data access), `menu/` (blocks, cards, product-detail), `commerce/` (cart, add-button), `layout/`, `ui/` (modals), `icons/`, `scripts/`, `styles/`, `utils/`, `types/`.
- `src/pages/index.astro` — the single page and orchestrator: it resolves all data server-side, owns click delegation (`document.addEventListener`, no event bus module) and is the single owner of cart mutations.
- Data services expose `loadStorefront()` (`src/storefront/services/index.js`) which loads menu/settings/combos/promotions in parallel with per-resource fallbacks.
- Dialogs are pre-rendered, one hidden host per product **and** promotion (`data-product-detail-host="<id>"`), revealed by id on card click. `ProductDetail` accepts `MenuProduct | Promotion`.
- Decorations and flyers also come from `src/data/api/` (`decorations.json`, `flyers.json`).

## Verification

There is no test runner, linter, typecheck script, or CI configured. Verify changes with `pnpm build` plus a manual browser pass; for scripted UI checks, drive `chrome-headless-shell` (`~/Library/Caches/ms-playwright/`) over CDP on the preview server. Note: when the preview port is contested the server binds IPv6-only — probe it via `http://[::1]:<port>/`.

The sitemap integration warns because `astro.config.mjs` has no `site` option; it is expected and harmless locally.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
