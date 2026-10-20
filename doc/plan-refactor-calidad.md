# Whole-project quality refactor — SRP/SOLID, event-driven, less JS

Source: user request (2026-10-19) + full codebase survey of `src/` (41 files, 17 client scripts, 7 CustomEvents, 13 dead callback props). Goal: apply SRP/SOLID across the project, make events the single collaboration contract between components, minimize client JS, organize folders by domain, and assemble everything from the page through slots.

Stack context: Astro ^7.3.8 (static output, zero framework islands), Tailwind ^4.3.3 CSS-first (`@theme` in `src/styles/global.css`), `@astrojs/sitemap`, pnpm, Google Apps Script JSON API, ported from Angular.

## Restricciones

### Alcance (prohibido)
- No new dependencies (only astro, tailwindcss, @tailwindcss/vite, @astrojs/sitemap).
- Output stays `static` — no adapter/server/routes/API endpoints.
- Google Apps Script API contract (`?json=` resources) untouched.
- Only page is `/` — 404 links are removed, not built.
- `src/components/icons/*` (27 files) out of scope — already uniform.

### Estilo/código (obligatorio)
- Tailwind v4 CSS-first: tokens only in `@theme` of `src/styles/global.css`; no `tailwind.config.*`.
- Every CustomEvent goes through one typed module (`src/utils/events.ts`); no copied `emit()` helpers.
- No `any` on props touched by this plan; shared interfaces live in `src/types/`.
- Services are never called inside components — data enters pages as props, pages pass props down.
- Template comments: `<!-- -->` at top level, `{/* */}` inside expressions.
- Technical artifacts (code, comments, this doc) in English.

### Calidad (verificable)
- `pnpm build` green before any `- [x]`.
- Every deletion verified by a grep that returns zero matches (or the expected survivors only).
- dist markers preserved (`data-block-1`, maki URLs, block order promotions → combos → block-1..7) unless the task says otherwise.
- No new `console.log`.

### Proceso
- One task = one conventional commit; independent changes never share a task.
- Phases run in order: quick wins → purge → domain → events → data → JS → structure.
- JS reduction measured: script bytes in `dist/index.html` recorded before F6 and after F7 in the final commit body.

## Already done (verified this session)

- [x] `menu-block.astro` is fully generic (props + 4 slots, zero block-specific knowledge).
- [x] `base-template.astro` is presentational: no service calls, flat 7 declarations, `<!-- block-N -->` comments.
- [x] `api-client.js` is pure (builder + cache); shared instance moved to `src/services/api.js`; `json()` sugar removed.
- [x] Decoration resolution (fallbacks + service-data-wins) lives in `menu.service.js`; `load()` returns `decorations`.
- [x] `src/scripts/animations/` registry (`parallax.ts`, `maki-rail.ts`, `index.ts`).

## F1 — Latent bugs and dead utility classes

Objective: visible defects first, smallest effort.

- [x] Stop destructuring `templateData` from `load()` (it never returns it) and either wire a real Postres payload path or drop the pass-through (`src/pages/index.astro`). (done: 849ad26)
- [x] Render nothing when `images` is empty — kills the empty labeled "Postres" box (`src/components/blocks/illustration-cell.astro`: guard at top of template). (done: 849ad26)
- [x] Remove the `/menu` and `/gallery` links — both 404 (`src/components/layout/header.astro`). (done: 849ad26)
- [x] Fix the wrong-brand share copy "Menú Chifa" → "Mr Nikkei" (`src/components/ui/share-button.astro`). (done: 849ad26)
- [x] Remove no-op classes `animate-in slide-in-from-bottom md:zoom-in` and `shadow-premium` — no plugin/`@theme` token exists, grep every usage (all `.astro` + `src/styles/global.css`). (done: 849ad26)

Cierre: `pnpm build` green; no empty Postres box; grep returns zero for removed classes and dead links.

## F2 — Dead code purge

Objective: delete everything with zero callers, verified by grep per task.

