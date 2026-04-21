import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartItem } from './CartContext';
import { STORAGE_KEYS, readJSON, writeJSON } from '../utils/storage';

const generateOrderId = (): string => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `ord_${ts}_${rand}`;
};

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderStatus = 'placed' | 'processing' | 'delivered';

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  address: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
};

type OrdersContextValue = {
  orders: Order[];
  hydrated: boolean;
  placeOrder: (input: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  getOrder: (id: string) => Order | undefined;
  clearOrders: () => void;
};

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

const mockPlaceOrderApi = async (
  order: Order,
): Promise<{ success: true; order: Order }> => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 1200));
  return { success: true, order };
};

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    readJSON<Order[]>(STORAGE_KEYS.orders, []).then(stored => {
      setOrders(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJSON(STORAGE_KEYS.orders, orders);
  }, [hydrated, orders]);

  const placeOrder = useCallback<OrdersContextValue['placeOrder']>(
    async input => {
      const order: Order = {
        ...input,
        id: generateOrderId(),
        createdAt: Date.now(),
        status: 'placed',
      };
      const result = await mockPlaceOrderApi(order);
      setOrders(prev => [result.order, ...prev]);
      return result.order;
    },
    [],
  );

  const getOrder = useCallback(
    (id: string) => orders.find(o => o.id === id),
    [orders],
  );

  const clearOrders = useCallback(() => setOrders([]), []);

  const value = useMemo<OrdersContextValue>(
    () => ({ orders, hydrated, placeOrder, getOrder, clearOrders }),
    [orders, hydrated, placeOrder, getOrder, clearOrders],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};

export const useOrders = (): OrdersContextValue => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
};
