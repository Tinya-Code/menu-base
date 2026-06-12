import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Copy, Images, Info, LucideAngularModule, Map, MapPin, Utensils } from 'lucide-angular';
import { ShareButtonComponent } from '../../../components/share-button/share-button.component';
import { RestaurantService } from '../../../core/services/restaurant.service';

@Component({
  selector: 'app-template-header',
  standalone: true,
  imports: [LucideAngularModule, ShareButtonComponent, RouterLink],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateHeader {
  private readonly _restaurantService = inject(RestaurantService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly restaurantName = computed(
    () => this._restaurantService.restaurant()?.name ?? 'Chicharronería Carmen Lara',
  );
  readonly description = computed(() => this._restaurantService.settings()?.description ?? '');
  readonly address = computed(() => this._restaurantService.restaurant()?.address ?? '');
  readonly location = computed(() => this._restaurantService.restaurant()?.location);

  readonly isMenuRoute = computed(() => this.router.url === '/' || this.router.url === '');
  readonly isGalleryRoute = computed(() => this.router.url === '/gallery');

  readonly Utensils = Utensils;
  readonly MapPin = MapPin;
  readonly Info = Info;
  readonly Images = Images;
  readonly Copy = Copy;
  readonly Map = Map;

  copyAddress() {
    navigator.clipboard.writeText(this.address());
  }

  openMaps() {
    const loc = this.location();
    let url = '';

    if (loc && loc.lat && loc.lng) {
      url = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.address())}`;
    }

    window.open(url, '_blank');
  }
}
