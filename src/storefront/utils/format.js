/**
 * format — pure ports of the Angular pipes (`precio`, `fecha`, `timeFormat`).
 *
 * All formatters are locale-locked to `es-PE`, exactly like the original pipes,
 * and return an empty string for nullish or unparseable input.
 */

/**
 * Currency formatter for Peruvian Soles (PEN).
 *
 * ```js
 * precio(12.5) // "S/ 12.50"
 * ```
 *
 * @param {number | string | null | undefined} value
 * @returns {string}
 */
export function precio(value) {
  if (value === null || value === undefined || value === '') return '';

  const num = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return '';

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Supported `fecha()` format aliases. */
export const FECHA_FORMATS = ['short', 'medium', 'long', 'full', 'dateTime'];

/**
 * @param {'short' | 'medium' | 'long' | 'full' | 'dateTime'} format
 * @returns {Intl.DateTimeFormatOptions}
 */
function fechaOptions(format) {
  switch (format) {
    case 'short':
      return { year: '2-digit', month: '2-digit', day: '2-digit' };
    case 'long':
      return { year: 'numeric', month: 'long', day: 'numeric' };
    case 'full':
      return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    case 'dateTime':
      return {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
    case 'medium':
    default:
      return { year: 'numeric', month: 'short', day: 'numeric' };
  }
}

/**
 * Human readable date.
 *
 * ```js
 * fecha('2026-10-10')                    // "10 oct 2026"
 * fecha('2026-10-10', 'dateTime')        // "10/10/2026, 03:15 p. m."
 * ```
 *
 * @param {Date | string | number | null | undefined} value
 * @param {'short' | 'medium' | 'long' | 'full' | 'dateTime'} [format]
 * @returns {string}
 */
export function fecha(value, format = 'medium') {
  if (value === null || value === undefined || value === '') return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-PE', fechaOptions(format)).format(date);
}

/**
 * 24 h clock time → `h:mm AM/PM`.
 *
 * ```js
 * timeFormat('19:30') // "7:30 PM"
 * timeFormat('0:15')  // "12:15 AM"
 * ```
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function timeFormat(value) {
  if (!value) return '';

  const [hoursStr, minutesStr] = String(value).split(':');
  let hours = Number.parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';

  if (Number.isNaN(hours)) return value;

  const period = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12;

  return `${hours}:${minutes} ${period}`;
}
