import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LucideAngularModule, Waves } from 'lucide-angular';

interface TitleColorConfig {
  enabled: boolean;
  colors: string[];
  mode: 'cycle' | 'random';
}

@Component({
  selector: 'app-template-section-title',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col  items-center justify-center z-10 gap-2 md:gap-4 mb-8">
      <div class="flex  flex-col items-center justify-center mx-auto  text-center">
        <h3
          class="text-6xl md:text-7xl flex gap-4 items-center font-display tracking-tight"
          [style.color]="titleColor"
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

  private colorConfig: TitleColorConfig = {
    enabled: true,
    colors: [
      '#EAB308',
      '#EA580C',
      '#60A5FA',
      '#DC2626',
      '#3B82F6',
      '#16A34A',
      '#9333EA',
      '#EC4899',
    ],
    mode: 'random',
  };

  Waves = Waves;

  private defaultColorClass = 'text-tertiary';

  private randomColor = this.getRandomColor();

  private getRandomColor(): string {
    if (!this.colorConfig.enabled || this.colorConfig.colors.length === 0) {
      return '';
    }

    const randomIndex = Math.floor(Math.random() * this.colorConfig.colors.length);
    return this.colorConfig.colors[randomIndex];
  }

  get titleColor(): string {
    return this.randomColor;
  }

  get titleColorClass(): string {
    return this.colorConfig.enabled ? '' : this.defaultColorClass;
  }
}
