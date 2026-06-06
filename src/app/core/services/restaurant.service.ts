import { Injectable, inject, signal, computed } from '@angular/core';
import { MenuService } from './menu.service';
import { RestaurantInfo } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly menuService = inject(MenuService);
  
  // Internal state
  private readonly _restaurantInfo = signal<RestaurantInfo | null>(null);

  constructor() {
    this.loadRestaurantInfo();
  }

  private loadRestaurantInfo(): void {
    this.menuService.getRestaurantInfo().subscribe(info => {
      this._restaurantInfo.set(info);
    });
  }

  // Exposed signals
  readonly restaurant = computed(() => this._restaurantInfo()?.data.restaurant);
  readonly settings = computed(() => this._restaurantInfo()?.data.settings);
  
  readonly orderConfig = computed(() => this.settings()?.order_config);
  readonly whatsappConfig = computed(() => this.settings()?.whatsapp_config);
  readonly businessConfig = computed(() => this.settings()?.business_config);
  readonly socialMedia = computed(() => this.businessConfig()?.social_media);
}
