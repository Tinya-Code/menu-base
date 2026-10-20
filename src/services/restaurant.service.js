import { menuService } from './menu.service.js';

/**
 * RestaurantService — restaurant profile and settings.
 *
 * Angular kept this reactive through signals; here the data is static: call
 * `await restaurantService.load()` once and read the sync getters afterwards.
 *
 * ```js
 * await restaurantService.load();
 * const fee = restaurantService.orderConfig?.delivery_fee ?? 0;
 * ```
 */
export class RestaurantService {
  #menu;
  #info = null;
  #ready = null;

  /**
   * @param {import('./menu.service.js').MenuService} [menu]
   */
  constructor(menu = menuService) {
    this.#menu = menu;
  }

  /**
   * Fetch (once) and cache the restaurant payload.
   * @returns {Promise<any>} the full `RestaurantInfo`
   */
  load() {
    if (!this.#ready) {
      this.#ready = this.#menu
        .getRestaurantInfo()
        .then((info) => {
          this.#info = info ?? null;
          return this.#info;
        })
        .catch((error) => {
          console.warn('[RestaurantService] could not load restaurant info.', error);
          this.#ready = null;
          return null;
        });
    }

    return this.#ready;
  }

  /**
   * Seed the service with a payload the page already owns (F5).
   *
   * Components never call `load()`: the page loads once at build time and
   * ships the resolved payload in `data-restaurant-info`; the page script
   * replays it here so client code (the cart totals) reads the same values
   * without a browser request. `load()` afterwards resolves with the seeded
   * payload instead of fetching.
   *
   * @param {any} info — the exact payload `load()` resolves to
   * @returns {this}
   */
  hydrate(info) {
    if (info && typeof info === 'object') {
      this.#info = info;
      this.#ready = Promise.resolve(info);
    }
    return this;
  }

  /** @returns {any} full payload */
  get info() {
    return this.#info;
  }

  /** @returns {any} */
  get restaurant() {
    return this.#info?.data?.restaurant ?? null;
  }

  /** @returns {any} */
  get settings() {
    return this.#info?.data?.settings ?? null;
  }

  /** @returns {any} */
  get orderConfig() {
    return this.settings?.order_config ?? null;
  }

  /** @returns {any} */
  get whatsappConfig() {
    return this.settings?.whatsapp_config ?? null;
  }

  /** @returns {any} */
  get businessConfig() {
    return this.settings?.business_config ?? null;
  }

  /** @returns {any} */
  get socialMedia() {
    return this.businessConfig?.social_media ?? null;
  }
}

/** Shared instance used by the page; the cart reads it after `hydrate()`. */
export const restaurantService = new RestaurantService();
