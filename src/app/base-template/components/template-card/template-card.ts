import { ChangeDetectionStrategy, Component, input, output, inject, computed } from '@angular/core';
import { LucideAngularModule, ThumbsUp, Utensils, Star, Plus, ShoppingBag } from 'lucide-angular';
import { Product } from '../../../core/models/product.model';
import { PrecioPipe } from '../../../core/pipes/precio.pipe';
import { AddButtonComponent } from '../add-button/add-button.component';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-template-card',
  standalone: true,
  imports: [LucideAngularModule, PrecioPipe, AddButtonComponent, CommonModule],
  templateUrl: './template-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateCardComponent {
  product = input.required<Product>();
  productClick = output<Product>();
  addToCart = output<Product>();

  private readonly menuService = inject(MenuService);
  private readonly restaurantService = inject(RestaurantService);

  readonly canOrder = computed(() => this.restaurantService.orderConfig()?.delivery_enabled ?? true);

  Utensils = Utensils;
  Star = Star;
  Plus = Plus;
  ThumbsUp = ThumbsUp;
  ShoppingBag = ShoppingBag;

  /** True if the product is configured to have price ranges. */
  readonly hasPriceRange = computed(() => !!this.product().price_range_id);

  /** Finds the matching price range from the reactive store. */
  readonly matchedRange = computed(() => {
    const rawId = this.product().price_range_id;
    if (!rawId) return null;

    const rangeId = String(rawId).trim();
    const allRanges = this.menuService.priceRanges();

    return allRanges.find(r => String(r.id).trim() === rangeId) ?? null;
  });

  /** Minimum price from the range, or flat product price. */
  readonly startingPrice = computed<number | null>(() => {
    const range = this.matchedRange();
    if (range && range.entries.length > 0) {
      const prices = range.entries
        .map(e => Number(e.price))
        .filter(n => !isNaN(n) && n > 0);
      return prices.length > 0 ? Math.min(...prices) : null;
    }
    const p = this.product().price;
    if (p === '' || p === null || p === undefined) return null;
    const n = Number(p);
    return isNaN(n) ? null : n;
  });

  onAddClick(event: Event) {
    event.stopPropagation();
    if (this.hasPriceRange()) {
      // Must open detail modal
      this.productClick.emit(this.product());
    } else {
      this.addToCart.emit(this.product());
    }
  }
}
