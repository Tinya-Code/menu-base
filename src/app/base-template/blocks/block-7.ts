import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { TemplateCardComponent } from '../components/template-card/template-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';

@Component({
  selector: 'app-block-7',
  standalone: true,
  imports: [TemplateCardComponent, TemplateSectionTitleComponent],
  template: `
    @if (categories().length > 0) {
      <section class="relative py-12  px-8    ">
        @for (cat of categories(); track cat.id; let isLast = $last; let total = $count) {
          <section [id]="'category-' + cat.id" class="flex flex-col">
            <app-template-section-title
              [title]="cat.name"
              [description]="cat.description || ''"
            ></app-template-section-title>

            <div class="grid grid-cols-2 md:grid-cols-1">
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
export class Block7Component {
  categories = input.required<Category[]>();
  templateData = input<any>();
  productClick = output<Product>();
  addToCart = output<Product>();
}
