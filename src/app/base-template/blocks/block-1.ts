import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { TemplateCardComponent } from '../components/template-card/template-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';

@Component({
  selector: 'app-block-1',
  standalone: true,
  imports: [TemplateCardComponent, TemplateSectionTitleComponent],
  template: `
    @if (categories().length > 0) {
      <section class="relative py-12 px-8 overflow-hidden">
        @for (cat of categories(); track cat.id; let isLast = $last; let total = $count) {
          <section [id]="'category-' + cat.id" class="flex col-span-3 flex-col md:col-span-8 ">
            <app-template-section-title
              [title]="cat.name"
              [description]="cat.description || ''"
            ></app-template-section-title>
            <div class="grid grid-cols-2  md:grid-cols-3 gap-8 ">
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
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Block1Component {
  categories = input.required<Category[]>();
  templateData = input<any>();
  productClick = output<Product>();
  addToCart = output<Product>();
}
