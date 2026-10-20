/**
 * dom — the shared readers for JSON `data-*` attributes.
 *
 * Cards, the product dialog, the layout scaler and the page all hand payloads
 * to client scripts through serialized attributes; every copy of this reader
 * collapsed into the two functions below (F4).
 *
 * Client only: nothing here runs during server rendering.
 */

/**
 * Parse a JSON attribute.
 *
 * @returns the parsed value, or `null` when the attribute is missing or invalid
 */
export function readJson(element: Element | null, attribute: string): any;

/**
 * Parse a JSON attribute with a fallback for a missing/invalid payload.
 *
 * @returns the parsed value, or `fallback` when the attribute is missing or invalid
 */
export function readJson<T>(element: Element | null, attribute: string, fallback: T): T;

export function readJson<T>(element: Element | null, attribute: string, fallback?: T): any {
  const raw = element?.getAttribute(attribute);
  if (!raw) return fallback ?? null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback ?? null;
  }
}

/** `readJson(element, 'data-product')` — the payload every card exposes. */
export function readProduct(element: Element | null): any {
  return readJson(element, 'data-product');
}
