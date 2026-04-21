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
import { EmptyState, Header, Screen } from '../components';
import { useCart, useWishlist } from '../context';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { formatPrice } from '../utils/formatters';
import { hp, wp } from '../utils/responsive';

type WishlistNav = NativeStackNavigationProp<RootStackParamList, 'Wishlist'>;

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<WishlistNav>();
  const { items, totalItems, removeFromWishlist, clearWishlist } =
    useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();

  const BackRow = (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      activeOpacity={0.8}
      style={styles.backBtn}
      hitSlop={8}
    >
      <Ionicons name="arrow-back" size={wp(5.5)} color={colors.primary} />
    </TouchableOpacity>
  );

  if (totalItems === 0) {
    return (
      <Screen>
        {BackRow}
        <Header title="Wishlist" subtitle="Your favorite picks" />
        <EmptyState
          iconName="heart-outline"
          title="No favorites yet"
          message="Tap the heart on any product to save it here for later."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {BackRow}
      <Header
        title="Wishlist"
        subtitle={`${totalItems} saved item${totalItems === 1 ? '' : 's'}`}
        rightLabel="Clear"
        onRightPress={clearWishlist}
      />

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: Number(item.id),
              })
            }
            style={styles.row}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!item.inStock}
                  onPress={() =>
                    isInCart(item.id)
                      ? removeFromCart(item.id)
                      : addToCart(item)
                  }
                  style={[
                    styles.cartBtn,
                    !item.inStock && styles.cartBtnDisabled,
                    isInCart(item.id) && styles.cartBtnRemove,
                  ]}
                >
                  {item.inStock ? (
                    <Ionicons
                      name={isInCart(item.id) ? 'trash-outline' : 'cart-outline'}
                      size={wp(4)}
                      color={colors.natural}
                    />
                  ) : null}
                  <Text style={styles.cartBtnText}>
                    {!item.inStock
                      ? 'Out of stock'
                      : isInCart(item.id)
                      ? 'Remove from cart'
                      : 'Add to cart'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => removeFromWishlist(item.id)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalSpacing.xs,
  },
  listContent: {
    paddingVertical: verticalSpacing.sm,
    paddingBottom: verticalSpacing.xl,
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
    width: wp(28),
    height: hp(14),
    borderRadius: radius.md,
    backgroundColor: colors.tertiary,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    gap: verticalSpacing.xxs,
  },
  category: {
    ...typography.caption,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: { ...typography.title, color: colors.primary },
  price: { ...typography.h3, color: colors.primary },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: verticalSpacing.xxs,
  },
  cartBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  cartBtnRemove: { backgroundColor: colors.danger },
  cartBtnDisabled: { backgroundColor: colors.border },
  cartBtnText: {
    ...typography.caption,
    color: colors.natural,
    fontWeight: '700',
  },
  removeBtn: {
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default WishlistScreen;
