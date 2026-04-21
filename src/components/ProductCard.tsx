import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { Product } from '../constants/products';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { formatPrice } from '../utils/formatters';
import { hp, wp } from '../utils/responsive';

type Props = {
  product: Product;
  onPress?: () => void;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  isWishlisted?: boolean;
  isInCart?: boolean;
};

const ProductCard: React.FC<Props> = ({
  product,
  onPress,
  onToggleWishlist,
  onAddToCart,
  onRemoveFromCart,
  isWishlisted,
  isInCart,
}) => {
  const handleCartPress = () => {
    if (!product.inStock) return;
    if (isInCart) {
      onRemoveFromCart?.();
    } else {
      onAddToCart?.();
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {product.discountPercent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>
              -{product.discountPercent}%
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleWishlist}
          style={styles.heartBtn}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={wp(4.8)}
            color={isWishlisted ? colors.primary : colors.secondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.row}>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            ) : null}
          </View>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={wp(3.2)} color={colors.primary} />
            <Text style={styles.ratingText}>
              {(product.rating ?? 4.5).toFixed(1)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCartPress}
          disabled={!product.inStock}
          style={[
            styles.addBtn,
            !product.inStock && styles.addBtnDisabled,
            isInCart && styles.addBtnRemove,
          ]}
        >
          {product.inStock ? (
            <Ionicons
              name={isInCart ? 'trash-outline' : 'cart-outline'}
              size={wp(4)}
              color={colors.natural}
            />
          ) : null}
          <Text style={styles.addBtnText}>
            {!product.inStock
              ? 'Out of stock'
              : isInCart
              ? 'Remove from cart'
              : 'Add to cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: {
    position: 'relative',
    backgroundColor: colors.tertiary,
  },
  image: {
    width: '100%',
    height: hp(18),
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: wp(9),
    height: wp(9),
    borderRadius: radius.pill,
    backgroundColor: colors.natural,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.sm,
    gap: verticalSpacing.xxs,
  },
  category: {
    ...typography.caption,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    ...typography.title,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalSpacing.xxs,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xxs,
    flexShrink: 1,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  originalPrice: {
    ...typography.caption,
    color: colors.secondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  discountBadgeText: {
    ...typography.caption,
    color: colors.natural,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  ratingText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  addBtn: {
    marginTop: verticalSpacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  addBtnRemove: { backgroundColor: colors.danger },
  addBtnDisabled: { backgroundColor: colors.border },
  addBtnText: {
    ...typography.caption,
    color: colors.natural,
    fontWeight: '700',
  },
});

export default ProductCard;
