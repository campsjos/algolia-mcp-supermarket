interface HierarchicalCategories {
  lvl0: string;
  lvl1: string;
}

export interface AlgoliaProduct {
  objectID: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  currency: string;
  unit: string;
  in_stock: boolean;
  rating: number;
  image_url: string;
}