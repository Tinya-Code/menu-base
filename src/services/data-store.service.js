import { restaurantService } from './restaurant.service.js';

/**
 * DataStoreService — read-only façade exposing the active settings.
 *
 * It exists so components have a single, stable import for "the settings the
 * UI should render", without knowing which service owns them.
 */
export class DataStoreService {
  #restaurant;

  /**
   * @param {import('./restaurant.service.js').RestaurantService} [restaurant]
   */
  constructor(restaurant = restaurantService) {
    this.#restaurant = restaurant;
  }

  /**
   * Ensure the settings are loaded before reading them.
   * @returns {Promise<any>}
   */
  async load() {
    await this.#restaurant.load();
    return this.activeSettings;
  }

  /** @returns {any} settings for the components */
  get activeSettings() {
    return this.#restaurant.settings;
  }
}

/** Shared instance used by the components. */
export const dataStoreService = new DataStoreService();
