import { ChangeDetectionStrategy, Component, input, output, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements AfterViewInit {
  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLElement>;
  
  showArrows = input<boolean>(true);
  autoSlide = input<boolean>(false);
  autoSlideInterval = input<number>(5000);

  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;

  scrollPosition = 0;
  private intervalId: any;

  ngAfterViewInit() {
    if (this.autoSlide()) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  next() {
    const container = this.sliderContainer.nativeElement;
    const scrollAmount = container.clientWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  prev() {
    const container = this.sliderContainer.nativeElement;
    const scrollAmount = container.clientWidth;
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  private startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.next();
    }, this.autoSlideInterval());
  }
}
