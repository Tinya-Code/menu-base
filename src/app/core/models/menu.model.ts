import { Block } from './block.model';
import { PriceRange } from './price-range.model';

export interface Menu {
  blocks: Block[];
}

/**
 * Representa la estructura de menu_render.json
 */
export interface MenuResponse {
  data: Menu;
}

/**
 * Representa la estructura de price_ranges.json
 */
export interface PriceRangesResponse {
  data: PriceRange[];
}

/**
 * Representa la estructura de gallery.json
 */
export interface GalleryItem {
  id: string;
  type: 'video-link' | 'image';
  url: string;
  title: string;
  description: string;
  cloudinary_id: string;
}

export interface GalleryResponse {
  data: GalleryItem[];
}

/**
 * Representa la estructura de template-images.json
 */
export interface TemplateImages {
  background: string;
  block1: {
    barco: string;
    makis: string[];
  };
  block3: {
    alitasFondo: string;
    alitas2Fondo: string;
  };
  block6: {
    coctelesVertical: string;
  };
}

export interface TemplateImagesResponse {
  data: TemplateImages;
}
