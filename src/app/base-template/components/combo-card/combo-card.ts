import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LucideAngularModule, Plus } from 'lucide-angular';
import { PrecioPipe } from '../../../core/pipes/precio.pipe';
import { AddButtonComponent } from '../add-button/add-button.component';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { computed, inject } from '@angular/core';

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  url: string;
  cloudinary_id: string;
}

@Component({
  selector: 'app-combo-card',
  standalone: true,
  imports: [LucideAngularModule, PrecioPipe, AddButtonComponent],
  templateUrl: './combo-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboCardComponent {
  combo = input.required<Combo>();
  addToCart = output<Combo>();

  private readonly restaurantService = inject(RestaurantService);

  readonly canOrder = computed(() => this.restaurantService.orderConfig()?.delivery_enabled ?? true);

  Plus = Plus;
}
