import { api } from './api.js';

/** Local fallbacks for every decorative image (the old per-block defaults). */
const DECORATION_FALLBACKS = {
  background: '/images/bg.png',
  block1: {
    barco: 'https://res.cloudinary.com/dztatdahl/image/upload/v1779051451/fila-barco_vghckz.png',
    makis: [
      'https://res.cloudinary.com/dztatdahl/image/upload/v1779052072/fila-maki1_y0rfvc.png',
      'https://res.cloudinary.com/dztatdahl/image/upload/v1779052080/fila-maki2_a4btbu.png',
      'https://res.cloudinary.com/dztatdahl/image/upload/v1779052085/fila-maki3_uaivny.png',
    ],
  },
  block3: {
    alitasFondo: '/images/alitas-fondo.png',
    alitas2Fondo: '/images/alitas-2-fondo.png',
  },
  block6: {
    coctelesVertical: '/images/cocteles-vertical.png',
  },
};

/**
 * Shape raw `template-images` data into the ready-to-render decorations
 * object: service data wins, the local fallback otherwise.
 * @param {Record<string, any>} [data]
 * @returns {{
 *   background: string,
 *   block1: { barco: string, makis: string[] },
 *   block3: { alitasFondo: string, alitas2Fondo: string },
 *   block6: { coctelesVertical: string }
 * }}
 */
function shapeDecorations(data = {}) {
  const makis = data.block1?.makis;

  return {
    background: data.background ?? DECORATION_FALLBACKS.background,
    block1: {
      barco: data.block1?.barco ?? DECORATION_FALLBACKS.block1.barco,
      makis: Array.isArray(makis) && makis.length > 0 ? makis : DECORATION_FALLBACKS.block1.makis,
    },
    block3: {
      alitasFondo: data.block3?.alitasFondo ?? DECORATION_FALLBACKS.block3.alitasFondo,
      alitas2Fondo: data.block3?.alitas2Fondo ?? DECORATION_FALLBACKS.block3.alitas2Fondo,
    },
    block6: {
      coctelesVertical:
        data.block6?.coctelesVertical ?? DECORATION_FALLBACKS.block6.coctelesVertical,
    },
  };
}

/**
 * Look up a price range by id using the tolerant string comparison the
 * Angular components relied on (empty ids never match).
 *
 * Exported as a pure function (F5) so components resolve ranges from a
 * `priceRanges` prop instead of querying the service; the `MenuService`
 * method below is the same lookup over the memoised ranges.
 *
 * @param {import('../types/menu.js').PriceRange[]} priceRanges
 * @param {string | number | null | undefined} priceRangeId
 * @returns {import('../types/menu.js').PriceRange | null}
 */
export function findPriceRange(priceRanges, priceRangeId) {
  if (priceRangeId === null || priceRangeId === undefined || priceRangeId === '') return null;

  const rangeId = String(priceRangeId).trim();
  return priceRanges.find((range) => String(range.id).trim() === rangeId) ?? null;
}

/**
 * MenuService — every menu related read, plus the normalisation the Angular
 * components used to do inline.
 *
 * Reads are async, but once `load()` has resolved the data is available
 * through plain sync getters (`blocks`, `combos`, `priceRanges`, …). That is
 * the static-rendering contract: the PAGE calls `await menuService.load()`
 * once and passes the result to components as props — components never fetch.
 *
 * ```js
 * const { blocks, combos, promotions } = await menuService.load();
 * ```
 *
 * Local JSON can be injected to work offline (the Angular app imported it
 * straight from `src/app/data`); nothing is imported implicitly:
 *
 * ```js
 * new MenuService({ local: { menu: menuJson, combos: combosJson } })
 * ```
 */
export class MenuService {
  /** Maps the `?json=` resources exposed by the API. */
  static RESOURCES = {
    menu: 'menu',
    priceRanges: 'price-range',
    settings: 'settings',
    combos: 'combos',
    promotions: 'promotions',
    templateImages: 'template-images',
  };

  /** Maps each resource to the key used by the injected local JSON. */
  static LOCAL_KEYS = {
    menu: 'menu',
    priceRanges: 'priceRanges',
    settings: 'restaurant',
    combos: 'combos',
    promotions: 'promotions',
    templateImages: 'templateImages',
  };

