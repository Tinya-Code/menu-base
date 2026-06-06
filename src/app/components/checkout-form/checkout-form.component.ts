import { ChangeDetectionStrategy, Component, inject, computed, OnInit, effect } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Cart } from '../../core/services/cart.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Local } from '../../core/services/local.service';
import {
  LucideAngularModule,
  MessageCircle,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-angular';

import { BusinessHoursService } from '../../core/services/business-hours.service';

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './checkout-form.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(Cart);
  private readonly restaurantService = inject(RestaurantService);
  private readonly _businessHours = inject(BusinessHoursService);
  private readonly _local = inject(Local);

  readonly MessageCircle = MessageCircle;
  readonly CreditCard = CreditCard;
  readonly Banknote = Banknote;
  readonly Smartphone = Smartphone;

  private readonly STORAGE_KEYS = {
    NAME: 'user_name',
    ADDRESS: 'user_address',
  };

  readonly checkoutForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    paymentMethod: ['', Validators.required],
  });

  readonly isDeliveryEnabled = computed(() => this.restaurantService.orderConfig()?.delivery_enabled ?? true);

  constructor() {
    effect(() => {
      if (!this.isDeliveryEnabled()) {
        this.checkoutForm.get('address')?.disable();
      } else {
        this.checkoutForm.get('address')?.enable();
      }
    });
  }

  ngOnInit(): void {
    const savedName = this._local.get<string>(this.STORAGE_KEYS.NAME);
    const savedAddress = this._local.get<string>(this.STORAGE_KEYS.ADDRESS);

    if (savedName) this.checkoutForm.get('name')?.setValue(savedName);
    if (savedAddress) this.checkoutForm.get('address')?.setValue(savedAddress);
  }

  readonly paymentMethods = computed(
    () => this.restaurantService.orderConfig()?.payment_methods ?? [],
  );

  readonly whatsappConfig = this.restaurantService.whatsappConfig;

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.cart.isEmpty()) return;
    if (!this._businessHours.isOpen()) {
      this.cart.showBusinessClosedModal();
      return;
    }

    const { name, address, paymentMethod } = this.checkoutForm.value;
    const phoneNumber = this.whatsappConfig()?.number;
    if (!phoneNumber) return;

    if (name) this._local.set(this.STORAGE_KEYS.NAME, name);
    if (address) this._local.set(this.STORAGE_KEYS.ADDRESS, address);

    const items = this.cart.items();
    const total = this.cart.total();
    const deliveryFee = this.cart.deliveryFee();

    let message = `${this.whatsappConfig()?.message_template || 'Hola, me gustaría ordenar:'}\n\n`;
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    if (this.isDeliveryEnabled() && deliveryFee > 0) {
      message += `\n*Subtotal: S/ ${this.cart.subtotal().toFixed(2)}*\n`;
      message += `*Delivery: S/ ${deliveryFee.toFixed(2)}*\n`;
    }

    message += `\n*Total: S/ ${total.toFixed(2)}*\n\n`;
    message += `*Datos de entrega:*\n`;
    message += `Nombre: ${name}\n`;
    if (this.isDeliveryEnabled()) {
      message += `Dirección: ${this.checkoutForm.getRawValue().address}\n`;
    } else {
      message += `Tipo: Retiro en tienda\n`;
    }
    message += `Método de Pago: ${this.formatPaymentMethod(paymentMethod!)}\n`;

    window.open(`https://wa.me/51${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  }

  protected formatPaymentMethod(method: string): string {
    const formats: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      yape: 'Yape',
      plin: 'Plin',
    };
    return formats[method] || method;
  }

  protected getPaymentIcon(method: string): any {
    const icons: Record<string, any> = {
      cash: this.Banknote,
      card: this.CreditCard,
      yape: this.Smartphone,
      plin: this.Smartphone,
    };
    return icons[method] || this.CreditCard;
  }

  protected getPaymentColor(method: string): string {
    const colors: Record<string, string> = { yape: '#742284', plin: '#00d4d8', cash: '#22c55e' };
    return colors[method] || 'var(--color-primary)';
  }
}
