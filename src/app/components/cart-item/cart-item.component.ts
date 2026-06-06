import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CartItem } from '../../core/models/cart.model';
import { PrecioPipe } from '../../core/pipes/precio.pipe';

import { LucideAngularModule, Minus, Plus, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [PrecioPipe, LucideAngularModule],
  templateUrl: './cart-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  // Icons
  readonly Minus = Minus;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;

  // Entradas (Inputs usando signals)
  item = input.required<CartItem>();

  // Salidas (Outputs usando signals)
  increase = output<string>();
  decrease = output<string>();
  remove = output<string>();

  /**
   * Emite el evento para incrementar la cantidad.
   */
  onIncrease(): void {
    this.increase.emit(this.item().id);
  }

  /**
   * Emite el evento para decrementar la cantidad.
   */
  onDecrease(): void {
    this.decrease.emit(this.item().id);
  }

  /**
   * Emite el evento para remover el item.
   */
  onRemove(): void {
    this.remove.emit(this.item().id);
  }
}
