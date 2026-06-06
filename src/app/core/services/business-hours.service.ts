import { Injectable, inject, computed } from '@angular/core';
import { RestaurantService } from './restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessHoursService {
  private readonly restaurantService = inject(RestaurantService);

  /**
   * Get the raw business hours object.
   */
  readonly rawHours = computed(() => this.restaurantService.businessConfig()?.business_hours);

  /**
   * Get all business hours as an array for iteration.
   */
  readonly hours = computed(() => {
    const businessHours = this.rawHours();
    if (!businessHours) return [];

    return Object.entries(businessHours).map(([day, schedule]) => ({
      day,
      ...schedule
    }));
  });

  /**
   * Check if the restaurant is currently open (reactive signal).
   */
  readonly isCurrentlyOpen = computed(() => {
    const businessHours = this.rawHours();
    if (!businessHours) return true;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const schedule = (businessHours as any)[currentDay];

    if (!schedule || !schedule.isOpen) return false;

    const currentTime = now.getHours() * 100 + now.getMinutes();
    const [openH, openM] = schedule.open.split(':').map(Number);
    const [closeH, closeM] = schedule.close.split(':').map(Number);

    const openTime = openH * 100 + openM;
    const closeTime = closeH * 100 + closeM;

    return currentTime >= openTime && currentTime <= closeTime;
  });

  /**
   * Helper method for non-reactive checks.
   */
  isOpen(): boolean {
    return this.isCurrentlyOpen();
  }
}
