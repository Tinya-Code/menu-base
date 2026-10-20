/**
 * Storefront data shapes — the payloads the Google Apps Script API returns
 * once `src/services/menu.service.js` and `restaurant.service.js` shape them.
 *
 * Every field was derived from those services (the mapping code) and from the
 * live `?json=` responses plus the serialized payloads already shipped in
 * `dist/index.html`; nothing here is speculative. Pages load these values once
 * and hand them to components as props — components never fetch.
 */

/** One quantity option of a price range (`price-range` → `entries[]`). */
export interface PriceRangeEntry {
  /** Unit count; the API sends strings (`"12"`), consumers use `Number(...)`. */
  qty: string | number;
  /** Unit price; the API sends strings (`"17"`), consumers use `Number(...)`. */
  price: string | number;
  /** Optional bonus label rendered under the quantity. */
  bonus?: string;
}

/** A product's size/quantity ladder (resolves `MenuProduct.price_range_id`). */
export interface PriceRange {
  id: string;
  name?: string;
  entries: PriceRangeEntry[];
}

/** One product row (`menu` → `categories[].products[]`). */
export interface MenuProduct {
  id: string;
  name: string;
  description: string;
  /** Flat price; `""` when the price comes from the price-range entries. */
  price: number | string;
  image_url?: string;
  /** Short suffix next to the price (e.g. `"x2"`); `""` when unused. */
  qty_label?: string | null;
  /** `PriceRange.id` when the product must open the option dialog. */
  price_range_id?: string | null;
  category_id?: string;
  cloudinary_id?: string;
  is_recommended?: boolean;
  is_hidden?: boolean;
}

/** One category rendered as a section (`menu` → `blocks[].categories[]`). */
export interface MenuCategory {
  id: string;
  name: string;
  description?: string | null;
  block_id?: string;
  /** Always an array: `MenuService.getMenu()` normalises it. */
  products: MenuProduct[];
}

/** One menu block (`menu` → `data.blocks[]`), already normalised. */
export interface MenuBlock {
  id: string;
  categories: MenuCategory[];
}

/** One combo (`combos` resource). */
export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  url: string;
  cloudinary_id: string;
}

/** One promotion (`promotions` resource). */
export interface Promotion {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  url: string;
  cloudinary_id: string;
}

/** Anything the cart accepts as a line (`add-to-cart` payload). */
export type OrderableProduct = MenuProduct | Combo | Promotion;

/**
 * Ready-to-render decorations (`MenuService.getDecorations()`): service data
 * wins, the local fallbacks in `menu.service.js` otherwise.
 */
export interface Decorations {
  background: string;
  block1: { barco: string; makis: string[] };
  block3: { alitasFondo: string; alitas2Fondo: string };
  block6: { coctelesVertical: string };
}

/** Opening hours for one weekday (`business_config.business_hours.<day>`). */
export interface DaySchedule {
  isOpen: boolean;
  /** `"11:00"` — 24 h `HH:mm`. */
  open: string;
  /** `"22:30"` — 24 h `HH:mm`. */
  close: string;
}

/**
 * Weekly schedule keyed by weekday (`monday` … `sunday`, the keys
 * `MenuService.DAY_MAP` normalises to). A missing day means "no data"; the
 * accessors always guard with `?.` / `??`.
 */
export type BusinessHours = Partial<Record<string, DaySchedule>>;

/** `data.restaurant` — the profile the header and footer render. */
export interface RestaurantProfile {
  name: string;
  slug?: string;
  template_id?: string;
  phone: string;
  address?: string | null;
  location?: { lat?: number | null; lng?: number | null };
}

/** `settings.whatsapp_config` — how the storefront opens WhatsApp. */
export interface WhatsappConfig {
  number: string;
  message_template?: string | null;
}

/** `settings.display_config` — currency + language of the storefront. */
export interface DisplayConfig {
  currency: string;
  language: string;
}

/** `settings.order_config` — ordering rules (fee, delivery, payment methods). */
export interface OrderConfig {
  delivery_fee: number;
  payment_methods: string[];
  delivery_enabled: boolean;
  max_order_quantity: number;
}

/** `settings.business_config.social_media` — profile URLs ("" when unset). */
export interface SocialMedia {
  tiktok: string;
  facebook: string;
  instagram: string;
}

/** `settings.business_config` — hours, social links and delivery zones. */
export interface BusinessConfig {
  social_media: SocialMedia;
  business_hours: BusinessHours;
  /** Zones are not consumed by the storefront; the payload type is unknown. */
  delivery_zones: unknown[];
}

/** `settings` — everything the storefront reads from the settings resource. */
export interface RestaurantSettings {
  whatsapp_config: WhatsappConfig;
  display_config: DisplayConfig;
  order_config: OrderConfig;
  business_config: BusinessConfig;
  description: string;
  tags: unknown[];
  logo_url: string | null;
}

/**
 * The full settings payload after `MenuService.getRestaurantInfo()` maps the
 * flat API response to the nested shape the components consume.
 * `null` when the request never resolved.
 */
export interface RestaurantInfo {
  data: {
    restaurant: RestaurantProfile;
    settings: RestaurantSettings;
  };
}
