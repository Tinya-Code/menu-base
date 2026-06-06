import { ChangeDetectionStrategy, Component, input, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingBag, Plus, Minus, X, MessageCircle, Star } from 'lucide-angular';
import { Product } from '../../../core/models/product.model';
import { PrecioPipe } from '../../../core/pipes/precio.pipe';
import { DataStoreService } from '../../../core/services/data-store.service';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { PriceRangeEntry } from '../../../core/models/price-range.model';

@Component({
  selector: 'app-chifa-product-detail',
  standalone: true,
  imports: [LucideAngularModule, PrecioPipe, CommonModule],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChifaProductDetail {
  product = input.required<Product>();
  addToCart = output<{ product: Product, quantity: number, selectedEntry?: PriceRangeEntry }>();
  close = output<void>();

  private readonly dataStore = inject(DataStoreService);
  private readonly menuService = inject(MenuService);
  private readonly restaurantService = inject(RestaurantService);

  readonly maxQuantity = computed(() => this.restaurantService.orderConfig()?.max_order_quantity ?? 99);
  
  readonly canOrder = computed(() => this.restaurantService.orderConfig()?.delivery_enabled ?? true);

  // UI Icons
  ShoppingBag = ShoppingBag;
  Plus = Plus;
  Minus = Minus;
  X = X;
  MessageCircle = MessageCircle;
  Star = Star;

  quantity = signal(1);
  private readonly _selectedEntry = signal<PriceRangeEntry | null>(null);

  /** Reactive lookup: updates whenever priceRanges store or product changes */
  readonly priceRange = computed(() => {
    const rawId = this.product().price_range_id;
    if (!rawId) return null;

    const rangeId = String(rawId).trim();
    const allRanges = this.menuService.priceRanges();

    // Flexible matching (string comparison + trim)
    return allRanges.find(r => String(r.id).trim() === rangeId) ?? null;
  });

  /** True if the product is expected to have a range but data hasn't arrived yet. */
  readonly isLoadingRange = computed(() => {
    return !!this.product().price_range_id && !this.priceRange();
  });

  /** The effectively selected entry. Defaults to the first entry if none is manually selected. */
  readonly selectedEntry = computed(() => {
    const manual = this._selectedEntry();
    if (manual) return manual;

    const range = this.priceRange();
    return (range && range.entries.length > 0) ? range.entries[0] : null;
  });

  readonly currentPrice = computed(() => {
    // If we are waiting for a range, don't show the flat price (which is usually empty/0)
    if (this.isLoadingRange()) return null;

    const entry = this.selectedEntry();
    if (entry) return Number(entry.price);
    const raw = this.product().price;
    if (raw === null || raw === undefined || raw === '') return 0;
    const parsed = Number(raw);
    return isNaN(parsed) ? 0 : parsed;
  });

  increase() { if (this.quantity() < this.maxQuantity()) this.quantity.update(q => q + 1); }
  decrease() { if (this.quantity() > 1) this.quantity.update(q => q - 1); }

  selectEntry(entry: PriceRangeEntry) {
    this._selectedEntry.set(entry);
  }

  onAddToCart() {
    this.addToCart.emit({
      product: this.product(),
      quantity: this.quantity(),
      selectedEntry: this.selectedEntry() ?? undefined
    });
    this.close.emit();
  }

  orderViaWhatsApp() {
    const settings = this.dataStore.activeSettings();
    const phone = settings?.whatsapp_config?.number;
    if (!phone) return;

    let message = `Hola, quisiera pedir ${this.quantity()}x ${this.product().name}`;

    const entry = this.selectedEntry();
    if (entry) {
      message += ` (${entry.qty} unds - S/ ${entry.price})`;
      if (entry.bonus) message += ` + ${entry.bonus}`;
    }

    message += ` del menú.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
