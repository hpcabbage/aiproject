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
  const reminderText = habit.reminder?.enabled ? habit.reminder.time : null;

  return (
    <Pressable onPress={onToggle} style={styles.wrapper}>
      <View style={[styles.dot, { backgroundColor: habit.color }]} />
      <View style={styles.content}>
        <Text style={styles.name}>{habit.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{categoryLabels[habit.category]}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.metaText, doneToday && styles.metaTextDone]}>连续 {habit.streak} 天</Text>
          {reminderText ? (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaTextAccent}>{reminderText}</Text>
            </>
          ) : null}
        </View>
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
    paddingVertical: 12,
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
    fontWeight: '700',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  metaTextDone: {
    color: colors.success,
  },
  metaTextAccent: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actions: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 6,
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