  /** Spanish day name → key used by the business hours payload. */
  static DAY_MAP = {
    lunes: 'monday',
    martes: 'tuesday',
    miercoles: 'wednesday',
    jueves: 'thursday',
    viernes: 'friday',
    sabado: 'saturday',
    domingo: 'sunday',
  };

  #client;
  #local;
  #useApi;
  #ready = null;

  /** @type {any[]} */
  #blocks = [];

  /** @type {any[]} */
  #combos = [];

  /** @type {any[]} */
  #promotions = [];

  /** @type {any[]} */
  #priceRanges = [];

  /** @type {Record<string, any>} */
  #templateImages = {};

  /** @type {ReturnType<typeof shapeDecorations> | null} */
  #decorations = null;

  /** @type {Promise<any> | undefined} */
  #priceRangesPromise;

  /**
   * @param {{ client?: import('./api-client.js').ApiClient, local?: Record<string, any>, useApi?: boolean }} [options]
   */
  constructor({ client = api, local = {}, useApi = true } = {}) {
    this.#client = client;
    this.#local = local;
    this.#useApi = useApi;
  }

  // ─── Resolution helpers ────────────────────────────────────────────────────

  /**
   * Resolve one resource: local JSON when the API is disabled, otherwise the
   * remote endpoint with an optional fallback.
   * @param {keyof typeof MenuService.RESOURCES} name
   * @param {any} [fallback]
   * @returns {Promise<any>}
   */
  async #resolve(name, fallback = { data: [] }) {
    const localKey = MenuService.LOCAL_KEYS[name];

    if (!this.#useApi) {
      return this.#local[localKey] !== undefined ? this.#local[localKey] : fallback;
    }

