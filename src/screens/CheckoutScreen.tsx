import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

type AddressField =
  | 'fullName'
  | 'phone'
  | 'line1'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country';

type AddressErrors = Partial<Record<AddressField, string>>;

const requiredAddressFields: AddressField[] = [
  'fullName',
  'phone',
  'line1',
  'city',
  'state',
  'postalCode',
  'country',
];

const validateAddressField = (
  key: AddressField,
  value: string,
): string | undefined => {
  const trimmed = value.trim();

  switch (key) {
    case 'fullName':
      if (trimmed.length < 2) return 'Enter your full name.';
      return undefined;
    case 'phone': {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) {
        return 'Enter a valid phone number.';
      }
      return undefined;
    }
    case 'line1':
      if (trimmed.length < 5) return 'Enter a valid street address.';
      return undefined;
    case 'city':
      if (trimmed.length < 2) return 'Enter a valid city.';
      return undefined;
    case 'state':
      if (trimmed.length < 2) return 'Enter a valid state.';
      return undefined;
    case 'postalCode':
      if (!/^[A-Za-z0-9][A-Za-z0-9\-\s]{2,9}$/.test(trimmed)) {
        return 'Enter a valid postal code.';
      }
      return undefined;
    case 'country':
      if (trimmed.length < 2) return 'Enter a valid country.';
      return undefined;
    default:
      return undefined;
  }
};

const validateAddressForm = (input: Address): AddressErrors => {
  const next: AddressErrors = {};
  requiredAddressFields.forEach(field => {
    const error = validateAddressField(field, input[field]);
    if (error) next[field] = error;
  });
  return next;
};

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutNav>();
  const insets = useSafeAreaInsets();
  const { items, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [touched, setTouched] = useState<
    Partial<Record<AddressField, boolean>>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    readJSON<Address | null>(STORAGE_KEYS.address, null).then(stored => {
      if (stored) setAddress(stored);
    });
  }, []);

  const shipping = totalPrice > 0 ? 9.99 : 0;
  const tax = Number((totalPrice * 0.08).toFixed(2));
  const grandTotal = Number((totalPrice + shipping + tax).toFixed(2));

  const validationErrors = useMemo(
    () => validateAddressForm(address),
    [address],
  );

  const setField = <K extends keyof Address>(key: K, value: Address[K]) =>
    setAddress(prev => ({ ...prev, [key]: value }));

  const markTouched = (key: AddressField) =>
    setTouched(prev => ({ ...prev, [key]: true }));

  const fieldError = (key: AddressField) =>
    touched[key] || submitAttempted ? validationErrors[key] : undefined;

  const isValid = Object.keys(validationErrors).length === 0;

  const onPlaceOrder = async () => {
    if (items.length === 0) {
      showErrorToast('Cart is empty');
      return;
    }

    setSubmitAttempted(true);
    if (!isValid) {
      showErrorToast(
        'Invalid address',
        'Please correct the highlighted fields and try again.',
      );
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
    } catch {
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + wp(2) : 0}
      >
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Shipping address</Text>
          <View style={styles.card}>
            <Field
              label="Full name"
              value={address.fullName}
              onChangeText={v => setField('fullName', v)}
              onBlur={() => markTouched('fullName')}
              error={fieldError('fullName')}
              placeholder="John Doe"
              autoCapitalize="words"
            />
            <Field
              label="Phone"
              value={address.phone}
              onChangeText={v =>
                setField('phone', v.replace(/[^0-9+\-()\s]/g, ''))
              }
              keyboardType="phone-pad"
              onBlur={() => markTouched('phone')}
              error={fieldError('phone')}
              placeholder="+1 555 123 4567"
            />
            <Field
              label="Address line 1"
              value={address.line1}
              onChangeText={v => setField('line1', v)}
              onBlur={() => markTouched('line1')}
              error={fieldError('line1')}
              placeholder="123 Main Street"
              autoCapitalize="words"
            />
            <Field
              label="Address line 2 (optional)"
              value={address.line2 ?? ''}
              onChangeText={v => setField('line2', v)}
              placeholder="Apartment, suite, etc."
              autoCapitalize="words"
            />
            <View style={styles.row}>
              <Field
                label="City"
                value={address.city}
                onChangeText={v => setField('city', v)}
                style={styles.flex}
                onBlur={() => markTouched('city')}
                error={fieldError('city')}
                placeholder="San Francisco"
                autoCapitalize="words"
              />
              <Field
                label="State"
                value={address.state}
                onChangeText={v => setField('state', v)}
                style={styles.flex}
                onBlur={() => markTouched('state')}
                error={fieldError('state')}
                placeholder="California"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.row}>
              <Field
                label="Postal code"
                value={address.postalCode}
                onChangeText={v => setField('postalCode', v)}
                style={styles.flex}
                onBlur={() => markTouched('postalCode')}
                error={fieldError('postalCode')}
                placeholder="94105"
                autoCapitalize="characters"
              />
              <Field
                label="Country"
                value={address.country}
                onChangeText={v => setField('country', v)}
                style={styles.flex}
                onBlur={() => markTouched('country')}
                error={fieldError('country')}
                placeholder="United States"
                autoCapitalize="words"
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

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, verticalSpacing.sm) },
          ]}
        >
          <Button
            label={`Place order · ${formatPrice(grandTotal)}`}
            onPress={onPlaceOrder}
            loading={submitting}
            disabled={!isValid || items.length === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'email-address';
  autoCapitalize?: TextInputProps['autoCapitalize'];
  style?: ViewStyle;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
}) => (
  <View style={[styles.field, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholder={placeholder}
      placeholderTextColor={colors.secondary}
      style={[styles.fieldInput, error && styles.fieldInputError]}
    />
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
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
  body: {
    flexGrow: 1,
    paddingBottom: verticalSpacing.md,
  },
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
  fieldInputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    ...typography.caption,
    color: colors.danger,
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
    paddingTop: verticalSpacing.sm,
    paddingVertical: verticalSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.natural,
  },
});

export default CheckoutScreen;
