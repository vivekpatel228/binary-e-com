import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Ionicons,
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, Screen } from '../components';
import { useCart, useOrders, useWishlist } from '../context';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { wp } from '../utils/responsive';

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

type RowProps = {
  icon: IoniconsIconName;
  label: string;
  detail?: string;
  onPress?: () => void;
};

const Row: React.FC<RowProps> = ({ icon, label, detail, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={styles.row}
  >
    <View style={styles.rowLeft}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={wp(5)} color={colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      <Ionicons name="chevron-forward" size={wp(4.5)} color={colors.secondary} />
    </View>
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNav>();
  const { orders } = useOrders();
  const { totalItems: wishlistCount } = useWishlist();
  const { totalItems: cartCount } = useCart();

  return (
    <Screen>
      <Header title="Profile" subtitle="Your account & activity" />

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={wp(8)} color={colors.primary} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>Guest user</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Row
          icon="receipt-outline"
          label="My orders"
          detail={`${orders.length}`}
          onPress={() => navigation.navigate('Orders')}
        />
        <Row
          icon="heart-outline"
          label="Wishlist"
          detail={`${wishlistCount}`}
          onPress={() => navigation.navigate('Wishlist')}
        />
        <Row
          icon="cart-outline"
          label="Cart"
          detail={`${cartCount}`}
          onPress={() => navigation.navigate('Tabs')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: verticalSpacing.xs,
  },
  avatar: {
    width: wp(16),
    height: wp(16),
    borderRadius: radius.pill,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1, gap: verticalSpacing.xxs },
  name: { ...typography.h2, color: colors.primary },
  subtitle: { ...typography.caption, color: colors.secondary },
  section: {
    marginTop: verticalSpacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: wp(9),
    height: wp(9),
    borderRadius: radius.md,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { ...typography.body, color: colors.primary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowDetail: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
});

export default ProfileScreen;
