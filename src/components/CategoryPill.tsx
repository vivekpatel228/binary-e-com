import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Props = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

const CategoryPill: React.FC<Props> = ({
  label,
  active,
  disabled,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    disabled={disabled}
    onPress={onPress}
    style={[
      styles.pill,
      active ? styles.active : styles.inactive,
      disabled && styles.disabled,
    ]}
  >
    <Text
      style={[styles.label, active ? styles.labelActive : styles.labelInactive]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: {
    minHeight: 38,
    minWidth: 72,
    maxWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
    borderWidth: 1,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactive: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.65 },
  label: {
    ...typography.caption,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  labelActive: { color: colors.natural },
  labelInactive: { color: colors.primary },
});

export default CategoryPill;