- [x] Delete `src/services/data-store.service.js` (zero importers — grep `data-store` returns 0). (done: ce3f6e9)
- [x] Remove the 13 dead callback props never passed by any caller: `add-button.onClicked`; `template-card.onProductClick/onAddToCart`; `product-detail.onAddToCart/onClose`; `combo-card.onAddToCart`; `promotion-card.onAddToCart/onProductClick`; `block-combos.addToCart`; `block-promotions.addToCart/productClick` (grep each prop name before/after). (done: 860595d)
- [x] Remove zero-caller methods `withAll`, `header`, `withoutCache`, `getOr`, `clearCache`, `toString` (`src/services/api-client.js`). (done: a5ce694)
- [x] Remove `getGalleryData`, `gallery`, `setUseApi`, `withLocalData` (`src/services/menu.service.js` — grep `setUseApi|withLocalData|getGalleryData` returns 0). (done: ff006de)
- [x] Remove `computed`, `combineSubscriptions`, `hasSubscribers`, `reset` (`src/utils/reactive.js`). (done: 1f4cad8)
- [x] Remove never-passed props: `id` + `sectionClass` (`src/components/blocks/menu-block.astro`); `autoSlide` + `autoSlideInterval` (`src/components/ui/slider.astro` — both callers pass `false`); `breakpoints` + `paddings` (`src/components/layout/layout-scale.astro`). (done: 98e4332)
- [x] Delete unused assets `src/assets/astro.svg` + `src/assets/background.svg` (grep confirms zero importers). (done: c3366a5)

Cierre: all greps return 0; `pnpm build` green.

## F3 — Domain unification: WhatsApp + business hours

Objective: one owner per domain rule (no duplicated literals or parallel implementations).

- [x] Export a single WhatsApp link builder with country code in `src/utils/whatsapp.js`; replace every hardcoded `wa.me/51…` (`src/components/ui/whatsapp-button.astro`, `src/components/cart/checkout-form.astro`, `src/components/layout/footer.astro` ×2) and route `product-detail.astro` through it (today it opens without the country code). (done: ba18350, 4fda411, 8c03a1c)
- [x] Build the order message with the existing `OrderMessage` builder; delete the hand-rolled string and both duplicated `PAYMENT_LABELS` copies (`src/components/cart/checkout-form.astro` frontmatter + script; `src/utils/whatsapp.js` keeps its single copy). (done: 4fda411 — script copy was actually `DELIVERY_LABELS`, also deleted)
- [x] Single source for the days array in `src/services/business-hours.service.js`; `footer.astro` and `restaurant-closed-modal.astro` consume it (grep shows 3 copies today). (done: 8c03a1c — exports `WEEK_DAYS` + `weekDayKey()`)
- [x] Gate through `businessHoursService` instead of importing raw `isOpenAt` (`src/components/cart/checkout-form.astro`). (done: 4fda411)

Cierre: grep shows one `wa.me` builder call site pattern, one `PAYMENT_LABELS`, one days array; build green.

## F4 — Events as the single contract

Objective: components collaborate only through typed CustomEvents, owned by one module; dispatchers have no hidden side effects.

- [x] Create `src/utils/events.ts`: typed event-name union + payload map + `emit()`/`on()` helpers; delete the 4 copied `emit()` helpers and the 3 duplicated `readJson`/`readProduct` helpers, migrating their callers (`src/pages/index.astro`, `template-card.astro`, `combo-card.astro`, `promotion-card.astro`, `product-detail.astro`). (done: 27985cd)
- [x] Migrate every dispatcher to the module: `product-click`, `add-button-click`, `close-product-detail` (`template-card`, `combo-card`, `promotion-card`, `product-detail`, `add-button`). (done: 27985cd)
- [x] Migrate every listener to `on(...)`: `index.astro` dialog refill, `product-detail` inner listeners, `sidebar-cart`, `restaurant-closed-modal`. (done: 27985cd)
- [x] Define `add-to-cart` ownership: one listener in `src/pages/index.astro` calls `cartService.addItem({ product, quantity, selectedEntry })`; delete the 4 "default action" handlers inside dispatchers (dispatchers dispatch, never mutate state). (done: 27985cd)
- [x] Document-level delegation: one listener set in `index.astro` replaces the per-card click scripts — `template-card.astro`, `combo-card.astro`, `promotion-card.astro` become markup + `data-*` attributes only (verify: product detail still opens, add-to-cart still adds). (done: 27985cd)

Cierre: grep `dispatchEvent` outside `src/utils/events.ts` returns only the module; per-card `<script>` blocks gone; manual smoke (open detail, add, close) works; build green.

## F5 — Data in the page (props down, zero fetch in components)

Objective: SRP — pages orchestrate data, components render what they're given.

