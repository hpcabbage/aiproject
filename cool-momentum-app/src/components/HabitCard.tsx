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
  const reminderText = habit.reminder?.enabled ? `提醒 ${habit.reminder.time}` : '未开启提醒';
  const statusText = doneToday ? '今天已完成，取消打卡会恢复今日节奏。' : '今天还没点亮，记得把这条习惯做掉。';

  return (
    <Pressable onPress={onToggle} style={styles.wrapper}>
      <View style={[styles.dot, { backgroundColor: habit.color }]} />
      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text style={styles.name}>{habit.name}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryLabels[habit.category]}</Text>
          </View>
          <View style={[styles.streakBadge, doneToday && styles.streakBadgeDone]}>
            <Text style={[styles.streakBadgeText, doneToday && styles.streakBadgeTextDone]}>连续 {habit.streak} 天</Text>
          </View>
          <View style={[styles.reminderBadge, habit.reminder?.enabled && styles.reminderBadgeActive]}>
            <Ionicons
              name={habit.reminder?.enabled ? 'notifications' : 'notifications-off-outline'}
              size={12}
              color={habit.reminder?.enabled ? colors.warning : colors.textMuted}
            />
            <Text style={[styles.reminderBadgeText, habit.reminder?.enabled && styles.reminderBadgeTextActive]}>{reminderText}</Text>
          </View>
        </View>
        <Text style={styles.meta}>{statusText}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onEdit} hitSlop={12} style={styles.actionButton}>
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
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
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
    gap: 8,
  },
  rowTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    lineHeight: 18,
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
  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 92, 255, 0.18)',
  },
  streakBadgeDone: {
    backgroundColor: 'rgba(49, 208, 170, 0.18)',
  },
  streakBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  streakBadgeTextDone: {
    color: colors.success,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  reminderBadgeActive: { backgroundColor: 'rgba(255, 184, 92, 0.14)' },
  reminderBadgeText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  reminderBadgeTextActive: { color: colors.warning },
  actions: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
