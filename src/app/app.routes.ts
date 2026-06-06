import { Routes } from '@angular/router';
import { Menu } from './page/menu/menu';
import { GalleryPage } from './page/gallery/gallery';
import { NotFoundPage } from './page/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Menu,
    pathMatch: 'full'
  },
  {
    path: 'gallery',
    component: GalleryPage,
  },
  {
    path: '**',
    component: NotFoundPage,
  }
];
