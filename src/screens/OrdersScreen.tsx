import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState, Header, Screen } from '../components';
import { useOrders } from '../context';
import type { Order } from '../context';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { formatPrice } from '../utils/formatters';
import { wp } from '../utils/responsive';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { orders } = useOrders();

  const renderItem = ({ item }: { item: Order }) => {
    const itemCount = item.items.reduce((s, i) => s + i.quantity, 0);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusPill}>
            <Ionicons
              name="checkmark-circle"
              size={wp(3.5)}
              color={colors.natural}
            />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.orderId} numberOfLines={1}>
          {item.id}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.meta}>
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </Text>
          <Text style={styles.total}>{formatPrice(item.total)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
        style={styles.backBtn}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={wp(5.5)} color={colors.primary} />
      </TouchableOpacity>
      <Header title="My orders" subtitle={`${orders.length} total`} />

      {orders.length === 0 ? (
        <EmptyState
          iconName="receipt-outline"
          title="No orders yet"
          message="When you place an order, it will appear here."
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  list: { paddingVertical: verticalSpacing.sm },
  separator: { height: verticalSpacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: verticalSpacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  statusText: {
    ...typography.caption,
    color: colors.natural,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  date: { ...typography.caption, color: colors.secondary },
  orderId: { ...typography.caption, color: colors.secondary },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalSpacing.xxs,
  },
  meta: { ...typography.body, color: colors.secondary },
  total: { ...typography.body, color: colors.primary, fontWeight: '800' },
});

export default OrdersScreen;
