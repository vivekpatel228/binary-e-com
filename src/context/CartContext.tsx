import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { Product } from '../constants/products';
import { STORAGE_KEYS, readJSON, writeJSON } from '../utils/storage';

export type CartItem = Product & { quantity: number };

type CartState = { items: CartItem[] };

type CartAction =
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'INCREMENT'; id: string }
  | { type: 'DECREMENT'; id: string }
  | { type: 'CLEAR' };

const initialState: CartState = { items: [] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items };
    case 'ADD': {
      const qty = Math.max(1, action.quantity ?? 1);
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.id === action.product.id
              ? { ...i, quantity: i.quantity + qty }
              : i,
          ),
        };
      }
      return {
        items: [...state.items, { ...action.product, quantity: qty }],
      };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.id !== action.id) };
    case 'INCREMENT':
      return {
        items: state.items.map(i =>
          i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      };
    case 'DECREMENT':
      return {
        items: state.items
          .map(i =>
            i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter(i => i.quantity > 0),
      };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  hydrated: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  incrementQty: (id: string) => void;
  decrementQty: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let active = true;
    readJSON<CartItem[]>(STORAGE_KEYS.cart, []).then(items => {
      if (!active) return;
      dispatch({ type: 'HYDRATE', items });
      hydratedRef.current = true;
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    writeJSON(STORAGE_KEYS.cart, state.items);
  }, [state.items]);

  const addToCart = useCallback(
    (product: Product, quantity?: number) =>
      dispatch({ type: 'ADD', product, quantity }),
    [],
  );
  const removeFromCart = useCallback(
    (id: string) => dispatch({ type: 'REMOVE', id }),
    [],
  );
  const incrementQty = useCallback(
    (id: string) => dispatch({ type: 'INCREMENT', id }),
    [],
  );
  const decrementQty = useCallback(
    (id: string) => dispatch({ type: 'DECREMENT', id }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const isInCart = useCallback(
    (id: string) => state.items.some(i => i.id === id),
    [state.items],
  );

  const value = useMemo<CartContextValue>(() => {
    const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = state.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    return {
      items: state.items,
      totalItems,
      totalPrice,
      hydrated,
      addToCart,
      removeFromCart,
      incrementQty,
      decrementQty,
      clearCart,
      isInCart,
    };
  }, [
    state.items,
    hydrated,
    addToCart,
    removeFromCart,
    incrementQty,
    decrementQty,
    clearCart,
    isInCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
