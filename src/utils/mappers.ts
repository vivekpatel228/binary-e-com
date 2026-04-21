import type { Product } from '../constants/products';
import type { ApiProduct } from '../graphql/types';
import { firstImage } from '../graphql/types';

const DISCOUNT_TIERS = [0, 10, 15, 20, 25];

const pickDiscountPercent = (id: number): number => {
  const idx = Math.abs(Number(id) || 0) % DISCOUNT_TIERS.length;
  return DISCOUNT_TIERS[idx];
};

export const mapApiProduct = (p: ApiProduct): Product => {
  const discountPercent = pickDiscountPercent(p.id);
  const hasDiscount = discountPercent > 0;
  const originalPrice = hasDiscount
    ? Number((p.price / (1 - discountPercent / 100)).toFixed(2))
    : undefined;
  return {
    id: String(p.id),
    name: p.title,
    category: p.category?.name ?? 'General',
    categoryId: p.category?.id,
    price: p.price,
    originalPrice,
    discountPercent: hasDiscount ? discountPercent : undefined,
    description: p.description,
    image: firstImage(p.images),
    rating: 4.5,
    inStock: true,
  };
};
