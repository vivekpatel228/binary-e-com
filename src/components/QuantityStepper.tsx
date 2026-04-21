import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { colors, radius, spacing, typography } from '../theme';
import { wp } from '../utils/responsive';

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
};

const QuantityStepper: React.FC<Props> = ({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max,
}) => {
  const canDecrement = value > min;
  const canIncrement = max == null || value < max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onDecrement}
        disabled={!canDecrement}
        style={[styles.btn, !canDecrement && styles.btnDisabled]}
      >
        <Ionicons name="remove" size={wp(4.5)} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onIncrement}
        disabled={!canIncrement}
        style={[styles.btn, !canIncrement && styles.btnDisabled]}
      >
        <Ionicons name="add" size={wp(4.5)} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  btn: {
    width: wp(9),
    height: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  valueWrap: {
    paddingHorizontal: spacing.sm,
    minWidth: wp(9),
    alignItems: 'center',
  },
  value: { ...typography.title, color: colors.primary },
});

export default QuantityStepper;
