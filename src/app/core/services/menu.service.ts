import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import {
  MenuResponse,
  PriceRangesResponse,
  GalleryResponse,
  TemplateImagesResponse,
} from '../models/menu.model';
import { RestaurantInfo } from '../models/restaurant.model';

// Local data imports
import menuDataLocal from '../../data/menu_render.json';
import priceRangesLocal from '../../data/price_ranges.json';
import restaurantLocal from '../../data/restaurant.json';
import galleryLocal from '../../data/gallery.json';
import templateImagesLocal from '../../data/template-images.json';
import combosLocal from '../../data/combos.json';
import promotionsLocal from '../../data/promotions.json';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private useApi = false;
  private apiUrl =
    'https://script.google.com/macros/s/AKfycbxCDiG_frhFkGDYnaY-bB6qelCLwp2sg26cL5EtxrfL2MQ7-iArHPY-S1K74tgmApeC/exec';

  constructor(private http: HttpClient) { }

  // ─── Reactive price ranges store ────────────────────────────────────────────
  private readonly _priceRanges = signal<import('../models/price-range.model').PriceRange[]>([]);
  readonly priceRanges = this._priceRanges.asReadonly();

  private priceRanges$?: Observable<PriceRangesResponse>;

  loadPriceRanges(): void {
    this.getPriceRanges().subscribe(response => {
      // Ensure we only set the signal if we have an array of data
      if (response && Array.isArray(response.data)) {
        this._priceRanges.set(response.data);
      } else {
        console.warn('MenuService: price-ranges API did not return an array in the "data" property', response);
      }
    });
  }

  setUseApi(value: boolean): void {
    this.useApi = value;
  }

  getMenuData(): Observable<MenuResponse> {
    if (this.useApi) {
      return this.http.get<MenuResponse>(`${this.apiUrl}?json=menu`);
    } else {
      return of(menuDataLocal as unknown as MenuResponse);
    }
  }

  getPriceRanges(): Observable<PriceRangesResponse> {
    if (!this.priceRanges$) {
      const source$ = this.useApi
        ? this.http.get<PriceRangesResponse>(`${this.apiUrl}?json=price-range`)
        : of(priceRangesLocal as PriceRangesResponse);

      this.priceRanges$ = source$.pipe(
        shareReplay(1),
        catchError(() => of({ data: [] }))
      );
    }
    return this.priceRanges$!;
  }


  /**
   * Get restaurant information and settings.
   */
  getRestaurantInfo(): Observable<RestaurantInfo> {
    if (this.useApi) {
      return this.http.get<any>(`${this.apiUrl}?json=settings`).pipe(
        map(response => {
          if (response && response.data && response.data.restaurant_name) {
            const d = response.data;

            const dayMap: { [key: string]: string } = {
              'lunes': 'monday',
              'martes': 'tuesday',
              'miercoles': 'wednesday',
              'jueves': 'thursday',
              'viernes': 'friday',
              'sabado': 'saturday',
              'domingo': 'sunday'
            };
            const mappedBusinessHours: any = {};
            if (d.business_hours) {
              for (const [key, value] of Object.entries(d.business_hours)) {
                const mappedKey = dayMap[key.toLowerCase()] || key;
                mappedBusinessHours[mappedKey] = value;
              }
            }

            // Map flat structure to nested RestaurantInfo
            return {
              data: {
                restaurant: {
                  name: d.restaurant_name,
                  slug: d.restaurant_slug,
                  template_id: 'default', // Fallback
                  phone: String(d.restaurant_phone),
                  address: d.restaurant_address,
                  location: {
                    lat: d.location_lat,
                    lng: d.location_lng
                  }
                },
                settings: {
                  whatsapp_config: {
                    number: String(d.whatsapp_number),
                    message_template: d.whatsapp_message
                  },
                  display_config: {
                    currency: 'PEN', // Fallback or read if available
                    language: d.language
                  },
                  order_config: {
                    delivery_fee: Number(d.delivery_fee),
                    payment_methods: d.payment_methods || [],
                    delivery_enabled: d.delivery_enabled === 'Activo',
                    max_order_quantity: Number(d.max_order_quantity)
                  },
                  business_config: {
                    social_media: {
                      tiktok: d.tiktok || '',
                      facebook: d.facebook || '',
                      instagram: d.instagram || ''
                    },
                    business_hours: mappedBusinessHours,
                    delivery_zones: Array.isArray(d.delivery_zones) ? d.delivery_zones : []
                  },
                  description: d.description || '',
                  tags: Array.isArray(d.tags) ? d.tags : [],
                  logo_url: d.logo_url || null
                }
              }
            } as RestaurantInfo;
          }
          return response as RestaurantInfo;
        })
      );
    } else {
      return of(restaurantLocal as RestaurantInfo);
    }
  }

  /**
   * Get gallery data.
   */
  getGalleryData(): Observable<GalleryResponse> {
    if (this.useApi) {
      return this.http.get<GalleryResponse>(`${this.apiUrl}?json=gallery`)
        .pipe(
          map(response => {
            if (response && response.data) {
              response.data = response.data.map((item: any) => ({
                ...item,
                type: item.type || 'image'
              }));
            }
            return response;
          })
        );
    } else {
      return of(galleryLocal as GalleryResponse).pipe(
        map(response => {
          if (response && response.data) {
            response.data = response.data.map((item: any) => ({
              ...item,
              type: item.type || 'image'
            }));
          }
          return response;
        })
      );
    }
  }

  /**
   * Get template images data.
   */
  getTemplateImages(): Observable<TemplateImagesResponse> {

    return of(templateImagesLocal as TemplateImagesResponse);

  }

  /**
   * Get all combos.
   */
  getCombos(): Observable<{ data: any[] }> {
    if (this.useApi) {
      return this.http.get<{ data: any[] }>(`${this.apiUrl}?json=combos`).pipe(
        catchError(() => of({ data: [] }))
      );
    } else {
      return of(combosLocal as { data: any[] });
    }
  }

  /**
   * Get all promotions.
   */
  getPromotions(): Observable<{ data: any[] }> {
    if (this.useApi) {
      return this.http.get<{ data: any[] }>(`${this.apiUrl}?json=promotions`).pipe(
        catchError(() => of({ data: [] }))
      );
    } else {
      return of(promotionsLocal as { data: any[] });
    }
  }
}
