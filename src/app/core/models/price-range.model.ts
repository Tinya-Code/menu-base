export interface PriceRangeEntry {
  qty: number | string;
  price: number | string;
  bonus?: string | null;
}

export interface PriceRange {
  id: string;
  name: string;
  entries: PriceRangeEntry[];
}
