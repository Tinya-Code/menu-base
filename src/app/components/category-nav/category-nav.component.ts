import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  templateUrl: './category-nav.component.html',
  styleUrl: './category-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryNav {
  categories = input.required<any[]>();

  private readonly colors = [
    '#EAB308', '#EA580C', '#60A5FA','#DC2626',
    '#3B82F6', '#16A34A', '#9333EA', '#EC4899',
  ];

  private readonly sag = 28;

  getFlagColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  // Parábola normalizada: t=0..1, devuelve Y relativo a la cuerda
  private getCatenaryY(t: number): number {
    const x = (t - 0.5) * 2; // -1..1
    return this.sag * (x * x - 1) * -1; // 0 en extremos, sag en centro
  }

  // Ángulo tangente de la curva en el punto t
  private getCatenaryAngle(t: number, total: number): number {
    const dt = 0.001;
    const t1 = Math.max(0, t - dt);
    const t2 = Math.min(1, t + dt);
    const y1 = this.getCatenaryY(t1);
    const y2 = this.getCatenaryY(t2);
    const flagWidth = 98; // width + gap en px
    const dx = (t2 - t1) * (total - 1) * flagWidth;
    const dy = y2 - y1;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  getFlagY(index: number, total: number): number {
    if (total <= 1) return 0;
    const t = index / (total - 1);
    return this.getCatenaryY(t);
  }

  getFlagAngle(index: number, total: number): number {
    if (total <= 1) return 0;
    const t = index / (total - 1);
    return this.getCatenaryAngle(t, total);
  }

  scrollToCategory(categoryId: string) {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 140;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  }
}