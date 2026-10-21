# Storefront template — usage guide

This repo doubles as a portable storefront template (Astro 7 + Tailwind v4, static build, no
runtime backend). Porting it to a new restaurant/project = **copy the code, declare the data
objects, rebrand, verify**. The code has no hardcoded business content: everything the site
shows comes from the fixture objects in `src/data/api/`.

## Quick path

1. Copy the template files (table below) into the new project; `pnpm install`.
2. Declare the 9 data objects in `src/data/api/` with the new restaurant's content.
3. Rebrand: `site` in `astro.config.mjs`, tokens in `src/storefront/styles/global.css`, assets in `public/`.
4. Verify: `pnpm build && node scripts/smoke.mjs` (update smoke expectations to the new data — see below).

## What to copy

| Path | Role |
| --- | --- |
| `src/storefront/` | The whole domain — the portable core: `services/` (data access + fallbacks), `types/` (contracts), `menu/` (blocks, cards, product detail), `commerce/` (cart), `layout/`, `ui/` (modals), `home/`, `enlaces/`, `icons/`, `scripts/`, `styles/`, `utils/` |
| `src/pages/` | The four routes: `index.astro` (landing), `menu.astro`, `galeria.astro`, `enlaces.astro` |
| `src/data/api/` | Fixture objects — copy as placeholders, then replace with your declared data |
| `public/` | Static assets (logos, images, favicon) |
| `astro.config.mjs`, `package.json`, `tsconfig.json`, `pnpm-lock.yaml` | Tooling — Astro, Tailwind v4 via `@tailwindcss/vite`, sitemap integration |
| `scripts/smoke.mjs` | End-to-end smoke over CDP (headless Chrome), no test framework needed |

Not portable by design: `doc/` (project history), `.env*` (local), `dist/` (build output).

## Objects to declare

All 9 live in `src/data/api/`. Every loader in `loadStorefront()` (`src/storefront/services/index.js`)
has a per-resource fallback, but a missing object means a missing section — declare them all.

| Object | Shape | Feeds |
| --- | --- | --- |
| `settings.json` | `{ data: {...} }` — the business object (see below) | Header, footer, WhatsApp ordering, hours, SEO, geo, i18n |
| `menu.json` | `{ data: { blocks: [ { id, categories: [ { id, name, description, block_id, products: [...] } ] } ] } }` | The menu page and product dialogs |
| `combos.json` | `{ data: [ { id, name, description, image, price, price_before } ] }` | Combo cards (`price_before` renders the struck-through price) |
| `promotions.json` | `{ data: [ { id, name, description, image, price, price_before, valid_until } ] }` | Promotion cards + dialog hosts |
| `gallery.json` | `{ data: [ { id, title, category, type, url, alt, description, aspect_ratio?, embed_html? } ] }` | `/galeria` masonry; `type` = `image` \| `video` \| `embed` |
| `landing.json` | `{ meta, blocks: [ { type, ... } ] }` | Declarative landing blocks — block types render via `src/storefront/home/` |
| `enlaces.json` | `{ meta, blocks: [ { type, enabled, ... } ] }` | Linktree page; blocks with `enabled: false` are filtered out; types: `link`, `banner`, `product-carousel`, `video`, `gallery-grid` |
| `decorations.json` | `{ background, header_background, footer_background, blocks, block1, block3, block6 }` | Visual decoration overlays |
| `flyers.json` | `{ enabled, delay_seconds, show_once_per_session, items }` | Flyer modal popup |

### Product shape (menu / combos / promotions)

```jsonc
{
  "id": "…",                  // stable id — dialog hosts and cart keys derive from it
  "name": "…",
  "description": "…",
  "image": { "url": "…", "alt": "…" },
  "price": 18,                 // flat price (number)
  "price_range": {             // range pricing — TemplateCard routes on its presence
    "id": "…", "name": "Makis",
    "entries": [ { "qty": 12, "price": 18 } ],
    "min_price": 18, "max_price": 63
  },
  "qty_label": "…",            // units wording; use entryLabel() helpers in utils
  "is_recommended": false,     // drives "recomendado" placement on the landing
  "is_hidden": false,          // hidden products never render
  "category_id": "…"           // back-reference to its category
}
```

`price` vs `price_range`: the card router (`TemplateCard`) renders flat vs range designs by
whether a range exists — see `doc/menu-cards.md`. Labels/wording for ranges follow the v2
contract in `doc/proposal-api-v2.md`.

### Settings object (the one you declare first)

Required for a working site:

| Key | Purpose |
| --- | --- |
| `name`, `phone`, `address` | Identity + contact |
| `whatsapp.number`, `whatsapp.message_template` | Ordering deep-links (message is pre-filled) |
| `timezone`, `currency`, `language` | Hours, prices, copy locale |
| `delivery { enabled, fee, zones }` | Delivery fee logic |
| `payment_methods` | Checkout display |
| `business_hours` | Per-weekday `{ isOpen, open, close }` keyed by ISO weekdays (`mon`…`sun`) — drives the open/closed badge |
| `seo { site_name, title, title_template, description, keywords, og_image, twitter_card, locale, json_ld }` | `<head>` + structured data |
| `social_media`, `google_maps`, `geo { lat, lng }` | Footer links, maps, location |
| `max_order_quantity` | Cart cap |

## Configure

- **`astro.config.mjs` → `site`**: set the production origin (feeds the sitemap integration).
- **Data mode** (`PUBLIC_DATA_MODE` env): unset/anything → LOCAL (reads the fixtures — default,
  zero network). `=api` → live Google Apps Script endpoint with a v1→v2 adapter (temporary;
  see `doc/proposal-api-v2.md` for the target contract).
- **Brand tokens**: colors and fonts live in `src/storefront/styles/global.css` (Tailwind v4
  `@theme`). Change tokens there — never hardcode colors in components.
- **Design slots**: per-block card designs are wired in `src/pages/menu.astro` — the port point
  documented in `doc/menu-cards.md`.

## Verification

1. `pnpm build` — expects 4 pages.
2. `node scripts/smoke.mjs` — drives headless Chrome over CDP against the preview server
   (`pnpm preview`, default `localhost:4322`). Checks: menu card/dialog counts, cart flows,
   gallery items/modal, landing CTA, footer links.
3. **Gotcha — data-pinned assertions**: a few smoke checks snapshot *this* repo's fixtures
   (gallery `>= 21` items, a category heading `Rolls`, exactly 3 landing CTA cards). After
   declaring your own data, update those expectations in `scripts/smoke.mjs` — they are data
   snapshots, not invariants. Menu checks are count-free (`> 0`), so they port as-is.
4. Manual browser pass at 1440px and 390px.

## Page references

- `doc/pages/index.md` — landing block architecture
- `doc/pages/enlaces.md` — linktree block types
- `doc/pages/galeria.md` — gallery masonry + media contracts
- `doc/menu-cards.md` — card design system and how to swap a design
- `doc/proposal-api-v2.md` — the data contract (v2) the fixtures target
