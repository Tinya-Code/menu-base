import { Injectable, inject, computed } from '@angular/core';
import { RestaurantService } from './restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  private readonly restaurantService = inject(RestaurantService);

  /**
   * Exposed settings for components.
   */
  readonly activeSettings = computed(() => this.restaurantService.settings());
}
