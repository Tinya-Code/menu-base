import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden">
      <!-- Background Decorative Elements (Subtle) -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div class="absolute top-0 left-0 w-64 h-64 border-[40px] border-accent rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 border-[60px] border-secondary rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <!-- Center Logo / Spinner -->
      <div class="relative flex flex-col items-center">
        <!-- Main Spinner -->
        <div class="relative w-24 h-24 md:w-32 md:h-32 mb-8">
          <div class="absolute inset-0 border-4 border-secondary/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
          
          <!-- Inner Icon / Logo Placeholder -->
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-3xl md:text-4xl font-display text-secondary animate-pulse">MN</span>
          </div>
        </div>

        <!-- Text Reveal Animation -->
        <div class="overflow-hidden">
          <h1 class="text-2xl md:text-3xl font-display text-secondary tracking-widest uppercase animate-in slide-in-from-bottom duration-700">
            Cargando <span class="text-accent italic">Experiencia</span>
          </h1>
        </div>

        <!-- Progress Bar -->
        <div class="w-48 h-1 bg-secondary/5 rounded-full mt-6 overflow-hidden">
          <div class="h-full bg-accent animate-loading-bar"></div>
        </div>
      </div>

      <!-- Footer Quote -->
      <p class="absolute bottom-12 text-secondary/40 font-body text-xs md:text-sm tracking-widest uppercase">
        Mr. Nikkei &bull; Tradición y Sabor
      </p>
    </div>
  `,
  styles: [`
    @keyframes loading-bar {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0); }
      100% { transform: translateX(100%); }
    }
    .animate-loading-bar {
      animation: loading-bar 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }
  `]
})
export class LoadingScreenComponent {
  @Input() message: string = 'Preparando tu menú...';
}
