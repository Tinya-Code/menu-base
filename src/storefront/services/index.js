/**
 * Storefront Services — single entry point for all storefront data and logic.
 */
import {
  loadMenu,
  getMenu,
  getCombos,
  getPromotions,
  getDecorations,
  getFlyers,
} from './menu.service.js';
import {
  getRestaurantData,
  getGoogleReviewLink,
  restaurantService,
} from './restaurant.service.js';
import { cartService } from './cart.service.js';
import { isOpenAt, weekDayKey, WEEK_DAYS } from './business-hours.service.js';

export {
  loadMenu,
  getMenu,
  getCombos,
  getPromotions,
  getDecorations,
  getFlyers,
  getRestaurantData,
  getGoogleReviewLink,
  restaurantService,
  cartService,
  isOpenAt,
  weekDayKey,
  WEEK_DAYS,
};

/**
 * Unified loader: fetches all build-time data in parallel with safe fallbacks.
 *
 * Allows `src/pages/index.astro` to load everything in one clean call:
 * ```js
 * const {
 *   blocks,
 *   combos,
 *   promotions,
 *   decorations,
 *   restaurant,
 *   settings,
 *   businessHours,
 *   googleMapsUrl,
 *   flyers,
 * } = await loadStorefront();
 * ```
 */
export async function loadStorefront() {
  const [menuPayload, restaurantData, flyers] = await Promise.all([
    loadMenu().catch((error) => {
      console.error('[loadStorefront] menu load failed:', error);
      return { blocks: [], combos: [], promotions: [], decorations: {} };
    }),
    getRestaurantData().catch((error) => {
      console.error('[loadStorefront] restaurant load failed:', error);
      return {
        info: null,
        settings: null,
        restaurant: null,
        rawHours: undefined,
        businessHours: {},
        googleMapsUrl: null,
      };
    }),
    getFlyers().catch(() => ({ enabled: false, delay_seconds: 20, items: [] })),
  ]);

  return {
    ...menuPayload,
    ...restaurantData,
    flyers,
  };
}
