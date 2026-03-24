import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { colors } from '../theme/colors';
import { getTodayKey } from '../utils/date';

type Props = {
  habit: Habit;
  onToggle: () => void;
};

export const HabitCard = ({ habit, onToggle }: Props) => {
  const doneToday = habit.completions.includes(getTodayKey());

  return (
    <Pressable onPress={onToggle} style={styles.wrapper}>
      <View style={[styles.dot, { backgroundColor: habit.color }]} />
      <View style={styles.content}>
        <Text style={styles.name}>{habit.name}</Text>
        <Text style={styles.meta}>连续 {habit.streak} 天 · 点击{doneToday ? '取消' : ''}打卡</Text>
      </View>
      <View style={[styles.badge, doneToday && styles.badgeDone]}>
        <Ionicons name={doneToday ? 'checkmark' : 'flash'} size={16} color={colors.white} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.cardSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  badgeDone: {
    backgroundColor: colors.success,
  },
});
