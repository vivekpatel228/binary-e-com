import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Screen } from '../components';
import type { RootStackParamList } from '../navigation';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';
import { wp } from '../utils/responsive';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderSuccess'>;
type RouteP = RouteProp<RootStackParamList, 'OrderSuccess'>;

const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteP>();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="checkmark-done"
            size={wp(14)}
            color={colors.natural}
          />
        </View>
        <Text style={styles.title}>Order placed!</Text>
        <Text style={styles.subtitle}>
          Thanks for your purchase. We've received your order and it's being
          prepared.
        </Text>
        <View style={styles.idPill}>
          <Text style={styles.idPillLabel}>Order ID</Text>
          <Text style={styles.idPillValue}>{params.orderId}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="View order"
            onPress={() =>
              navigation.replace('OrderDetail', { orderId: params.orderId })
            }
          />
          <Button
            label="Keep shopping"
            variant="outline"
            onPress={() => navigation.popToTop()}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: verticalSpacing.sm,
  },
  iconCircle: {
    width: wp(28),
    height: wp(28),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalSpacing.sm,
  },
  title: { ...typography.h1, color: colors.primary, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: verticalSpacing.sm,
  },
  idPillLabel: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  idPillValue: { ...typography.caption, color: colors.primary, fontWeight: '800' },
  actions: {
    alignSelf: 'stretch',
    marginTop: verticalSpacing.md,
    gap: verticalSpacing.xs,
  },
});

export default OrderSuccessScreen;
