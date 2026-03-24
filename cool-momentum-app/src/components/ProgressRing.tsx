import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  value: number;
};

export const ProgressRing = ({ value }: Props) => {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, { borderColor: normalized >= 100 ? colors.success : colors.accent }]}>
        <Text style={styles.value}>{normalized}%</Text>
        <Text style={styles.label}>今日进度</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,11,23,0.92)',
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
});
