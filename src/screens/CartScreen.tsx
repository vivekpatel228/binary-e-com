import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Button,
  EmptyState,
  Header,
  QuantityStepper,
  Screen,
} from '../components';
import { useCart } from '../context';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { formatPrice } from '../utils/formatters';
import { hp, wp } from '../utils/responsive';

type CartNav = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartNav>();
  const {
    items,
    totalItems,
    totalPrice,
    incrementQty,
    decrementQty,
    removeFromCart,
    clearCart,
  } = useCart();

  if (totalItems === 0) {
    return (
      <Screen>
        <Header title="Cart" subtitle="Review items before checkout" />
        <EmptyState
          iconName="cart-outline"
          title="Your cart is empty"
          message="Add products to the cart to continue."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title="Cart"
        subtitle={`${totalItems} item${totalItems === 1 ? '' : 's'}`}
        rightLabel="Clear"
        onRightPress={clearCart}
      />

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
              <View style={styles.rowActions}>
                <QuantityStepper
                  value={item.quantity}
                  onIncrement={() => incrementQty(item.id)}
                  onDecrement={() => decrementQty(item.id)}
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeBtn}
                  hitSlop={6}
                >
                  <Ionicons
                    name="trash-outline"
                    size={wp(4.5)}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
        </View>
        <Button
          label="Proceed to checkout"
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: verticalSpacing.sm,
    paddingBottom: verticalSpacing.md,
  },
  separator: { height: verticalSpacing.sm },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.sm,
  },
  image: {
    width: wp(24),
    height: hp(12),
    borderRadius: radius.md,
    backgroundColor: colors.tertiary,
  },
  info: { flex: 1, gap: verticalSpacing.xxs },
  category: {
    ...typography.caption,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: { ...typography.title, color: colors.primary },
  price: { ...typography.h3, color: colors.primary },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalSpacing.xs,
  },
  removeBtn: {
    width: wp(9),
    height: wp(9),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    paddingVertical: verticalSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: verticalSpacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { ...typography.body, color: colors.secondary },
  totalValue: { ...typography.h2, color: colors.primary },
});

export default CartScreen;
