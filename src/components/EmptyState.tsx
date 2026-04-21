import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Ionicons,
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import { colors, spacing, typography, verticalSpacing } from '../theme';
import { wp } from '../utils/responsive';

type Props = {
  iconName?: IoniconsIconName;
  title: string;
  message?: string;
};

const EmptyState: React.FC<Props> = ({
  iconName = 'bag-handle-outline',
  title,
  message,
}) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Ionicons name={iconName} size={wp(10)} color={colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: verticalSpacing.xs,
  },
  iconWrap: {
    width: wp(24),
    height: wp(24),
    borderRadius: 999,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalSpacing.sm,
  },
  title: { ...typography.h2, color: colors.primary, textAlign: 'center' },
  message: { ...typography.body, color: colors.secondary, textAlign: 'center' },
});

export default EmptyState;
