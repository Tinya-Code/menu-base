# Multi-page site: landing, menu, gallery, links

Source: user request (2026-10-20). Split the single-page storefront into four routes: `/` becomes a basic landing, the current storefront moves to `/menu`, and two new pages are added (`/galeria`, `/enlaces`). A new site header (logo centered → `/`, nav links Menú + Galería, no mobile variant) renders on the three new pages only; `/menu` keeps its branded header (its logo already links to `/`). The enlaces page is intentionally hidden from the nav (reachable from the landing). The existing footer is reused on the new pages via its current props.

Stack context: Astro ^7.3.8 (static output, zero framework islands), Tailwind ^4.3.3 CSS-first (`@theme` in `src/storefront/styles/global.css`), pnpm, GAS JSON API behind the local/live data switch (`PUBLIC_DATA_MODE`), domain root `src/storefront/`, data via `loadStorefront()` at build time.

## Restricciones

### Alcance (prohibido)
- No new dependencies (only astro, tailwindcss, @tailwindcss/vite, @astrojs/sitemap).
- Output stays `static` — no adapter/server routes/API endpoints; no API or fixture contract changes.
- No cart/dialog/menu logic changes: `/menu` content is byte-equivalent, only its route changes.
- No mobile hamburger/JS nav — the header is a single static row (explicit user decision).
- No 404 page, no CMS, no gallery endpoint.

### Estilo/código (obligatorio)
- Tailwind v4 CSS-first: tokens only in `@theme` of `src/storefront/styles/global.css`; no `tailwind.config.*`.
- Pages are thin orchestrators: data resolved server-side via `loadStorefront()` (or a service built on it), passed as props; no browser fetches.
- New components live under `src/storefront/` (layout/ for chrome); reuse existing icons from `src/storefront/icons/` and `precio`/`WhatsApp` utils.
- Comments: `<!-- -->` at top level, `{/* */}` inside expressions; technical artifacts in English.
- No `any` on props touched by this plan; typed props on every new component.

### Calidad (verificable)
- `pnpm build` green before any `- [x]`.
- `/menu` regression: the 11-check CDP smoke (chrome-headless-shell over CDP) stays green; no new `console` problems.
- Every new route verified in the browser via CDP: renders, nav links resolve, footer present, active nav state correct.
- dist markers preserved (`data-template-card`, `data-product-detail-host`, block order).

### Proceso
- One conventional commit per task; mark `- [x]` with the commit hash only after the task's verification ran.
- The plan file is the living state: close a phase by updating its checkboxes before reporting or starting the next phase.
- Verify with `pnpm build` + CDP smoke against the preview server (`http://[::1]:<port>/` when the port is contested).

## F1 — Site header + route split

Objetivo: standalone site header component, then split routes so `/menu` serves the current storefront and `/` exists as a minimal landing. Tasks in dependency order (component first, move, then landing).

- [x] Create the site header component (src/storefront/layout/site-header.astro: logo centered linking to `/` using `settings.logo_url` with the Utensils fallback, exactly two nav links — Menú → `/menu`, Galería → `/galeria` —, active state via `Astro.url.pathname`, single centered flex row that wraps gracefully on small screens, no JS, Tailwind tokens only) — `b66f6f7`.
- [x] Support per-page titles in the head shell (src/storefront/layout/Layout.astro: an explicitly passed `title` prop composes with `seo.title_template` (`%s`) instead of being overridden by `seo.title`; when no `title` is passed the current behavior is unchanged) — `98bdae2`.
- [x] Move the storefront to `/menu` (src/pages/index.astro → src/pages/menu.astro: identical content, doc-comments updated to the new path; `/` is intentionally empty until the next task) — `68f3df1`.
- [x] Create the minimal landing at `/` (src/pages/index.astro: Layout + SiteHeader + hero with restaurant name and tagline from settings/seo + one primary CTA to `/menu` + Footer; data via `loadStorefront()`) — `3047000`.

Cierre: build green; `/menu` serves the full storefront with the 11-check smoke green; `/` renders the landing and both header links resolve.

## F2 — Landing completa (básica)

Objetivo: finish the landing content so it is the navigation hub of the site (the only entry to enlaces).

