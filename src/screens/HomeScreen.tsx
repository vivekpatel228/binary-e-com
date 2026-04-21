import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { CategoryPill, Header, ProductCard, Screen } from '../components';
import { useCart, useWishlist } from '../context';
import {
  GET_CATEGORIES,
  GET_PRODUCTS_BY_CATEGORY,
  type ApiCategory,
  type ApiProduct,
} from '../graphql';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { mapApiProduct } from '../utils/mappers';
import { wp } from '../utils/responsive';
import { showErrorToast } from '../utils/toast';

const PRODUCTS_PER_CATEGORY = 6;

const CATEGORY_PLACEHOLDERS: ApiCategory[] = [
  { id: -1, name: 'Loading...' },
  { id: -2, name: 'Loading...' },
  { id: -3, name: 'Loading...' },
  { id: -4, name: 'Loading...' },
];

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNav>();
  const { addToCart, removeFromCart, isInCart, totalItems } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const {
    data: catData,
    loading: catLoading,
    error: catError,
    refetch: refetchCategories,
  } = useQuery<{ categories: ApiCategory[] }>(GET_CATEGORIES);

  const categories = useMemo(
    () => (catData?.categories ?? []).slice(0, 5),
    [catData],
  );

  const visibleCategories = useMemo(
    () =>
      categories.length > 0
        ? categories
        : catLoading
        ? CATEGORY_PLACEHOLDERS
        : [],
    [categories, catLoading],
  );

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (catError) {
      showErrorToast(
        'Unable to load categories',
        catError.message ?? 'Please try again.',
      );
    }
  }, [catError]);

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const {
    data: prodData,
    previousData: prevProdData,
    loading: prodLoading,
    error: prodError,
  } = useQuery<{ products: ApiProduct[] }>(GET_PRODUCTS_BY_CATEGORY, {
    variables: {
      categoryId: activeCategoryId ?? 0,
      limit: PRODUCTS_PER_CATEGORY,
      offset: 0,
    },
    skip: !activeCategoryId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (prodError) {
      showErrorToast(
        'Unable to load products',
        prodError.message ?? 'Please try again.',
      );
    }
  }, [prodError]);

  const products = useMemo(
    () =>
      ((prodData ?? prevProdData)?.products ?? [])
        .slice(0, PRODUCTS_PER_CATEGORY)
        .map(mapApiProduct),
    [prodData, prevProdData],
  );

  const showProductRefreshOverlay = prodLoading && products.length > 0;

  const onRetry = () => refetchCategories();

  return (
    <Screen>
      <Header
        title="Hello"
        subtitle="Find something you'll love today"
        rightLabel={`${totalItems}`}
        rightIconName="cart-outline"
      />

      <View style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Spring Sale</Text>
          <Text style={styles.bannerSubtitle}>
            Up to 40% off on selected items
          </Text>
        </View>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>40% OFF</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Categories</Text>
      {catError && categories.length === 0 ? (
        <ErrorInline message="Could not load categories." onRetry={onRetry} />
      ) : visibleCategories.length === 0 ? (
        <View style={styles.inlineLoader}>
          <Text style={styles.emptyText}>
            No categories available right now.
          </Text>
        </View>
      ) : (
        <View style={styles.categoriesWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {visibleCategories.map(c => (
              <CategoryPill
                key={c.id}
                label={c.name}
                active={c.id === activeCategoryId}
                disabled={c.id < 0}
                onPress={() => {
                  if (c.id > 0) {
                    setActiveCategoryId(c.id);
                  }
                }}
              />
            ))}
          </ScrollView>

          {catLoading && categories.length === 0 ? (
            <View style={styles.categoryLoadingOverlay} pointerEvents="none">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Featured Products</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('Tabs', {
              screen: 'Products',
              params: activeCategoryId ? { categoryId: activeCategoryId } : undefined,
            } as never)
          }
          style={styles.viewAllBtn}
          hitSlop={8}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons name="chevron-forward" size={wp(4)} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.productsSection}>
        {prodLoading && products.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : prodError && products.length === 0 ? (
          <ErrorInline message="Could not load products." />
        ) : products.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No products in this category.</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cardSlot}>
                <ProductCard
                  product={item}
                  onPress={() =>
                    navigation.navigate('ProductDetail', {
                      productId: Number(item.id),
                    })
                  }
                  onAddToCart={() => addToCart(item)}
                  onRemoveFromCart={() => removeFromCart(item.id)}
                  onToggleWishlist={() => toggleWishlist(item)}
                  isInCart={isInCart(item.id)}
                  isWishlisted={isWishlisted(item.id)}
                />
              </View>
            )}
          />
        )}

        {showProductRefreshOverlay ? (
          <View style={styles.productRefreshOverlay} pointerEvents="none">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
};

const ErrorInline: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <View style={styles.errorBox}>
    <Ionicons name="alert-circle-outline" size={wp(6)} color={colors.danger} />
    <Text style={styles.errorText}>{message}</Text>
    {onRetry ? (
      <Text style={styles.errorRetry} onPress={onRetry}>
        Tap to retry
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: verticalSpacing.xs,
  },
  bannerText: { flex: 1, gap: verticalSpacing.xxs },
  bannerTitle: { ...typography.h2, color: colors.natural },
  bannerSubtitle: { ...typography.caption, color: colors.tertiary },
  bannerTag: {
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  bannerTagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  sectionLabel: {
    ...typography.title,
    color: colors.primary,
    marginTop: verticalSpacing.md,
    marginBottom: verticalSpacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.tertiary,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  categoriesWrap: {
    minHeight: 46,
    justifyContent: 'center',
    position: 'relative',
  },
  categoriesRow: { paddingVertical: spacing.xxs, alignItems: 'center' },
  categoryLoadingOverlay: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.86)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  productsSection: { position: 'relative' },
  listContent: { paddingBottom: verticalSpacing.xl },
  column: { justifyContent: 'space-between', gap: wp(3) },
  cardSlot: { flex: 1, marginBottom: wp(3) },
  inlineLoader: { paddingVertical: spacing.md },
  centered: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalSpacing.xs,
  },
  productRefreshOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.86)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  emptyText: { ...typography.body, color: colors.secondary },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: { ...typography.caption, color: colors.primary, flex: 1 },
  errorRetry: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default HomeScreen;
