import { ReactiveValue } from '../utils/reactive.js';
import { restaurantService } from './restaurant.service.js';

/**
 * CartService — the order cart, reactive on purpose.
 *
 * Cart contents drive the sidebar, the header counter and the WhatsApp order
 * message, so unlike the rest of the data this one is *not* static: every
 * mutation notifies the subscribers registered through `subscribe()`.
 *
 * ```js
 * const unsubscribe = cart.subscribe(({ items, total }) => render(items, total));
 *
 * cart.addItem(product, 2, priceRangeEntry);
 * ```
 *
 * State lives in `ReactiveValue` instances (`cart.items`, `cart.isOpen`,
 * `cart.isBusinessClosed`), so you can also subscribe to one of them directly.
 */
export class CartService {
  /** Cart lines. */
  items = new ReactiveValue([]);

  /** Sidebar visibility. */
  isOpen = new ReactiveValue(false);

  /** "Restaurant is closed" modal visibility. */
  isBusinessClosed = new ReactiveValue(false);

  #restaurant;

  /**
   * @param {import('./restaurant.service.js').RestaurantService} [restaurant]
   */
  constructor(restaurant = restaurantService) {
    this.#restaurant = restaurant;
  }

  // ─── Derived values (recomputed on every read) ─────────────────────────────

  /** @returns {number} total units in the cart */
  get count() {
    return this.items.get().reduce((acc, item) => acc + item.quantity, 0);
  }

  /** @returns {number} */
  get subtotal() {
    return this.items.get().reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  /** @returns {number} */
  get deliveryFee() {
    return this.#restaurant.orderConfig?.delivery_fee ?? 0;
  }

  /** @returns {number} */
  get total() {
    return this.subtotal + this.deliveryFee;
  }

  /** @returns {boolean} */
  get isEmpty() {
    return this.items.get().length === 0;
  }

  /** @returns {number} */
  get maxQuantity() {
    return this.#restaurant.orderConfig?.max_order_quantity ?? 99;
  }

  /**
   * Everything the UI needs to paint, in one object.
   * @returns {{ items: any[], count: number, subtotal: number, deliveryFee: number, total: number, isEmpty: boolean, isOpen: boolean, isBusinessClosed: boolean }}
   */
  get snapshot() {
    return {
      items: this.items.get(),
      count: this.count,
      subtotal: this.subtotal,
      deliveryFee: this.deliveryFee,
      total: this.total,
      isEmpty: this.isEmpty,
      isOpen: this.isOpen.get(),
      isBusinessClosed: this.isBusinessClosed.get(),
    };
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  /**
   * Add a product, optionally bound to one of its price-range entries.
   * Re-adding the same product/entry pair increments the existing line.
   *
   * @param {{ id: any, name: string, price?: any, image_url?: string }} product
   * @param {number} [quantity]
   * @param {{ qty: any, price: any, bonus?: string } | null} [selectedEntry]
   * @returns {this}
   */
  addItem(product, quantity = 1, selectedEntry = null) {
    const currentItems = this.items.get();

    const entryId = selectedEntry ? `-${selectedEntry.qty}-${selectedEntry.price}` : '';
    const cartItemId = `${product.id}${entryId}`;

    const existingItem = currentItems.find((item) => item.id === cartItemId);

    if (existingItem) {
      this.updateQuantity(cartItemId, existingItem.quantity + quantity);
      this.open();
      return this;
    }

    if (quantity > this.maxQuantity) return this;

    const rawPrice = selectedEntry ? Number(selectedEntry.price) : Number(product.price);
    const resolvedPrice = Number.isNaN(rawPrice) ? 0 : rawPrice;

    const entryLabel = selectedEntry
      ? ` — ${selectedEntry.qty} und${Number(selectedEntry.qty) !== 1 ? 's' : ''}`
      : '';

    const newItem = {
      id: cartItemId,
      originalProductId: product.id,
      name: `${product.name}${entryLabel}`,
      price: resolvedPrice,
      quantity,
      image_url: product.image_url,
      selectedEntry: selectedEntry
        ? {
            qty: selectedEntry.qty,
            price: selectedEntry.price,
            bonus: selectedEntry.bonus,
          }
        : undefined,
    };

    this.items.set([...currentItems, newItem]);
    this.open();
    return this;
  }

  /**
   * @param {string} cartItemId
   * @param {number} quantity  values below 1 remove the line
   * @returns {this}
   */
  updateQuantity(cartItemId, quantity) {
    if (quantity <= 0) {
      this.removeItem(cartItemId);
      return this;
    }

    if (quantity > this.maxQuantity) return this;

    this.items.update((items) =>
      items.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)),
    );

    return this;
  }

  /**
   * @param {string} cartItemId
   * @returns {this}
   */
  removeItem(cartItemId) {
    this.items.update((items) => items.filter((item) => item.id !== cartItemId));
    return this;
  }

  /**
   * @returns {this}
   */
  clear() {
    this.items.set([]);
    return this;
  }

  /**
   * @returns {this}
   */
  open() {
    this.isOpen.set(true);
    return this;
  }

  /**
   * @returns {this}
   */
  close() {
    this.isOpen.set(false);
    return this;
  }

  /**
   * @returns {this}
   */
  toggle() {
    this.isOpen.set(!this.isOpen.get());
    return this;
  }

  /**
   * @returns {this}
   */
  showBusinessClosedModal() {
    this.isBusinessClosed.set(true);
    return this;
  }

  /**
   * @returns {this}
   */
  closeBusinessClosedModal() {
    this.isBusinessClosed.set(false);
    return this;
  }

  // ─── Reactivity ───────────────────────────────────────────────────────────

  /**
   * Get notified whenever the cart changes (items, sidebar or closed modal).
   *
   * @param {(state: ReturnType<CartService['snapshot']>, previous: ReturnType<CartService['snapshot']> | null) => void} listener
   * @param {{ immediate?: boolean }} [options]
   * @returns {() => void} unsubscribe
   */
  subscribe(listener, { immediate = false } = {}) {
    const notify = (previous = null) => listener(this.snapshot, previous);

    const offs = [
      this.items.subscribe(() => notify()),
      this.isOpen.subscribe(() => notify()),
      this.isBusinessClosed.subscribe(() => notify()),
    ];

    if (immediate) notify();

    return () => offs.forEach((dispose) => dispose());
  }
}

/** Shared instance used by the components. */
export const cartService = new CartService();
