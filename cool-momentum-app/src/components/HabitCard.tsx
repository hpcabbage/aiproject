import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryLabels, Habit } from '../types';
import { colors } from '../theme/colors';
import { getTodayKey } from '../utils/date';

type Props = {
  habit: Habit;
  onToggle: () => void;
  onEdit: () => void;
};

export const HabitCard = ({ habit, onToggle, onEdit }: Props) => {
  const doneToday = habit.completions.includes(getTodayKey());

  return (
    <Pressable onPress={onToggle} style={styles.wrapper}>
      <View style={[styles.dot, { backgroundColor: habit.color }]} />
      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text style={styles.name}>{habit.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryLabels[habit.category]}</Text>
          </View>
        </View>
        <Text style={styles.meta}>
          连续 {habit.streak} 天 · 点击{doneToday ? '取消' : ''}打卡{habit.reminder?.enabled ? ` · 提醒 ${habit.reminder.time}` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onEdit} hitSlop={10}>
          <Ionicons name="create-outline" size={20} color={colors.textMuted} />
        </Pressable>
        <View style={[styles.badgeAction, doneToday && styles.badgeDone]}>
          <Ionicons name={doneToday ? 'checkmark' : 'flash'} size={16} color={colors.white} />
        </View>
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
    gap: 6,
  },
  rowTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(36, 200, 255, 0.16)',
  },
  badgeText: {
    color: colors.accentSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 10,
  },
  badgeAction: {
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
