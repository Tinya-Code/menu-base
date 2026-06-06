import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, SearchX, ArrowLeft } from 'lucide-angular';
import { TemplateHeader } from '../../base-template/components/header/header';
import { TemplateFooter } from '../../base-template/components/footer/footer';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, TemplateHeader, TemplateFooter],
  template: `
    <app-template-header></app-template-header>

    <main class="max-w-7xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">


      <h1 class="text-8xl md:text-9xl font-display text-black tracking-tighter mb-4">
        4<span class="text-primary">0</span>4
      </h1>
      
      <h2 class="text-2xl md:text-4xl font-display text-black/80 mb-6">
        Parece que te has perdido...
      </h2>
      
      <p class="text-black/60 italic max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
        La página que estás buscando se ha esfumado como un maki recién hecho. 
        Por favor, verifica la dirección o regresa a nuestro menú principal.
      </p>

      <a routerLink="/" class="group flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-primary transition-all duration-300 shadow-[0_10px_40px_rgba(220,38,38,0.4)]">
        <lucide-icon [img]="ArrowLeft" class="w-5 h-5 group-hover:-translate-x-1 transition-transform"></lucide-icon>
        Volver al Menú
      </a>
    </main>

    <app-template-footer></app-template-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  readonly SearchX = SearchX;
  readonly ArrowLeft = ArrowLeft;
}
