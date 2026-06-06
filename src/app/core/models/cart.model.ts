export interface CartItem {
  id: string;
  originalProductId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  selectedEntry?: {
    qty: number | string;
    price: number | string;
    bonus?: string | null;
  };
}
