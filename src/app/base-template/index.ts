import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';

import { Product } from '../core/models/product.model';
import { Block } from '../core/models/block.model';
import { TemplateHeader } from './components/header/header';
import { TemplateFooter } from './components/footer/footer';
import { LayoutScaleComponent } from '../layout/layout-scale/layout-scale';
import { Combo } from './components/combo-card/combo-card';
import { Promotion } from './components/promotion-card/promotion-card';
import { MenuService } from '../core/services/menu.service';

// Block Components
import { Block1Component } from './blocks/block-1';
import { Block2Component } from './blocks/block-2';
import { Block3Component } from './blocks/block-3';
import { Block4Component } from './blocks/block-4';
import { Block5Component } from './blocks/block-5';
import { Block6Component } from './blocks/block-6';
import { Block7Component } from './blocks/block-7';
import { BlockCombosComponent } from './blocks/block-combos';
import { BlockPromotionsComponent } from './blocks/block-promotions';

@Component({
  selector: 'app-base-template',
  standalone: true,
  imports: [
    TemplateHeader,
    TemplateFooter,
    LayoutScaleComponent,
    Block1Component,
    Block2Component,
    Block3Component,
    Block5Component,
    Block6Component,
    Block7Component,
    Block4Component,
    BlockCombosComponent,
    BlockPromotionsComponent,
  ],
  template: `
    <app-template-header></app-template-header>

    <app-layout-scale>
      <div
        [style]="'background-image: url(' + backgroundImage() + ')'"
        class="bg-repeat relative mx-2"
      >
        @if (hasBlocks() || hasCombos() || hasPromotions()) {
          <div class=" h-full w-auto mx-2 py-12">
            <app-block-promotions
              [promotions]="promotions()"
              (productClick)="productClick.emit($event)"
              (addToCart)="addToCart.emit($event)"
            >
            </app-block-promotions>

            <app-block-combos [combos]="combos()" (addToCart)="addToCart.emit($event)">
            </app-block-combos>

            @for (block of blocks(); track block.id) {
              @switch (block.id) {
                @case ('block-1') {
                  <app-block-1
                    [categories]="block.categories"
                    [templateData]="templateData()"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  ></app-block-1>
                }
                @case ('block-2') {
                  <app-block-2
                    [categories]="block.categories"
                    [templateData]="templateData()"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  ></app-block-2>
                }
                @case ('block-3') {
                  <app-block-3
                    [categories]="block.categories"
                    [templateData]="templateData()"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  ></app-block-3>
                }
                @case ('block-4') {
                  <app-block-4
                    [categories]="block.categories"
                    [templateData]="templateData()"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  ></app-block-4>
                }
                @case ('block-5') {
                  <app-block-5
                    [categories]="block.categories"
                    [templateData]="templateData()"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  ></app-block-5>
                }
                @case ('block-6') {
                  <app-block-6
                    [categories]="block.categories"
                    [templateData]="templateData()"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  ></app-block-6>
                }
                @case ('block-7') {
                  <app-block-7
                    [categories]="block.categories"
                    [templateData]="templateData()"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  ></app-block-7>
                }
              }
            }
          </div>
        } @else {
          <div
            class="flex flex-col items-center justify-center py-20 text-white italic font-medium"
          >
            <p class="text-xl">Estamos actualizando nuestra carta...</p>
            <p class="text-sm mt-2">Danos un momento para prepararte lo mejor.</p>
          </div>
        }
      </div>
    </app-layout-scale>
    <app-template-footer class="mt-20 block"></app-template-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseTemplate implements OnInit {
  private readonly menuService = inject(MenuService);

  blocks = input.required<Block[]>();
  templateData = input<any>();
  combos = input<Combo[]>([]);
  promotions = input<Promotion[]>([]);
  productClick = output<Product>();
  addToCart = output<Product | Combo | Promotion>();

  backgroundImage = signal('/images/bg.png');

  ngOnInit(): void {
    this.menuService.getTemplateImages().subscribe((data) => {
      if (data.data?.background) {
        this.backgroundImage.set(data.data.background);
      }
    });
  }

  protected hasBlocks = computed(() => this.blocks().length > 0);
  protected hasCombos = computed(() => this.combos().length > 0);
  protected hasPromotions = computed(() => this.promotions().length > 0);
}
