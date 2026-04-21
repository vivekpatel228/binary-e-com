import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import {
  CheckoutScreen,
  OrderDetailScreen,
  OrderSuccessScreen,
  OrdersScreen,
  ProductDetailScreen,
  WishlistScreen,
} from '../screens';

export type RootStackParamList = {
  Tabs: undefined;
  ProductDetail: { productId: number };
  Wishlist: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  OrderDetail: { orderId: string };
  Orders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen
      name="OrderSuccess"
      component={OrderSuccessScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
  </Stack.Navigator>
);

export default RootNavigator;
