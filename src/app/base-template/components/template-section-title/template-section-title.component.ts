import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LucideAngularModule, Waves } from 'lucide-angular';

@Component({
  selector: 'app-template-section-title',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col  items-center justify-center z-10 gap-2 md:gap-4 mb-8">
      <div class="flex  flex-col items-center justify-center mx-auto  text-center">
        <h3
          class="text-6xl md:text-7xl flex gap-4 items-center font-display text-transparent bg-clip-text bg-gradient-to-b from-accent from-50% to-accent-muted to-50% uppercase tracking-tight"
        >
          <lucide-icon [img]="Waves" class="w-6 h-6 text-accent shrink-0"></lucide-icon>
          {{ title() }}
          <lucide-icon [img]="Waves" class="w-6 h-6 text-accent shrink-0 rotate-180"></lucide-icon>
        </h3>
        <ng-content></ng-content>
        @if (description()) {
          <p class="text-xl text-primary-text mt-1 font-display">
            {{ description() }}
          </p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateSectionTitleComponent {
  title = input.required<string>();
  description = input<string>('');
  Waves = Waves;
}
