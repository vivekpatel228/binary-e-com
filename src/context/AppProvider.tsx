import React from 'react';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { OrdersProvider } from './OrdersContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <OrdersProvider>
    <WishlistProvider>
      <CartProvider>{children}</CartProvider>
    </WishlistProvider>
  </OrdersProvider>
);
