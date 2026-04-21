export type Product = {
  id: string;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  description?: string;
  image: string;
  rating?: number;
  inStock: boolean;
};
