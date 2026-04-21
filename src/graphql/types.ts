export type ApiCategory = {
  id: number;
  name: string;
  image?: string;
};

export type ApiProduct = {
  id: number;
  title: string;
  price: number;
  description?: string;
  images: string[];
  category: ApiCategory;
};

export const firstImage = (images: string[] | undefined): string => {
  if (!images || images.length === 0) return '';
  const raw = images[0];
  if (typeof raw !== 'string') return '';
  const cleaned = raw.replace(/^\["?/, '').replace(/"?\]$/, '').replace(/^"|"$/g, '');
  return cleaned;
};
