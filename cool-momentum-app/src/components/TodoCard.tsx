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

export const TodoCard = ({ item, onToggle, onEdit }: Props) => {
  const reminderText = item.reminder?.enabled ? item.reminder.time : null;

  return (
    <View style={[styles.wrapper, item.done && styles.wrapperDone]}>
      <Pressable style={styles.check} onPress={onToggle} hitSlop={14}>
        <Ionicons
          name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={item.done ? colors.success : colors.textMuted}
        />
      </Pressable>

      <Pressable style={styles.content} onPress={onToggle} hitSlop={8}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, item.done && styles.done]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, item.done ? styles.statusBadgeDone : styles.statusBadgePending]}>
            <Text style={[styles.statusText, item.done ? styles.statusTextDone : styles.statusTextPending]}>
              {item.done ? '已完成' : '点我完成'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, item.done && styles.metaTextDone]}>{categoryLabels[item.category]}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.metaText, item.done && styles.metaTextDone]}>{priorityLabels[item.priority]}</Text>
          {reminderText ? (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaTextAccent}>{reminderText}</Text>
            </>
          ) : null}
        </View>
      </Pressable>

      <Pressable onPress={onEdit} hitSlop={12} style={styles.editButton}>
        <Ionicons name="create-outline" size={16} color={colors.textMuted} />
        <Text style={styles.editButtonText}>编辑</Text>
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
  check: {
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  done: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  statusBadge: {
    alignSelf: 'flex-start',
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
  editButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