    try {
      return await this.#client.with('json', MenuService.RESOURCES[name]).get();
    } catch (error) {
      console.warn(`[MenuService] "${name}" request failed, using fallback.`, error);
      return fallback;
    }
  }

  // ─── Reads ────────────────────────────────────────────────────────────────

  /**
   * Menu blocks, already normalised (every category carries a `products` array).
   * @returns {Promise<{ blocks: any[] }>}
   */
  async getMenu() {
    const response = await this.#resolve('menu', { data: {} });
    const blocks = Array.isArray(response?.data?.blocks) ? response.data.blocks : [];

    return {
      blocks: blocks.map((block) => ({
        ...block,
        categories: (block.categories ?? []).map((category) => ({
          ...category,
          products: category.products ?? [],
        })),
      })),
    };
  }

  /**
   * Price ranges. The promise is memoised, so concurrent callers share one
   * request (the old `shareReplay(1)`).
   * @returns {Promise<{ data: any[] }>}
   */
  getPriceRanges() {
    if (!this.#priceRangesPromise) {
      this.#priceRangesPromise = this.#resolve('priceRanges', { data: [] }).then((response) => {
        if (Array.isArray(response?.data)) {
          this.#priceRanges = response.data;
        } else {
          console.warn('[MenuService] price-ranges payload has no "data" array.', response);
          this.#priceRanges = [];
        }
        return response;
      });
    }

    return this.#priceRangesPromise;
  }

  /**
   * Restaurant profile + settings, mapped from the flat API payload to the
   * nested shape the components consume.
   * @returns {Promise<any>}
   */
  async getRestaurantInfo() {
    const response = await this.#resolve('settings', null);
    const payload = response?.data;

    if (!payload || !payload.restaurant_name) {
      return response;
    }

    const businessHours = {};
    if (payload.business_hours) {
      for (const [key, value] of Object.entries(payload.business_hours)) {
        const normalisedKey = String(key).toLowerCase();
        businessHours[MenuService.DAY_MAP[normalisedKey] ?? key] = value;
      }
    }

    return {
      data: {
        restaurant: {
          name: payload.restaurant_name,
          slug: payload.restaurant_slug,
          template_id: 'default',
          phone: String(payload.restaurant_phone),
          address: payload.restaurant_address,
          location: {
            lat: payload.location_lat,
            lng: payload.location_lng,
          },
        },
        settings: {
          whatsapp_config: {
            number: String(payload.whatsapp_number),
            message_template: payload.whatsapp_message,
          },
          display_config: {
            currency: 'PEN',
            language: payload.language,
          },
          order_config: {
            delivery_fee: Number(payload.delivery_fee),
            payment_methods: payload.payment_methods ?? [],
            delivery_enabled: payload.delivery_enabled === 'Activo',
            max_order_quantity: Number(payload.max_order_quantity),
          },
          business_config: {
            social_media: {
              tiktok: payload.tiktok ?? '',
              facebook: payload.facebook ?? '',
              instagram: payload.instagram ?? '',
            },
            business_hours: businessHours,
            delivery_zones: Array.isArray(payload.delivery_zones) ? payload.delivery_zones : [],
          },
          description: payload.description ?? '',
          tags: Array.isArray(payload.tags) ? payload.tags : [],
          logo_url: payload.logo_url ?? null,
        },
      },
    };
  }

  /**
   * Background + decorative images.
   * Local data wins when present; otherwise the endpoint is queried.
   * @returns {Promise<{ data: Record<string, any> }>}
   */
  getTemplateImages() {
    // The Angular app never called the API for this one: local JSON only.
    if (this.#local.templateImages !== undefined) {
      return Promise.resolve(this.#local.templateImages);
    }

    return this.#resolve('templateImages', { data: {} });
  }

  /**
   * Ready-to-render decorations (service data wins, local fallbacks
   * otherwise) — the shape the page template consumes directly.
   * @returns {Promise<ReturnType<typeof shapeDecorations>>}
   */
  async getDecorations() {
    const response = await this.getTemplateImages();
    return shapeDecorations(response?.data ?? {});
  }

  /**
   * @returns {Promise<{ data: any[] }>}
   */
  getCombos() {
    return this.#resolve('combos', { data: [] });
  }

  /**
   * @returns {Promise<{ data: any[] }>}
   */
  getPromotions() {
    return this.#resolve('promotions', { data: [] });
  }

  // ─── Bulk load ────────────────────────────────────────────────────────────

  /**
   * Everything the menu page needs in one call (replaces the old `forkJoin`).
   * Price ranges are kicked off as well so cards can resolve ranges later.
   *
   * @returns {Promise<{ blocks: any[], combos: any[], promotions: any[], templateImages: any, decorations: ReturnType<typeof shapeDecorations> }>}
   */
  async load() {
    if (!this.#ready) {
      this.#ready = (async () => {
        const [menu, combos, promotions, templateImages] = await Promise.all([
          this.getMenu(),
          this.getCombos(),
          this.getPromotions(),
          this.getTemplateImages(),
        ]);

        this.#blocks = menu.blocks;
        this.#combos = combos?.data ?? [];
        this.#promotions = promotions?.data ?? [];
        this.#templateImages = templateImages?.data ?? {};
        this.#decorations = shapeDecorations(this.#templateImages);

        // Fire and forget: ranges are needed only when a card is opened.
        this.getPriceRanges().catch(() => {});

        return {
          blocks: this.#blocks,
          combos: this.#combos,
          promotions: this.#promotions,
          templateImages: this.#templateImages,
          decorations: this.#decorations,
        };
      })();
    }

    return this.#ready;
  }

  // ─── Sync accessors (valid after `await load()`) ───────────────────────────

  /** @returns {any[]} */
  get blocks() {
    return this.#blocks;
  }

  /** @returns {any[]} */
  get combos() {
    return this.#combos;
  }

  /** @returns {any[]} */
  get promotions() {
    return this.#promotions;
  }

  /** @returns {any[]} */
  get priceRanges() {
    return this.#priceRanges;
  }

  /** @returns {Record<string, any>} */
  get templateImages() {
    return this.#templateImages;
  }

  /** @returns {ReturnType<typeof shapeDecorations> | null} */
  get decorations() {
    return this.#decorations;
  }

  /**
   * Look up a price range among the memoised ranges.
   * @param {string | number | null | undefined} priceRangeId
   * @returns {import('../types/menu.js').PriceRange | null}
   */
  findPriceRange(priceRangeId) {
    return findPriceRange(this.#priceRanges, priceRangeId);
  }
}

/** Shared instance used by the page — the only orchestrator (F5). */
export const menuService = new MenuService();
