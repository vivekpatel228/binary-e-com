import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState, Header, ProductCard, Screen } from '../components';
import { useCart, useWishlist } from '../context';
import {
  SEARCH_PRODUCTS,
  GET_PRODUCTS,
  type ApiProduct,
} from '../graphql';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { mapApiProduct } from '../utils/mappers';
import { wp } from '../utils/responsive';
import { showErrorToast } from '../utils/toast';

type SearchNav = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const useDebounced = <T,>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchNav>();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 400);
  const trimmed = debouncedQuery.trim();

  const { addToCart, removeFromCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const hasQuery = trimmed.length > 0;

  const searchResult = useQuery<{ products: ApiProduct[] }>(SEARCH_PRODUCTS, {
    variables: { title: trimmed },
    skip: !hasQuery,
  });

  const browseResult = useQuery<{ products: ApiProduct[] }>(GET_PRODUCTS, {
    variables: { limit: 20, offset: 0 },
    skip: hasQuery,
  });

  const loading = hasQuery ? searchResult.loading : browseResult.loading;
  const error = hasQuery ? searchResult.error : browseResult.error;
  const apiProducts = hasQuery
    ? searchResult.data?.products
    : browseResult.data?.products;

  useEffect(() => {
    if (error) {
      showErrorToast('Search failed', error.message ?? 'Please try again.');
    }
  }, [error]);

  const products = useMemo(
    () => (apiProducts ?? []).map(mapApiProduct),
    [apiProducts],
  );

  return (
    <Screen>
      <Header title="Search" subtitle="Find your next favorite" />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={wp(5)} color={colors.secondary} />
        <TextInput
          style={styles.input}
          placeholder="Search products..."
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error && products.length === 0 ? (
        <EmptyState
          iconName="alert-circle-outline"
          title="Something went wrong"
          message={error.message ?? 'Please try again.'}
        />
      ) : products.length === 0 ? (
        <EmptyState
          iconName={hasQuery ? 'search-outline' : 'sparkles-outline'}
          title={hasQuery ? 'No results found' : 'Start exploring'}
          message={
            hasQuery
              ? `We couldn't find anything matching "${trimmed}".`
              : 'Type above to search the catalog.'
          }
        />
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: verticalSpacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.primary,
    paddingVertical: 0,
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
});

export default SearchScreen;
