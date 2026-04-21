import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Header, Screen } from '../components';
import { useCart, useOrders } from '../context';
import type { Address } from '../context';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { formatPrice } from '../utils/formatters';
import { wp } from '../utils/responsive';
import { STORAGE_KEYS, readJSON, writeJSON } from '../utils/storage';
import { showErrorToast, showSuccessToast } from '../utils/toast';

type CheckoutNav = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

const emptyAddress: Address = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutNav>();
  const { items, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    readJSON<Address | null>(STORAGE_KEYS.address, null).then(stored => {
      if (stored) setAddress(stored);
    });
  }, []);

  const shipping = totalPrice > 0 ? 9.99 : 0;
  const tax = Number((totalPrice * 0.08).toFixed(2));
  const grandTotal = Number((totalPrice + shipping + tax).toFixed(2));

  const setField = <K extends keyof Address>(key: K, value: Address[K]) =>
    setAddress(prev => ({ ...prev, [key]: value }));

  const isValid =
    address.fullName.trim().length > 0 &&
    address.phone.trim().length > 0 &&
    address.line1.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.postalCode.trim().length > 0 &&
    address.country.trim().length > 0;

  const onPlaceOrder = async () => {
    if (!isValid) {
      showErrorToast('Missing fields', 'Please complete the shipping address.');
      return;
    }
    if (items.length === 0) {
      showErrorToast('Cart is empty');
      return;
    }
    setSubmitting(true);
    try {
      await writeJSON(STORAGE_KEYS.address, address);
      const order = await placeOrder({
        items,
        address,
        subtotal: totalPrice,
        shipping,
        tax,
        total: grandTotal,
      });
      clearCart();
      showSuccessToast('Order placed');
      navigation.replace('OrderSuccess', { orderId: order.id });
    } catch (e) {
      showErrorToast('Could not place order', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
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

      <Header title="Checkout" subtitle="Confirm shipping & pay" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
        >
          <Text style={styles.sectionLabel}>Shipping address</Text>
          <View style={styles.card}>
            <Field
              label="Full name"
              value={address.fullName}
              onChangeText={v => setField('fullName', v)}
            />
            <Field
              label="Phone"
              value={address.phone}
              onChangeText={v => setField('phone', v)}
              keyboardType="phone-pad"
            />
            <Field
              label="Address line 1"
              value={address.line1}
              onChangeText={v => setField('line1', v)}
            />
            <Field
              label="Address line 2 (optional)"
              value={address.line2 ?? ''}
              onChangeText={v => setField('line2', v)}
            />
            <View style={styles.row}>
              <Field
                label="City"
                value={address.city}
                onChangeText={v => setField('city', v)}
                style={styles.flex}
              />
              <Field
                label="State"
                value={address.state}
                onChangeText={v => setField('state', v)}
                style={styles.flex}
              />
            </View>
            <View style={styles.row}>
              <Field
                label="Postal code"
                value={address.postalCode}
                onChangeText={v => setField('postalCode', v)}
                style={styles.flex}
                keyboardType="number-pad"
              />
              <Field
                label="Country"
                value={address.country}
                onChangeText={v => setField('country', v)}
                style={styles.flex}
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Order summary</Text>
          <View style={styles.card}>
            <SummaryRow label="Subtotal" value={formatPrice(totalPrice)} />
            <SummaryRow label="Shipping" value={formatPrice(shipping)} />
            <SummaryRow label="Tax" value={formatPrice(tax)} />
            <View style={styles.divider} />
            <SummaryRow label="Total" value={formatPrice(grandTotal)} bold />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          label={`Place order · ${formatPrice(grandTotal)}`}
          onPress={onPlaceOrder}
          loading={submitting}
          disabled={!isValid || items.length === 0}
        />
      </View>
    </Screen>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'email-address';
  style?: object;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  style,
}) => (
  <View style={[styles.field, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor={colors.secondary}
      style={styles.fieldInput}
    />
  </View>
);

const SummaryRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
}> = ({ label, value, bold }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.summaryValue, bold && styles.bold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  body: { paddingBottom: verticalSpacing.lg },
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
  field: { gap: verticalSpacing.xxs },
  fieldLabel: { ...typography.caption, color: colors.secondary },
  fieldInput: {
    ...typography.body,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.natural,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: { ...typography.body, color: colors.secondary },
  summaryValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  bold: { color: colors.primary, fontWeight: '800' },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: verticalSpacing.xs,
  },
  footer: {
    paddingVertical: verticalSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default CheckoutScreen;
