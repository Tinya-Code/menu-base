import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { PrecioPipe } from '../../../core/pipes/precio.pipe';
import { AddButtonComponent } from '../add-button/add-button.component';
import { Product } from '../../../core/models/product.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { computed, inject } from '@angular/core';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  cloudinary_id: string;
  url: string;
}

@Component({
  selector: 'app-promotion-card',
  standalone: true,
  imports: [LucideAngularModule, PrecioPipe, AddButtonComponent, NgClass],
  templateUrl: './promotion-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionCardComponent {
  promotion = input.required<Promotion>();
  addToCart = output<Promotion>();
  productClick = output<Product>();
  Plus = Plus;

  private readonly restaurantService = inject(RestaurantService);

  readonly canOrder = computed(() => this.restaurantService.orderConfig()?.delivery_enabled ?? true);

  showMore = signal(false);

  toggleShowMore(event: Event): void {
    event.stopPropagation();
    this.showMore.set(!this.showMore());
  }

  onCardClick() {
    const promo = this.promotion();
    // Map Promotion to Product
    const product: Product = {
      id: promo.id,
      name: promo.name,
      description: promo.description,
      price: promo.discountedPrice, // Show the discounted price as the main price
      image_url: promo.url,
      qty_label: null,
      price_range_id: null,
      category_id: 'promotion',
      cloudinary_id: promo.cloudinary_id,
      is_hidden: false
    };
    this.productClick.emit(product);
  }

  onAddClick(event: Event) {
    event.stopPropagation();
    this.addToCart.emit(this.promotion());
  }
}
