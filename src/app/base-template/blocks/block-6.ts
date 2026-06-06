import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { TemplateCardComponent } from '../components/template-card/template-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';

@Component({
  selector: 'app-block-6',
  standalone: true,
  imports: [TemplateCardComponent, TemplateSectionTitleComponent],
  template: `
    @if (categories().length > 0) {
      <section class="relative py-12  px-8 overflow-hidden ">
        <div class="grid grid-cols-5 md:grid-cols-12 md:gap-12 items-start">
          @for (cat of categories(); track cat.id; let isLast = $last; let total = $count) {
            <section
              [id]="'category-' + cat.id"
              class="flex flex-col w-full col-span-4 md:col-span-8"
            >
              <app-template-section-title
                [title]="cat.name"
                [description]="cat.description || ''"
              ></app-template-section-title>

              <div class="grid grid-cols-2 md:grid-cols-2">
                @for (product of cat.products; track product.id) {
                  <app-template-card
                    [product]="product"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  >
                  </app-template-card>
                }
              </div>
            </section>
          }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Block6Component {
  categories = input.required<Category[]>();
  templateData = input<any>();
  productClick = output<Product>();
  addToCart = output<Product>();
}
