import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Block } from '../../core/models/block.model';
import { BaseTemplate } from '../../base-template';
import { CommonModule } from '@angular/common';

// UI Components
import { SidebarCart } from '../../components/sidebar-cart/sidebar-cart.component';
import { CartTriggerComponent } from '../../components/cart-trigger/cart-trigger.component';
import { RestaurantClosedModalComponent } from '../../components/restaurant-closed-modal/restaurant-closed-modal.component';
import { CategoryNav } from '../../components/category-nav/category-nav.component';
import { ChifaProductDetail } from '../../base-template/components/product-detail/product-detail';
import { WhatsAppButton } from '../../components/whatsapp-button/whatsapp-button.component';
import { LoadingScreenComponent } from '../../components/loading-screen/loading-screen.component';
import { forkJoin } from 'rxjs';

// Services
import { Cart } from '../../core/services/cart.service';
import { BusinessHoursService } from '../../core/services/business-hours.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    BaseTemplate,
    CommonModule,
    SidebarCart,
    CartTriggerComponent,
    RestaurantClosedModalComponent,
    CategoryNav,
    ChifaProductDetail,
    WhatsAppButton,
    LoadingScreenComponent,
  ],
  templateUrl: './menu.html',
})
export class Menu implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly _cart = inject(Cart);
  private readonly _businessHours = inject(BusinessHoursService);

  // UI State
  readonly isLoading = signal(true);
  readonly selectedProduct = signal<any | null>(null);

  // Data signals
  readonly blocks = signal<Block[]>([]);
  readonly combos = signal<any[]>([]);
  readonly promotions = signal<any[]>([]);

  readonly allCategories = computed(() => {
    return this.blocks().flatMap((block) => block.categories.map((cat) => ({ category: cat })));
  });

  // Service exposure
  readonly isCartOpen = this._cart.isOpen;
  readonly isRestaurantClosed = this._cart.isBusinessClosed;
  readonly businessHours = this._businessHours.rawHours;

  ngOnInit(): void {
    // We wait for the main data sources to be ready
    forkJoin({
      menu: this.menuService.getMenuData(),
      combos: this.menuService.getCombos(),
      promotions: this.menuService.getPromotions()
    }).subscribe(({ menu, combos, promotions }) => {
      // 1. Process Menu Data
      if (menu?.data?.blocks) {
        const normalizedBlocks = menu.data.blocks.map((block: any) => ({
          ...block,
          categories: (block.categories || []).map((cat: any) => ({
            ...cat,
            products: cat.products || []
          }))
        }));
        this.blocks.set(normalizedBlocks);
      }

      // 2. Process Combos
      if (combos?.data) {
        this.combos.set(combos.data);
      }

      // 3. Process Promotions
      if (promotions?.data) {
        this.promotions.set(promotions.data);
      }

      // 4. Also trigger price ranges load (internally managed by service signal)
      this.menuService.loadPriceRanges();

      // Give it a tiny extra delay for the animations to feel smooth
      setTimeout(() => {
        this.isLoading.set(false);
      }, 800);
    });
  }

  onProductClick(product: any): void {
    this.selectedProduct.set(product);
  }

  onAddToCart(product: any, quantity: number = 1, selectedEntry?: any): void {
    this._cart.addItem(product as any, quantity, selectedEntry);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  closeClosedModal(): void {
    this._cart.closeBusinessClosedModal();
  }
}
