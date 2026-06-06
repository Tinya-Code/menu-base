import {
  Component,
  ElementRef,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  input,
  viewChild,
  afterNextRender,
  DestroyRef,
  NgZone,
} from '@angular/core';

export interface ScaleBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ScalePaddings {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

@Component({
  selector: 'app-layout-scale',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #wrapper
      class="w-full  overflow-hidden flex justify-center"
      [style.height]="wrapperHeight()">
      <div
        #inner
        class="shrink-0   origin-top transition-transform duration-200 ease-out"
        [style.width.px]="designWidth()"
        [style.padding.px]="designPadding()"
        [style.transform]="scaleTransform()">
        <ng-content />
      </div>
    </div>
  `,
})
export class LayoutScaleComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone     = inject(NgZone);
  private readonly hostEl     = inject(ElementRef<HTMLElement>);

  readonly breakpoints = input<ScaleBreakpoints>({
    mobile:  256,
    tablet:  768,
    desktop: 1280,
    wide:    1280,
  });

  readonly paddings = input<ScalePaddings>({
    mobile:  0,
    tablet:  0,
    desktop: 0,
    wide:    0,
  });

  private readonly inner = viewChild<ElementRef<HTMLDivElement>>('inner');

  private readonly viewportWidth = signal(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  private readonly activeKey = computed<keyof ScaleBreakpoints>(() => {
    const vw = this.viewportWidth();
    const bp = this.breakpoints();
    if (vw <= bp.mobile)  return 'mobile';
    if (vw <= bp.tablet)  return 'tablet';
    if (vw <= bp.desktop) return 'desktop';
    return 'wide';
  });

  readonly designWidth = computed(() => this.breakpoints()[this.activeKey()]);
  readonly designPadding = computed(() => this.paddings()[this.activeKey()]);

  readonly scale = computed(() => {
    const vw = this.viewportWidth();
    const dw = this.designWidth();
    return vw < dw ? vw / dw : 1;
  });

  readonly scaleTransform = computed(() => `scale(${this.scale()})`);
  readonly wrapperHeight = signal<string>('full');

  private resizeObserver: ResizeObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    afterNextRender(() => {
      this.measureAndUpdate();
      this.setupResizeObserver();
      this.setupWindowResize();
      this.setupMutationObserver();
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
    });
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        this.scheduleUpdate();
      });
      // Observe both the host AND the inner element so we catch
      // content growth from async data arriving after initial render.
      this.resizeObserver.observe(this.hostEl.nativeElement);
      const innerEl = this.inner()?.nativeElement;
      if (innerEl) this.resizeObserver.observe(innerEl);
    });
  }

  private setupWindowResize(): void {
    if (typeof window === 'undefined') return;
    const handler = () => this.scheduleUpdate();
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', handler, { passive: true });
    });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', handler);
    });
  }

  private setupMutationObserver(): void {
    if (typeof MutationObserver === 'undefined') return;
    const innerEl = this.inner()?.nativeElement;
    if (!innerEl) return;

    this.ngZone.runOutsideAngular(() => {
      const mo = new MutationObserver(() => this.scheduleUpdate());
      mo.observe(innerEl, { childList: true, subtree: true });
      this.destroyRef.onDestroy(() => mo.disconnect());
    });
  }

  private scheduleUpdate(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.ngZone.run(() => this.measureAndUpdate());
    }, 60);
  }

  private measureAndUpdate(): void {
    const innerEl = this.inner()?.nativeElement;
    if (!innerEl) return;
    this.viewportWidth.set(window.innerWidth);
    requestAnimationFrame(() => {
      const innerEl2 = this.inner()?.nativeElement;
      if (!innerEl2) return;
      const naturalHeight = innerEl2.scrollHeight;
      const currentScale  = this.scale();
      const compensatedHeight = naturalHeight * currentScale;
      // Only update if height actually changed to avoid unnecessary renders
      const newHeight = `${compensatedHeight}px`;
      if (this.wrapperHeight() !== newHeight) {
        this.wrapperHeight.set(newHeight);
      }
    });
  }
}
