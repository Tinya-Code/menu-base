import { restaurantService } from './restaurant.service.js';

/**
 * The canonical week — Monday first, with the Spanish labels the storefront
 * renders. Single source for every days listing (footer, closed modal) and
 * for `isOpenAt()`.
 * @type {Array<{ key: string, label: string }>}
 */
export const WEEK_DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

/**
 * Weekday key for a date: `Date.getDay()` runs Sunday = 0, `WEEK_DAYS`
 * runs Monday first.
 *
 * @param {Date} [date]
 * @returns {string}
 */
export function weekDayKey(date = new Date()) {
  return WEEK_DAYS[(date.getDay() + 6) % 7].key;
}

/**
 * Pure "is the restaurant open at this exact moment?" check against a raw
 * `business_hours` payload.
 *
 * Kept free of the service so the browser bundle can reuse it (the sidebar and
 * the checkout need it client-side, where `restaurantService` is only loaded
 * on demand).
 *
 * A schedule that never arrived counts as open, exactly like Angular.
 *
 * @param {Record<string, any> | undefined | null} businessHours
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isOpenAt(businessHours, now = new Date()) {
  if (!businessHours) return true;

  const schedule = businessHours[weekDayKey(now)];

  if (!schedule || !schedule.isOpen) return false;

  const currentTime = now.getHours() * 100 + now.getMinutes();
  const [openH, openM] = String(schedule.open).split(':').map(Number);
  const [closeH, closeM] = String(schedule.close).split(':').map(Number);

  const openTime = openH * 100 + openM;
  const closeTime = closeH * 100 + closeM;

  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * BusinessHoursService — opening hours and "is the restaurant open right now?"
 *
 * The Angular version exposed signals; here every value is computed on read,
 * so call `await businessHoursService.load()` first and then use the getters.
 */
export class BusinessHoursService {
  #restaurant;

  /**
   * @param {import('./restaurant.service.js').RestaurantService} [restaurant]
   */
  constructor(restaurant = restaurantService) {
    this.#restaurant = restaurant;
  }

  /**
   * Make sure the underlying restaurant settings are loaded.
   * @returns {Promise<this>}
   */
  async load() {
    await this.#restaurant.load();
    return this;
  }

  /**
   * @returns {Record<string, any> | undefined}
   */
  get rawHours() {
    return this.#restaurant.businessConfig?.business_hours;
  }

  /**
   * Opening hours as an array, ready to iterate.
   * @returns {Array<{ day: string } & Record<string, any>>}
   */
  get hours() {
    const businessHours = this.rawHours;
    if (!businessHours) return [];

    return Object.entries(businessHours).map(([day, schedule]) => ({
      day,
      ...schedule,
    }));
  }

  /**
   * Whether the restaurant is open at this exact moment.
   * If the schedule never arrived, the restaurant is treated as open.
   * @param {Date} [now]
   * @returns {boolean}
   */
  isCurrentlyOpen(now = new Date()) {
    return isOpenAt(this.rawHours, now);
  }

  /**
   * @param {Date} [now]
   * @returns {boolean}
   */
  isOpen(now = new Date()) {
    return this.isCurrentlyOpen(now);
  }
}

/** Shared instance used by the page — the only orchestrator (F5). */
export const businessHoursService = new BusinessHoursService();