- [x] Create `src/types/menu.ts` (`MenuProduct`, `MenuCategory`, `MenuBlock`, `Combo`, `Promotion`, `PriceRange`, `RestaurantInfo`, `Decorations`) and replace the `any` props in `base-template.astro`, `menu-block.astro`, `index.astro` with these types. (done: b15602d)
- [x] Layout consumers: remove frontmatter `await restaurantService.load()` from `header.astro`, `footer.astro`, `whatsapp-button.astro`; `index.astro` loads once and passes props. (done: b15602d)
- [x] Card consumers: same removal in `template-card.astro`, `combo-card.astro`, `promotion-card.astro` (price-range + can-order data arrives as props from the page). (done: b15602d)
- [x] Modal/checkout consumers: same removal in `product-detail.astro`, `restaurant-closed-modal.astro`, `checkout-form.astro`. (done: b15602d)
- [x] Client-side hours: `sidebar-cart.astro` and `cart-trigger.astro` scripts read a page-provided `data-business-hours` attribute instead of calling `businessHoursService.load()` in the browser. (done: b15602d)

Cierre: grep `restaurantService.load()` inside `src/components/` returns 0; grep `businessHoursService.load()` inside component scripts returns 0; build green.

## F6 — Less JS (CSS-first)

Objective: cut client bytes by moving what CSS already does out of scripts.

- [x] `category-nav.astro`: delete the ~23-line scroll script; replace the 140px offset with `scroll-margin-top` on category sections (smooth scrolling already set globally). (done: ae7f2c1)
- [x] `promotion-card.astro`: replace the JS "Ver más" line-clamp toggle with a CSS-only pattern. (done: ae7f2c1)
- [x] `whatsapp-button.astro`: tooltip show/hide visuals to CSS (`group-hover` + transitions); JS keeps only the 3s/8s sequencing timers. (done: ae7f2c1)
- [x] `parallax.ts`: CSS scroll-driven animation behind `@supports (animation-timeline: view())`; keep the rAF fallback for unsupported browsers. (done: ae7f2c1)
- [ ] Record `dist/index.html` script bytes before this phase and after F7; paste both numbers in the F7 commit body. (baseline recorded: inline 4572 B / external 14676 B post-F5; inline 3742 B post-F6 — final measurement at F7)

Cierre: each deleted script greps 0 in source; behavior preserved; numbers recorded.

## F7 — Domain packages + slot assembly in the page

Objective: folders by domain; the page assembles everything through slots.

Target tree:

```
src/
  pages/index.astro        ← orchestrates: load data, assemble via slots
  menu/                    ← menu formation package: blocks/, cards/, category-nav,
                              product-detail, template-section-title, illustration-cell
  commerce/                ← cart/, cart-trigger, checkout-form, add-button
  layout/                  ← header, footer, layout-scale, base-template (shell)
  ui/                      ← slider, share-button, whatsapp-button, modal
  icons/
  services/  scripts/  utils/  types/  styles/
```

- [ ] Create `src/menu/` and move `components/blocks/*`, `components/cards/*`, `ui/category-nav.astro`, `ui/template-section-title.astro`, `base-template/product-detail.astro`; fix every import; build green.
- [ ] Create `src/commerce/` and move `components/cart/*`, `ui/add-button.astro`; fix imports; build green.
- [ ] Move `base-template/base-template.astro` → `src/layout/menu-page.astro`; its content region becomes `<slot />` — move the promotions/combos/7-block composition into `src/pages/index.astro` (page assembles everything; BaseTemplate is a pure shell: header/scale/background/footer).
- [ ] Remove empty dirs (`components/blocks`, `components/cards`, `components/base-template`, …) and update `AGENTS.md`/docs paths if referenced.
- [ ] Final verification: `pnpm build` green, dist markers identical (block order, `data-block-1`, maki URLs), script-bytes comparison recorded (F6 task 5), folder tree matches the target above.

Cierre: tree matches target; build green; page byte-equivalent except intended JS/CSS changes.

## Deuda explícita (no planificada)

- **`font-bungee`, `shadow-premium`, `animate-*` tokens**: need a design decision (font file + `@font-face` or a plugin) → new dependency or asset, out of scope.
- **Full TypeScript migration** of `services/` and `utils/` (today `.js` + JSDoc); this plan only types component props via `src/types/`.
- **i18n**: `lang="es"` and `esPE` copy are hardcoded site-wide — a product decision, not quality.
- **Cart persistence** (localStorage): product decision.
- **Real `/menu` and `/gallery` routes**: content needed; links are removed in F1, not built.
- **Postres/block-7 payload**: depends on the API exposing it; wiring exists after F1, data does not.
- **Parallax rAF fallback** stays: CSS scroll-driven animations lack full browser support.
