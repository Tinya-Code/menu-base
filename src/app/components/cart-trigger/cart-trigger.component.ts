import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cart } from '../../core/services/cart.service';
import { PrecioPipe } from '../../core/pipes/precio.pipe';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { BusinessHoursService } from '../../core/services/business-hours.service';

@Component({
  selector: 'app-cart-trigger',
  standalone: true,
  imports: [CommonModule, PrecioPipe, LucideAngularModule],
  templateUrl: './cart-trigger.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartTriggerComponent {
  templateId = input<string | null>();
  backgroundColor = input<string | null>();

  private readonly _cart = inject(Cart);
  private readonly _businessHours = inject(BusinessHoursService);

  readonly ArrowRight = ArrowRight;

  // Exposición de signals del servicio
  readonly count = this._cart.count;
  readonly total = this._cart.total;
  readonly isEmpty = this._cart.isEmpty;

  /**
   * Abre el carrito si está abierto el negocio.
   */
  openCart(): void {
    if (!this._businessHours.isOpen()) {
      this._cart.addItem({ id: 'dummy' } as any, 0); // Dispara el modal global
      return;
    }
    this._cart.open();
  }
}
