import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Product } from '../constants/products';
import { STORAGE_KEYS, readJSON, writeJSON } from '../utils/storage';

type WishlistContextValue = {
  items: Product[];
  totalItems: number;
  hydrated: boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    readJSON<Product[]>(STORAGE_KEYS.wishlist, []).then(stored => {
      setItems(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJSON(STORAGE_KEYS.wishlist, items);
  }, [hydrated, items]);

  const toggleWishlist = useCallback((product: Product) => {
    setItems(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product],
    );
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
  }, []);

  const isWishlisted = useCallback(
    (id: string) => items.some(p => p.id === id),
    [items],
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      totalItems: items.length,
      hydrated,
      toggleWishlist,
      removeFromWishlist,
      isWishlisted,
      clearWishlist,
    }),
    [
      items,
      hydrated,
      toggleWishlist,
      removeFromWishlist,
      isWishlisted,
      clearWishlist,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextValue => {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
