import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Combo } from '../components/combo-card/combo-card';
import { ComboCardComponent } from '../components/combo-card/combo-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';
import { SliderComponent } from '../../components/slider/slider.component';

@Component({
  selector: 'app-block-combos',
  standalone: true,
  imports: [ComboCardComponent, TemplateSectionTitleComponent, SliderComponent],
  template: `
    @if (combos().length > 0) {
      <section class="relative py-12 px-8">
        <app-template-section-title [title]="title()" [description]="description()">
        </app-template-section-title>

        <app-slider [showArrows]="true" [autoSlide]="false">
          @for (combo of combos(); track combo.id) {
            <app-combo-card [combo]="combo" (addToCart)="addToCart.emit($event)"> </app-combo-card>
          }
        </app-slider>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockCombosComponent {
  combos = input.required<Combo[]>();
  title = input<string>('Combos');
  description = input<string>('Combos especiales para compartir');
  addToCart = output<Combo>();
}
