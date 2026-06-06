import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { PriceRangeEntry } from '../models/price-range.model';
import { RestaurantService } from './restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class Cart {
  // Signals for UI state
  readonly isOpen = signal(false);
  readonly isBusinessClosed = signal(false);
  
  // Cart items signal
  readonly items = signal<CartItem[]>([]);

  // Computed signals
  readonly count = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
  
  private restaurantService = inject(RestaurantService);

  readonly subtotal = computed(() => this.items().reduce((acc, item) => acc + (item.price * item.quantity), 0));
  readonly deliveryFee = computed(() => this.restaurantService.orderConfig()?.delivery_fee ?? 0);
  
  readonly total = computed(() => this.subtotal() + this.deliveryFee());
  
  readonly isEmpty = computed(() => this.items().length === 0);

  /**
   * Open the cart sidebar.
   */
  open(): void {
    this.isOpen.set(true);
  }

  /**
   * Close the cart sidebar.
   */
  close(): void {
    this.isOpen.set(false);
  }

  /**
   * Add an item to the cart.
   * Handles products with or without price range entries.
   */
  addItem(product: Product, quantity: number = 1, selectedEntry?: PriceRangeEntry): void {
    const currentItems = this.items();
    
    // Generate a unique ID for this specific combination of product and entry
    const entryId = selectedEntry ? `-${selectedEntry.qty}-${selectedEntry.price}` : '';
    const cartItemId = `${product.id}${entryId}`;

    const existingItem = currentItems.find(i => i.id === cartItemId);
    const maxQty = this.restaurantService.orderConfig()?.max_order_quantity ?? 99;

    if (existingItem) {
      this.updateQuantity(cartItemId, existingItem.quantity + quantity);
    } else {
      if (quantity > maxQty) return;
      const rawPrice = selectedEntry
        ? Number(selectedEntry.price)
        : Number(product.price);
      const resolvedPrice = isNaN(rawPrice) ? 0 : rawPrice;

      const entryLabel = selectedEntry
        ? ` — ${selectedEntry.qty} und${Number(selectedEntry.qty) !== 1 ? 's' : ''}`
        : '';

      const newItem: CartItem = {
        id: cartItemId,
        originalProductId: product.id,
        name: `${product.name}${entryLabel}`,
        price: resolvedPrice,
        quantity: quantity,
        image_url: product.image_url,
        selectedEntry: selectedEntry ? {
          qty: selectedEntry.qty,
          price: selectedEntry.price,
          bonus: selectedEntry.bonus
        } : undefined
      };
      this.items.set([...currentItems, newItem]);
    }
    this.open();
  }

  /**
   * Update the quantity of an item.
   * @param cartItemId string
   * @param quantity number
   */
  updateQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(cartItemId);
      return;
    }
    
    const maxQty = this.restaurantService.orderConfig()?.max_order_quantity ?? 99;
    if (quantity > maxQty) {
      return;
    }

    this.items.update(items => 
      items.map(item => item.id === cartItemId ? { ...item, quantity } : item)
    );
  }

  /**
   * Remove an item from the cart.
   * @param cartItemId string
   */
  removeItem(cartItemId: string): void {
    this.items.update(items => items.filter(item => item.id !== cartItemId));
  }

  /**
   * Clear the cart.
   */
  clear(): void {
    this.items.set([]);
  }

  /**
   * Show the business closed modal.
   */
  showBusinessClosedModal(): void {
    this.isBusinessClosed.set(true);
  }

  /**
   * Close the business closed modal.
   */
  closeBusinessClosedModal(): void {
    this.isBusinessClosed.set(false);
  }
}
