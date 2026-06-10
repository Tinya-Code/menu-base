import {
  ChangeDetectionStrategy,
  Component,
  input,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  templateUrl: './category-nav.component.html',
  styleUrl: './category-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryNav implements AfterViewInit, OnDestroy {
  categories = input.required<any[]>();

  private readonly colors = [
    '#EAB308',
    '#EA580C',
    '#60A5FA',
    '#DC2626',
    '#3B82F6',
    '#16A34A',
    '#9333EA',
    '#EC4899',
  ];

  private readonly sag = 20;

  private ro: ResizeObserver | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const track = this.el.nativeElement.querySelector('.flags-track') as HTMLElement;

    if (track) {
      this.ro = new ResizeObserver(() => this.drawRope());
      this.ro.observe(track);
    }

    setTimeout(() => this.drawRope());
  }

  ngOnDestroy() {
    this.ro?.disconnect();
  }

  getFlagColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  /**
   * Curva de la cuerda
   */
  private getCurveY(t: number): number {
    const x = (t - 0.5) * 2;
    return this.sag * (1 - x * x);
  }

  /**
   * Posición vertical del banderín
   */
  getFlagY(index: number, total: number): number {
    if (total <= 1) return 0;

    const t = index / (total - 1);

    return this.getCurveY(t);
  }

  /**
   * Inclinación suave siguiendo la cuerda
   */
  getFlagAngle(index: number, total: number): number {
    if (total <= 1) return 0;

    const t = index / (total - 1);

    const dt = 0.01;

    const y1 = this.getCurveY(Math.max(0, t - dt));
    const y2 = this.getCurveY(Math.min(1, t + dt));

    const dy = y2 - y1;
    const dx = dt * 2;

    return Math.atan2(dy, dx) * (180 / Math.PI) * 0.02;
  }

  /**
   * Dibuja exactamente la misma curva
   * usada por los banderines
   */
  drawRope() {
    const svg = this.el.nativeElement.querySelector('.rope-svg') as SVGSVGElement;

    const track = this.el.nativeElement.querySelector('.flags-track') as HTMLElement;

    const path = this.el.nativeElement.querySelector('.rope-path') as SVGPathElement;

    if (!svg || !track || !path) return;

    const width = track.clientWidth;
    const height = 60;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    let d = '';

    const steps = 80;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;

      const x = width * t;
      const y = this.getCurveY(t);

      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
    }

    path.setAttribute('d', d);
  }

  scrollToCategory(categoryId: string) {
    const element = document.getElementById(categoryId);

    if (element) {
      const offset = 140;

      const elementPosition = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
