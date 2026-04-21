import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '../components';
import {
  CartScreen,
  HomeScreen,
  ProductsScreen,
  ProfileScreen,
} from '../screens';
import { useCart } from '../context';
import { colors, typography } from '../theme';
import { hp } from '../utils/responsive';
import type { IoniconsIconName } from '@react-native-vector-icons/ionicons/static';

export type RootTabParamList = {
  Home: undefined;
  Products: { categoryId?: number } | undefined;
  Cart: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const resolveTabIconName = (
  routeName: keyof RootTabParamList,
  focused: boolean,
): IoniconsIconName => {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Products':
      return focused ? 'grid' : 'grid-outline';
    case 'Cart':
      return focused ? 'cart' : 'cart-outline';
    case 'Profile':
      return focused ? 'person' : 'person-outline';
    default:
      return 'ellipse';
  }
};

const HomeTabIcon = ({ focused, color, size }: TabIconProps) => (
  <TabBarIcon
    icon={resolveTabIconName('Home', focused)}
    color={color}
    size={size}
  />
);

const ProductsTabIcon = ({ focused, color, size }: TabIconProps) => (
  <TabBarIcon
    icon={resolveTabIconName('Products', focused)}
    color={color}
    size={size}
  />
);

const CartTabIcon = ({ focused, color, size }: TabIconProps) => (
  <TabBarIcon
    icon={resolveTabIconName('Cart', focused)}
    color={color}
    size={size}
  />
);

const ProfileTabIcon = ({ focused, color, size }: TabIconProps) => (
  <TabBarIcon
    icon={resolveTabIconName('Profile', focused)}
    color={color}
    size={size}
  />
);

const TabNavigator: React.FC = () => {
  const { totalItems: cartCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: { ...typography.tab },
        tabBarStyle: {
          height: hp(8.5),
          paddingTop: hp(1),
          paddingBottom: hp(1),
          backgroundColor: colors.natural,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: HomeTabIcon }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ tabBarIcon: ProductsTabIcon }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: CartTabIcon,
          tabBarBadge:
            cartCount > 0 ? (cartCount > 99 ? '99+' : cartCount) : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ProfileTabIcon }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
