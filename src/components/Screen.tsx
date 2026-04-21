import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

const Screen: React.FC<Props> = ({ children, style, padded = true }) => (
  <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={[styles.container, padded && styles.padded, style]}>
      {children}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.natural,
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
  },
});

export default Screen;
