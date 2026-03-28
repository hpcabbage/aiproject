import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export const GlassCard = ({ children, style }: Props) => {
  return (
    <LinearGradient colors={gradients.cardGlow} style={[styles.wrapper, style]}>
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 22,
    padding: 1,
  },
  inner: {
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
