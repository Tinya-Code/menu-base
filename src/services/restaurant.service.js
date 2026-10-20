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

/** Shared instance used by the components. */
export const restaurantService = new RestaurantService();
