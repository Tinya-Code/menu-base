/**
 * events — the single typed contract for every CustomEvent the storefront
 * dispatches.
 *
 * Components collaborate only through the four events below: a dispatcher
 * calls `emit()` and never mutates state, a listener subscribes with `on()`.
 * Everything else in the page is plain DOM (`click`, `input`, …) and stays on
 * `addEventListener` on purpose — this module owns CustomEvents, not the DOM.
 *
 * Client only: both helpers default to `document`, so import this module from
 * `<script>` blocks, never from server frontmatter.
 */
import type { MenuProduct, OrderableProduct, PriceRangeEntry } from '../types/menu';

/**
 * Payload map: event name → the exact `detail` shape the dispatchers send.
 *
 * Product payloads are typed from `src/types/menu.ts` (F5): a card dispatches
 * its own `MenuProduct`, and the combo/promotion cards dispatch the raw
 * resource object (the cart only reads `id`, `name` and `price`).
 */
export interface EventMap {
  /** A card asks the page to open the product dialog for `product`. */
  'product-click': { product: MenuProduct };
  /** `ui/add-button.astro` announces a "＋" press; `event` is the click. */
  'add-button-click': { event: Event };
  /** Ask the page (the single owner) to add a line to the cart. */
  'add-to-cart': {
    product: OrderableProduct;
    quantity?: number;
    selectedEntry?: PriceRangeEntry | null;
  };
  /** The product dialog must close. */
  'close-product-detail': Record<string, never>;
}

/** Union of the storefront event names. */
export type EventName = keyof EventMap;

/**
 * Dispatch a storefront CustomEvent on `target`.
 *
 * Options mirror the pre-module helpers exactly: every dispatcher used
 * `{ bubbles: true, cancelable: true }`, so those are the only options here.
 *
 * @param type   event name (see {@link EventMap})
 * @param detail the payload listeners receive as `event.detail`
 * @param target dispatch target; `document` by default (the historic call site)
 * @returns `false` when a listener called `preventDefault()`
 */
export function emit<K extends EventName>(
  type: K,
  detail: EventMap[K],
  target: EventTarget = document,
): boolean {
  return target.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, cancelable: true }),
  );
}

/**
 * Subscribe to a storefront CustomEvent.
 *
 * The handler receives `(detail, event)` so it can inspect the event itself —
 * the `add-to-cart` owner uses `event.defaultPrevented` to skip a dispatch a
 * listener vetoed (the historic `emit(...) === false` check).
 *
 * No capture and no extra options: the pre-module listeners were all plain
 * bubble-phase `addEventListener(type, handler)` on `document`.
 *
 * @returns the unsubscribe function
 */
export function on<K extends EventName>(
  type: K,
  handler: (detail: EventMap[K], event: CustomEvent<EventMap[K]>) => void,
  target: EventTarget = document,
): () => void {
  const listener = (event: Event) => {
    const custom = event as CustomEvent<EventMap[K]>;
    handler(custom.detail, custom);
  };

  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
}
