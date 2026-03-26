import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryLabels, priorityLabels, TodoItem } from '../types';
import { colors } from '../theme/colors';

type Props = {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
};

export const TodoCard = ({ item, onToggle, onDelete, onEdit }: Props) => {
  const reminderText = item.reminder?.enabled ? `提醒 ${item.reminder.time}` : '未开启提醒';
  const statusText = item.done ? '已完成，今天这条已经收掉。' : '进行中，优先把它推进到完成。';

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.check} onPress={onToggle}>
        <Ionicons
          name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.done ? colors.success : colors.textMuted}
        />
      </Pressable>
      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text style={[styles.title, item.done && styles.done]}>{item.title}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryLabels[item.category]}</Text>
          </View>
          <View style={[styles.priorityBadge, styles[`priority${item.priority}`]]}>
            <Text style={[styles.priorityBadgeText, styles[`priority${item.priority}Text`]]}>{priorityLabels[item.priority]}</Text>
          </View>
          <View style={[styles.reminderBadge, item.reminder?.enabled && styles.reminderBadgeActive]}>
            <Ionicons name={item.reminder?.enabled ? 'notifications' : 'notifications-off-outline'} size={12} color={item.reminder?.enabled ? colors.warning : colors.textMuted} />
            <Text style={[styles.reminderBadgeText, item.reminder?.enabled && styles.reminderBadgeTextActive]}>{reminderText}</Text>
          </View>
        </View>
        <Text style={styles.meta}>{statusText}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onEdit} hitSlop={10}>
          <Ionicons name="create-outline" size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={10}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
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
  check: {
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  actions: {
    alignSelf: 'flex-start',
    gap: 10,
    paddingTop: 2,
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
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  done: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
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
    backgroundColor: 'rgba(124, 92, 255, 0.18)',
  },
  badgeText: {
    color: colors.accentSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priorityHigh: { backgroundColor: 'rgba(255, 107, 138, 0.18)' },
  priorityHighText: { color: colors.danger },
  priorityMedium: { backgroundColor: 'rgba(255, 184, 92, 0.18)' },
  priorityMediumText: { color: colors.warning },
  priorityLow: { backgroundColor: 'rgba(49, 208, 170, 0.18)' },
  priorityLowText: { color: colors.success },
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
});
