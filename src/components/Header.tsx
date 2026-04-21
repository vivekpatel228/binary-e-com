import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type IoniconsIconName } from '@react-native-vector-icons/ionicons/static';
import { colors, radius, spacing, typography, verticalSpacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightIconName?: IoniconsIconName;
  onRightPress?: () => void;
};

const Header: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.container}>
    <View style={styles.textBlock}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalSpacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: verticalSpacing.xxs,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.secondary,
  },
  rightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  rightLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default Header;
