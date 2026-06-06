import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { LucideAngularModule, Share2 } from 'lucide-angular';

@Component({
  selector: 'app-share-button',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button
      (click)="shareMenu()"
      class="flex items-center gap-2 px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-sm transition-all duration-300 font-bold border border-primary/20 group backdrop-blur-sm"
      title="Compartir este menú"
    >
      <lucide-icon
        [img]="Share2"
        class="w-4 h-4 group-hover:scale-110 transition-transform"
      ></lucide-icon>
      <span class="text-lg uppercase tracking-widest font-display select-none">Compartir</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareButtonComponent {
  readonly Share2 = Share2;

  async shareMenu() {
    const url = window.location.href;
    const shareData = {
      title: 'Menú Chifa',
      text: '¡Mira este delicioso menú! 🍜🏮',
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Contenido compartido con éxito');
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          console.error('Error al compartir:', error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
      } catch (err) {
        console.warn('La API Web Share no está soportada y no se pudo copiar al portapapeles');
      }
    }
  }
}