- [x] Add the CTA section to the landing (src/pages/index.astro: three link cards — Ver menú → `/menu`, Galería → `/galeria`, Enlaces → `/enlaces` — styled with existing tokens, footer reused below) — `c54218f`.
- [x] Set the landing SEO title (src/pages/index.astro: pass the site-level title through the Layout title prop so the landing keeps the canonical `Mr Nikkei6.9 — Sushi y delivery en Lima` head; `/menu` keeps the same default) — `b9a7011`.
- [x] Extend the CDP smoke for the landing (smoke script: landing renders 3 CTA hrefs, SiteHeader logo resolves to `/`, title assertion passes, 0 console problems) — `086f119`.

Cierre: landing shows hero + 3 CTAs + footer; smoke green.

## F3 — /galeria

Objetivo: gallery page sourced from existing data (no new endpoint): product photos grouped by category.

- [ ] Derive the gallery dataset server-side (src/storefront/services/menu.service.js or a small helper next to it: read the menu from `loadStorefront()`, return categories with their products that have `image.url`, ordered as the menu renders; no browser fetch, no fixture changes).
- [ ] Create the gallery page (src/pages/galeria.astro: Layout + SiteHeader + responsive image grid grouped by category — `loading="lazy"`, alt from `image.alt`, `precio`-free plain layout with tokens — + Footer).
- [ ] Set the gallery SEO title (src/pages/galeria.astro: `title="Galería"` through the Layout title prop).
- [ ] Extend the CDP smoke for the gallery (script: grid renders the expected image count, a category heading exists, nav shows Galería active, footer present, 0 console problems).

Cierre: `/galeria` renders all menu product photos grouped by category; smoke green.

## F4 — /enlaces

Objetivo: linktree-style page aggregating every contact/social destination; hidden from the site nav by design.

- [ ] Create the links page (src/pages/enlaces.astro: Layout + SiteHeader + stacked link buttons — WhatsApp order via `WhatsApp.link(settings.whatsapp.number)`, Instagram, Facebook, TikTok rendered only when `settings.social_media` provides the URL, Google Maps from `settings.google_maps`, phone `tel:` — using existing icons from `src/storefront/icons/` + Footer).
- [ ] Set the enlaces SEO title (src/pages/enlaces.astro: `title="Enlaces"` through the Layout title prop).
- [ ] Extend the CDP smoke for enlaces (script: every populated social link resolves to the settings URL, the TikTok button is absent while the fixture value is null, SiteHeader contains exactly two nav links — Menú and Galería — on this page, landing CTA reaches `/enlaces`, 0 console problems).

Cierre: `/enlaces` lists every live destination from settings; confirmed absent from the header nav; smoke green.

## F5 — Verificación integral y cierre

Objetivo: full regression across the four routes, docs in sync, plan closed.

- [ ] Run the full regression pass (preview + smoke: the original 11 `/menu` checks plus every new landing/gallery/enlaces check in one run; `pnpm build` green; no new console problems anywhere).
- [ ] Cross-page navigation sweep (CDP script: logo → `/` from every page; Menú and Galería links resolve from each of the three header-bearing pages; footer renders on all four routes).
- [ ] Update the repo agent docs (AGENTS.md: four-route structure, SiteHeader vs branded Header split, gallery data source).
- [ ] Close the plan (this file: every task `- [x]` with its commit hash; note any deviation here).

Cierre: all four routes verified end-to-end; AGENTS.md current; plan file fully checked with hashes.

## Deuda explícita (no planificada)

- Real gallery API: the GAS `template-images` `gallery` key stays unconsumed — the gallery reads menu product photos until the API ships a gallery endpoint (then migrate the F3 dataset helper).
- `/menu` has no direct nav to galería/enlaces (navigation goes logo → landing). Adding SiteHeader above the branded header is a one-line change if wanted later — explicitly out of scope now.
- No mobile hamburger nav (explicit user decision — the row is short enough).
- No 404 page; unknown routes fall to the static host default.
- Per-page SEO blocks: the v2 `seo` block is site-level only; page titles are set manually per route.
- `tiktok` is `null` in fixtures — the enlaces page and footer render that entry conditionally.
- `astro.config.mjs` still has no `site` option (sitemap warning) — pre-existing, unchanged by this plan.
