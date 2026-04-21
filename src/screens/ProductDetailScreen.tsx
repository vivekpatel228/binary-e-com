import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, QuantityStepper, Screen } from '../components';
import { useCart, useWishlist } from '../context';
import { GET_PRODUCT_DETAIL, firstImage, type ApiProduct } from '../graphql';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { mapApiProduct } from '../utils/mappers';
import { formatPrice } from '../utils/formatters';
import { hp, wp } from '../utils/responsive';
import { showErrorToast } from '../utils/toast';

type DetailNav = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
type DetailRoute = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<DetailNav>();
  const { params } = useRoute<DetailRoute>();

  const { items, addToCart, removeFromCart, incrementQty, decrementQty } =
    useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedQty, setSelectedQty] = useState(1);

  const { data, loading, error } = useQuery<{ product: ApiProduct }>(
    GET_PRODUCT_DETAIL,
    { variables: { id: params.productId } },
  );

  useEffect(() => {
    if (error) {
      showErrorToast(
        'Failed to load product',
        error.message ?? 'Please try again.',
      );
    }
  }, [error]);

  const apiProduct = data?.product;
  const product = apiProduct ? mapApiProduct(apiProduct) : null;
  const cartItem = product
    ? items.find(item => item.id === product.id)
    : undefined;
  const inCart = !!cartItem;
  const wished = product ? isWishlisted(product.id) : false;

  useEffect(() => {
    setSelectedQty(1);
  }, [product?.id]);

  const onCartPress = () => {
    if (!product) return;
    if (inCart) removeFromCart(product.id);
    else {
      addToCart(product, selectedQty);
      setSelectedQty(1);
    }
  };

  const onQuantityIncrement = () => {
    if (!product) return;
    if (inCart) incrementQty(product.id);
    else setSelectedQty(prev => Math.min(99, prev + 1));
  };

  const onQuantityDecrement = () => {
    if (!product) return;
    if (inCart) decrementQty(product.id);
    else setSelectedQty(prev => Math.max(1, prev - 1));
  };

  const quantityValue = inCart ? cartItem?.quantity ?? 1 : selectedQty;

  return (
    <Screen padded={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          style={styles.iconBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={wp(5.5)} color={colors.primary} />
        </TouchableOpacity>
        {product ? (
          <TouchableOpacity
            onPress={() => toggleWishlist(product)}
            activeOpacity={0.8}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons
              name={wished ? 'heart' : 'heart-outline'}
              size={wp(5.5)}
              color={wished ? colors.danger : colors.primary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !product ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Product not found.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <Image
              source={{ uri: product.image || firstImage(apiProduct?.images) }}
              style={styles.image}
            />
            <View style={styles.content}>
              <Text style={styles.category}>{product.category}</Text>
              <Text style={styles.name}>{product.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                {product.originalPrice ? (
                  <Text style={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </Text>
                ) : null}
                {product.discountPercent ? (
                  <View style={styles.discountPill}>
                    <Text style={styles.discountPillText}>
                      -{product.discountPercent}%
                    </Text>
                  </View>
                ) : null}
              </View>
              {product.description ? (
                <Text style={styles.description}>{product.description}</Text>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <QuantityStepper
                value={quantityValue}
                onIncrement={onQuantityIncrement}
                onDecrement={onQuantityDecrement}
                min={1}
                max={99}
              />
            </View>
            {inCart ? (
              <Text style={styles.footerHint}>
                Quantity updates your item in cart.
              </Text>
            ) : null}
            <Button
              label={
                inCart
                  ? 'Remove from cart'
                  : quantityValue === 1
                  ? 'Add to cart'
                  : `Add ${quantityValue} to cart`
              }
              onPress={onCartPress}
              variant={inCart ? 'secondary' : 'primary'}
            />
          </View>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: verticalSpacing.xs,
  },
  iconBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { ...typography.body, color: colors.secondary },
  body: { paddingBottom: verticalSpacing.xl },
  image: {
    width: '100%',
    height: hp(42),
    backgroundColor: colors.tertiary,
    resizeMode: 'cover',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: verticalSpacing.sm,
    gap: verticalSpacing.xs,
  },
  category: {
    ...typography.caption,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: { ...typography.h1, color: colors.primary },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  price: { ...typography.h2, color: colors.primary },
  originalPrice: {
    ...typography.body,
    color: colors.secondary,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  discountPillText: {
    ...typography.caption,
    color: colors.natural,
    fontWeight: '800',
  },
  description: {
    ...typography.body,
    color: colors.muted,
    marginTop: verticalSpacing.xs,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.natural,
    gap: verticalSpacing.xs,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    ...typography.body,
    color: colors.secondary,
  },
  footerHint: {
    ...typography.caption,
    color: colors.secondary,
  },
});

export default ProductDetailScreen;
