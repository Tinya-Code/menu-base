import { Product } from './product.model';

export interface Category {
  id: string;
  name: string;
  description?: string;
  block_id: string;
  products: Product[];
}
