/**
 * Storefront Services — single entry point for all storefront data and logic.
 */
import { loadMenu, getFlyers, getGallery, getGalleryCategories } from './menu.service.js';
import { getRestaurantData } from './restaurant.service.js';
import { isOpenAt, weekDayKey } from './business-hours.service.js';
import { getEnlaces } from './enlaces.service.js';
import { getLanding } from './landing.service.js';

export {
  getGalleryCategories,
  isOpenAt,
  weekDayKey,
  getEnlaces,
  getLanding,
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
 *   gallery,
 * } = await loadStorefront();
 * ```
 */
export async function loadStorefront() {
  const [menuPayload, restaurantData, flyers, gallery] = await Promise.all([
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
    getGallery().catch((error) => {
      console.error('[loadStorefront] gallery load failed:', error);
      return [];
    }),
  ]);

  return {
    ...menuPayload,
    ...restaurantData,
    flyers,
    gallery,
  };
}
