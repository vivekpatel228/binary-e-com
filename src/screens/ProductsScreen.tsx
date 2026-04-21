import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CategoryPill, EmptyState, Header, ProductCard, Screen } from '../components';
import { useCart, useWishlist } from '../context';
import {
  GET_CATEGORIES,
  GET_PRODUCTS_FILTERED,
  type ApiCategory,
  type ApiProduct,
} from '../graphql';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { mapApiProduct } from '../utils/mappers';
import { wp } from '../utils/responsive';
import { showErrorToast } from '../utils/toast';

type ProductsNav = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
type ProductsRoute = RouteProp<{ Products: { categoryId?: number } | undefined }, 'Products'>;

type SortOption = 'none' | 'priceAsc' | 'priceDesc';

const PAGE_SIZE = 10;

const useDebounced = <T,>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const buildPathSuffix = (params: {
  title?: string;
  categoryId?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
}): string => {
  const parts: string[] = [];
  if (params.title && params.title.trim().length > 0) {
    parts.push(`title=${encodeURIComponent(params.title.trim())}`);
  }
  if (params.categoryId && params.categoryId > 0) {
    parts.push(`categoryId=${params.categoryId}`);
  }
  if (params.priceMin != null && !Number.isNaN(params.priceMin)) {
    parts.push(`price_min=${params.priceMin}`);
  }
  if (params.priceMax != null && !Number.isNaN(params.priceMax)) {
    parts.push(`price_max=${params.priceMax}`);
  }
  return parts.length > 0 ? `&${parts.join('&')}` : '';
};

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<ProductsNav>();
  const route = useRoute<ProductsRoute>();
  const initialCategoryId = route.params?.categoryId ?? null;

  const { addToCart, removeFromCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 400);

  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [priceMinInput, setPriceMinInput] = useState('');
  const [priceMaxInput, setPriceMaxInput] = useState('');
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('none');

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [items, setItems] = useState<ApiProduct[]>([]);
  const [offset, setOffset] = useState(0);
  const [endReached, setEndReached] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchingRef = useRef(false);

  const { data: catData } = useQuery<{ categories: ApiCategory[] }>(
    GET_CATEGORIES,
  );
  const categories = useMemo(
    () => (catData?.categories ?? []).slice(0, 10),
    [catData],
  );

  const pathSuffix = useMemo(
    () =>
      buildPathSuffix({
        title: debouncedQuery,
        categoryId,
        priceMin,
        priceMax,
      }),
    [debouncedQuery, categoryId, priceMin, priceMax],
  );

  const {
    data,
    loading,
    error,
    refetch,
    fetchMore,
  } = useQuery<{ products: ApiProduct[] }>(GET_PRODUCTS_FILTERED, {
    variables: { limit: PAGE_SIZE, offset: 0, pathSuffix },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (error) {
      showErrorToast(
        'Unable to load products',
        error.message ?? 'Please try again.',
      );
    }
  }, [error]);

  useEffect(() => {
    const fresh = data?.products ?? [];
    setItems(fresh);
    setOffset(fresh.length);
    setEndReached(fresh.length < PAGE_SIZE);
  }, [data]);

  const handleLoadMore = useCallback(async () => {
    if (fetchingRef.current || endReached || loading || items.length === 0) {
      return;
    }
    fetchingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetchMore({
        variables: { limit: PAGE_SIZE, offset, pathSuffix },
      });
      const next = res.data?.products ?? [];
      if (next.length === 0) {
        setEndReached(true);
      } else {
        setItems(prev => {
          const seen = new Set(prev.map(p => p.id));
          const merged = [...prev];
          for (const p of next) {
            if (!seen.has(p.id)) merged.push(p);
          }
          return merged;
        });
        setOffset(prev => prev + next.length);
        if (next.length < PAGE_SIZE) setEndReached(true);
      }
    } catch (e) {
      showErrorToast('Failed to load more products');
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [endReached, loading, items.length, fetchMore, offset, pathSuffix]);

  const sortedProducts = useMemo(() => {
    const mapped = items.map(mapApiProduct);
    if (sort === 'priceAsc') {
      return [...mapped].sort((a, b) => a.price - b.price);
    }
    if (sort === 'priceDesc') {
      return [...mapped].sort((a, b) => b.price - a.price);
    }
    return mapped;
  }, [items, sort]);

  const activeFilterCount =
    (categoryId ? 1 : 0) +
    (priceMin != null ? 1 : 0) +
    (priceMax != null ? 1 : 0) +
    (sort !== 'none' ? 1 : 0);

  const applyFilters = () => {
    const minNum = priceMinInput.trim() === '' ? null : Number(priceMinInput);
    const maxNum = priceMaxInput.trim() === '' ? null : Number(priceMaxInput);
    setPriceMin(minNum != null && !Number.isNaN(minNum) ? minNum : null);
    setPriceMax(maxNum != null && !Number.isNaN(maxNum) ? maxNum : null);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setCategoryId(null);
    setPriceMinInput('');
    setPriceMaxInput('');
    setPriceMin(null);
    setPriceMax(null);
    setSort('none');
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (endReached && sortedProducts.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerEndText}>You've reached the end</Text>
        </View>
      );
    }
    return null;
  };

  const showInitialLoader = loading && items.length === 0;
  const showError = error && items.length === 0;
  const showEmpty = !loading && !error && sortedProducts.length === 0;

  return (
    <Screen>
      <Header title="Products" subtitle="Browse, search and filter" />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(5)} color={colors.secondary} />
          <TextInput
            style={styles.input}
            placeholder="Search by name..."
            placeholderTextColor={colors.secondary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={wp(5)}
                color={colors.secondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setFiltersOpen(true)}
          style={styles.filterBtn}
        >
          <Ionicons name="options-outline" size={wp(5)} color={colors.natural} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {activeFilterCount > 0 ? (
        <View style={styles.activeChipsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {categoryId ? (
              <ActiveChip
                label={
                  categories.find(c => c.id === categoryId)?.name ?? 'Category'
                }
                onClear={() => setCategoryId(null)}
              />
            ) : null}
            {priceMin != null ? (
              <ActiveChip
                label={`Min $${priceMin}`}
                onClear={() => {
                  setPriceMin(null);
                  setPriceMinInput('');
                }}
              />
            ) : null}
            {priceMax != null ? (
              <ActiveChip
                label={`Max $${priceMax}`}
                onClear={() => {
                  setPriceMax(null);
                  setPriceMaxInput('');
                }}
              />
            ) : null}
            {sort !== 'none' ? (
              <ActiveChip
                label={sort === 'priceAsc' ? 'Price: Low→High' : 'Price: High→Low'}
                onClear={() => setSort('none')}
              />
            ) : null}
          </ScrollView>
          <TouchableOpacity onPress={resetFilters} hitSlop={6}>
            <Text style={styles.clearAllText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showInitialLoader ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : showError ? (
        <EmptyState
          iconName="alert-circle-outline"
          title="Something went wrong"
          message={error?.message ?? 'Please try again.'}
        />
      ) : showEmpty ? (
        <EmptyState
          iconName="cube-outline"
          title="No products found"
          message="Try adjusting your search or filters."
        />
      ) : (
        <FlatList
          data={sortedProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          onRefresh={() => refetch()}
          refreshing={loading && items.length > 0 && !loadingMore}
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
          keyboardShouldPersistTaps="handled"
        />
      )}

      <FiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        categories={categories}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        priceMinInput={priceMinInput}
        priceMaxInput={priceMaxInput}
        setPriceMinInput={setPriceMinInput}
        setPriceMaxInput={setPriceMaxInput}
        sort={sort}
        setSort={setSort}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </Screen>
  );
};

const ActiveChip: React.FC<{ label: string; onClear: () => void }> = ({
  label,
  onClear,
}) => (
  <View style={styles.activeChip}>
    <Text style={styles.activeChipText} numberOfLines={1}>
      {label}
    </Text>
    <TouchableOpacity onPress={onClear} hitSlop={6}>
      <Ionicons name="close" size={wp(3.6)} color={colors.natural} />
    </TouchableOpacity>
  </View>
);

type FiltersModalProps = {
  visible: boolean;
  onClose: () => void;
  categories: ApiCategory[];
  categoryId: number | null;
  setCategoryId: (id: number | null) => void;
  priceMinInput: string;
  priceMaxInput: string;
  setPriceMinInput: (v: string) => void;
  setPriceMaxInput: (v: string) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  onApply: () => void;
  onReset: () => void;
};

const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  categories,
  categoryId,
  setCategoryId,
  priceMinInput,
  priceMaxInput,
  setPriceMinInput,
  setPriceMaxInput,
  sort,
  setSort,
  onApply,
  onReset,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <Pressable style={styles.modalBackdrop} onPress={onClose}>
      <Pressable style={styles.modalSheet} onPress={() => {}}>
        <View style={styles.modalHandle} />
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={wp(6)} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalBody}
        >
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.pillsWrap}>
            <CategoryPill
              label="All"
              active={categoryId == null}
              onPress={() => setCategoryId(null)}
            />
            {categories.map(c => (
              <CategoryPill
                key={c.id}
                label={c.name}
                active={c.id === categoryId}
                onPress={() => setCategoryId(c.id)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Price range</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <Text style={styles.priceLabel}>Min</Text>
              <TextInput
                value={priceMinInput}
                onChangeText={setPriceMinInput}
                placeholder="0"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
            <View style={styles.priceField}>
              <Text style={styles.priceLabel}>Max</Text>
              <TextInput
                value={priceMaxInput}
                onChangeText={setPriceMaxInput}
                placeholder="1000"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Sort by price</Text>
          <View style={styles.sortWrap}>
            <SortOptionRow
              label="Default"
              active={sort === 'none'}
              onPress={() => setSort('none')}
            />
            <SortOptionRow
              label="Low to High"
              active={sort === 'priceAsc'}
              onPress={() => setSort('priceAsc')}
            />
            <SortOptionRow
              label="High to Low"
              active={sort === 'priceDesc'}
              onPress={() => setSort('priceDesc')}
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onReset}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onApply}
            style={styles.applyBtn}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const SortOptionRow: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={styles.sortRow}
  >
    <Text style={styles.sortLabel}>{label}</Text>
    <Ionicons
      name={active ? 'radio-button-on' : 'radio-button-off'}
      size={wp(5)}
      color={active ? colors.primary : colors.secondary}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: verticalSpacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.primary,
    paddingVertical: 0,
  },
  filterBtn: {
    width: wp(11),
    height: wp(11),
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: wp(4.5),
    height: wp(4.5),
    paddingHorizontal: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: colors.natural,
    fontSize: 10,
    fontWeight: '800',
  },
  activeChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: verticalSpacing.xs,
  },
  chipsContent: {
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    maxWidth: wp(40),
  },
  activeChipText: {
    ...typography.caption,
    color: colors.natural,
    fontWeight: '700',
  },
  clearAllText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: verticalSpacing.sm,
    paddingBottom: verticalSpacing.xl,
  },
  column: { justifyContent: 'space-between', gap: wp(3) },
  cardSlot: { flex: 1, marginBottom: wp(3) },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footerLoader: {
    paddingVertical: verticalSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerEndText: {
    ...typography.caption,
    color: colors.secondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.natural,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    maxHeight: '85%',
  },
  modalHandle: {
    width: wp(12),
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: verticalSpacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalSpacing.sm,
  },
  modalTitle: { ...typography.h2, color: colors.primary },
  modalBody: { paddingBottom: verticalSpacing.md },
  sectionLabel: {
    ...typography.title,
    color: colors.primary,
    marginTop: verticalSpacing.sm,
    marginBottom: verticalSpacing.xs,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priceField: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.secondary,
  },
  priceInput: {
    ...typography.body,
    color: colors.primary,
    paddingVertical: 0,
    marginTop: 2,
  },
  sortWrap: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortLabel: { ...typography.body, color: colors.primary },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: verticalSpacing.sm,
  },
  resetBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    ...typography.button,
    color: colors.primary,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    ...typography.button,
    color: colors.natural,
  },
});

export default ProductsScreen;
