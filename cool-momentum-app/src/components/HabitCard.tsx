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
    <View style={[styles.wrapper, doneToday && styles.wrapperDone]}>
      <Pressable style={styles.mainAction} onPress={onToggle}>
        <View style={[styles.dot, { backgroundColor: habit.color }]} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, doneToday && styles.nameDone]} numberOfLines={2}>
              {habit.name}
            </Text>
            <View style={[styles.statusBadge, doneToday ? styles.statusBadgeDone : styles.statusBadgePending]}>
              <Ionicons name={doneToday ? 'checkmark' : 'flash'} size={12} color={doneToday ? colors.success : colors.accentSecondary} />
              <Text style={[styles.statusText, doneToday ? styles.statusTextDone : styles.statusTextPending]}>
                {doneToday ? '今日已完成' : '点我打卡'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, doneToday && styles.metaTextDone]}>{categoryLabels[habit.category]}</Text>
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
      </Pressable>

      <Pressable onPress={onEdit} hitSlop={12} style={styles.actionButton}>
        <Ionicons name="create-outline" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
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
  wrapperDone: {
    backgroundColor: 'rgba(49, 208, 170, 0.08)',
    borderColor: 'rgba(49, 208, 170, 0.24)',
  },
  mainAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  titleRow: {
    gap: 8,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  nameDone: {
    color: colors.textMuted,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgePending: {
    backgroundColor: 'rgba(124, 92, 255, 0.12)',
    borderColor: 'rgba(124, 92, 255, 0.26)',
  },
  statusBadgeDone: {
    backgroundColor: 'rgba(49, 208, 170, 0.12)',
    borderColor: 'rgba(49, 208, 170, 0.24)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusTextPending: {
    color: colors.accentSecondary,
  },
  statusTextDone: {
    color: colors.success,
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
    color: 'rgba(183, 194, 224, 0.72)',
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
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
