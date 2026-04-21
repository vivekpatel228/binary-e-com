import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState, Header, Screen } from '../components';
import { useOrders } from '../context';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { formatPrice } from '../utils/formatters';
import { hp, wp } from '../utils/responsive';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
type RouteP = RouteProp<RootStackParamList, 'OrderDetail'>;

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteP>();
  const { getOrder } = useOrders();
  const order = getOrder(params.orderId);

  if (!order) {
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
        <Header title="Order" />
        <EmptyState
          iconName="document-outline"
          title="Order not found"
          message="We couldn't find this order on this device."
        />
      </Screen>
    );
  }

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
      <Header
        title="Order details"
        subtitle={`Placed on ${formatDate(order.createdAt)}`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Ionicons
              name="checkmark-circle"
              size={wp(4)}
              color={colors.natural}
            />
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.orderId}>{order.id}</Text>
        </View>

        <Text style={styles.sectionLabel}>
          {order.items.length} item{order.items.length === 1 ? '' : 's'}
        </Text>
        <View style={styles.card}>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  {formatPrice(item.price)} · Qty {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Shipping to</Text>
        <View style={styles.card}>
          <Text style={styles.addrName}>{order.address.fullName}</Text>
          <Text style={styles.addrLine}>{order.address.phone}</Text>
          <Text style={styles.addrLine}>{order.address.line1}</Text>
          {order.address.line2 ? (
            <Text style={styles.addrLine}>{order.address.line2}</Text>
          ) : null}
          <Text style={styles.addrLine}>
            {order.address.city}, {order.address.state} {order.address.postalCode}
          </Text>
          <Text style={styles.addrLine}>{order.address.country}</Text>
        </View>

        <Text style={styles.sectionLabel}>Payment</Text>
        <View style={styles.card}>
          <SummaryRow label="Subtotal" value={formatPrice(order.subtotal)} />
          <SummaryRow label="Shipping" value={formatPrice(order.shipping)} />
          <SummaryRow label="Tax" value={formatPrice(order.tax)} />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={formatPrice(order.total)} bold />
        </View>
      </ScrollView>
    </Screen>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; bold?: boolean }> = ({
  label,
  value,
  bold,
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, bold && styles.boldLabel]}>{label}</Text>
    <Text style={[styles.summaryValue, bold && styles.boldValue]}>{value}</Text>
  </View>
);

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
  body: { paddingBottom: verticalSpacing.xl },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalSpacing.xs,
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
  orderId: { ...typography.caption, color: colors.secondary },
  sectionLabel: {
    ...typography.title,
    color: colors.primary,
    marginTop: verticalSpacing.md,
    marginBottom: verticalSpacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: verticalSpacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemImage: {
    width: wp(16),
    height: hp(8),
    borderRadius: radius.md,
    backgroundColor: colors.tertiary,
  },
  itemInfo: { flex: 1, gap: verticalSpacing.xxs },
  itemName: { ...typography.body, color: colors.primary, fontWeight: '700' },
  itemMeta: { ...typography.caption, color: colors.secondary },
  itemTotal: { ...typography.body, color: colors.primary, fontWeight: '700' },
  addrName: { ...typography.body, color: colors.primary, fontWeight: '700' },
  addrLine: { ...typography.caption, color: colors.secondary },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: { ...typography.body, color: colors.secondary },
  summaryValue: { ...typography.body, color: colors.primary, fontWeight: '600' },
  boldLabel: { color: colors.primary, fontWeight: '800' },
  boldValue: { color: colors.primary, fontWeight: '800' },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: verticalSpacing.xs,
  },
});

export default OrderDetailScreen;
