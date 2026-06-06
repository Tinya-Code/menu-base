/**
 * Interfaz para los productos del menú.
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  qty_label: string | null;
  price: number | string | null;
  price_range_id: string | null;
  category_id: string;
  is_recommended?: boolean;
  is_hidden: boolean;
  image_url: string | null;
  cloudinary_id: string | null;
}
