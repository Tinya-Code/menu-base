import { ChangeDetectionStrategy, Component, input, output, signal, effect, inject, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule, X, ChevronLeft, ChevronRight } from 'lucide-angular';

export interface GalleryImage {
  id: string;
  type: 'image' | 'video' | 'video-link';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/95 backdrop-blur-md" (click)="close.emit()"></div>

        <!-- Content -->
        <div class="relative w-full h-full flex flex-col items-center justify-center gap-6 z-10 pointer-events-none">
          
          <!-- Close Button -->
          <button (click)="close.emit()" 
                  class="pointer-events-auto absolute top-0 right-0 p-3 text-white/50 hover:text-primary transition-colors">
            <lucide-icon [img]="X" class="w-8 h-8"></lucide-icon>
          </button>

          <!-- Main Media -->
          <div class="relative w-full h-[70vh] flex items-center justify-center group pointer-events-auto transition-all duration-500"
               [class.max-w-md]="isVertical()"
               [class.max-w-5xl]="!isVertical()">
            
            <!-- Navigation Buttons -->
            <button (click)="prev($event)" 
                    class="absolute left-0 z-20 p-4 text-white/20 hover:text-primary transition-all transform hover:scale-110 active:scale-95">
              <lucide-icon [img]="ChevronLeft" class="w-12 h-12"></lucide-icon>
            </button>

            @if (currentImage(); as media) {
              <div class="w-full h-full flex items-center justify-center relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                @if (media.type === 'image') {
                  <img [src]="media.url" 
                       class="max-w-full max-h-full object-contain" 
                       alt="Gallery Image">
                } @else if (media.type === 'video') {
                  <video controls autoplay class="w-full max-h-full object-contain">
                    <source [src]="media.url" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                } @else if (media.type === 'video-link') {
                  <iframe [src]="safeYoutubeUrl()" 
                          class="w-full h-full shadow-2xl rounded-lg"
                          [class.aspect-[9/16]]="isVertical()"
                          [class.aspect-video]="!isVertical()" 
                          frameborder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowfullscreen>
                  </iframe>
                }
              </div>
            }

            <button (click)="next($event)" 
                    class="absolute right-0 z-20 p-4 text-white/20 hover:text-primary transition-all transform hover:scale-110 active:scale-95">
              <lucide-icon [img]="ChevronRight" class="w-12 h-12"></lucide-icon>
            </button>
          </div>

          <!-- Info -->
          <div class="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
            <h3 class="text-3xl md:text-5xl font-display text-white tracking-tighter">
              {{ currentImage()?.title }}<span class="text-primary">.</span>
            </h3>
            <p class="text-white/40 italic text-sm md:text-base max-w-2xl mx-auto">
              {{ currentImage()?.description }}
            </p>
            
            <!-- Counter -->
            <div class="pt-4">
              <span class="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
                {{ currentIndex() + 1 }} / {{ images().length }}
              </span>
            </div>
          </div>

        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageModalComponent {
  images = input.required<GalleryImage[]>();
  initialIndex = input<number>(0);
  isOpen = input<boolean>(false);
  currentIndex = signal(0);
  close = output<void>();

  private sanitizer = inject(DomSanitizer);
  safeYoutubeUrl = signal<SafeResourceUrl | null>(null);

  readonly X = X;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  currentImage = computed(() => {
    const imgs = this.images();
    const idx = this.currentIndex();
    return imgs && imgs.length > idx ? imgs[idx] : null;
  });

  isVertical = computed(() => {
    const media = this.currentImage();
    if (!media) return false;
    
    const url = media.url.toLowerCase();
    if (url.includes('reel') || url.includes('tiktok') || url.includes('short') || url.includes('height=476')) {
      return true;
    }
    
    if (media.height && media.width && media.height > media.width) {
      return true;
    }
    
    return false;
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.updateCurrentMedia(this.initialIndex());
      }
    }, { allowSignalWrites: true });
  }

  updateCurrentMedia(index: number) {
    this.currentIndex.set(index);
    const images = this.images();
    if (!images || images.length === 0) return;

    const media = images[index];

    if (media?.type === 'video-link') {
      let url = media.url;
      if (!url.includes('?')) url += '?autoplay=1';
      else url += '&autoplay=1';
      this.safeYoutubeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    } else {
      this.safeYoutubeUrl.set(null);
    }
  }

  next(event: Event) {
    event.stopPropagation();
    const nextIdx = (this.currentIndex() + 1) % this.images().length;
    this.updateCurrentMedia(nextIdx);
  }

  prev(event: Event) {
    event.stopPropagation();
    const prevIdx = (this.currentIndex() - 1 + this.images().length) % this.images().length;
    this.updateCurrentMedia(prevIdx);
  }
}
