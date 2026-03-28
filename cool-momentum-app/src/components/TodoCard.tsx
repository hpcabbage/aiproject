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
  const reminderText = item.reminder?.enabled ? item.reminder.time : null;

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.check} onPress={onToggle} hitSlop={12}>
        <Ionicons
          name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.done ? colors.success : colors.textMuted}
        />
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, item.done && styles.done]}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{categoryLabels[item.category]}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{priorityLabels[item.priority]}</Text>
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
        <Pressable onPress={onDelete} hitSlop={12} style={styles.actionButton}>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  check: {
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  done: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
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
    alignSelf: 'flex-start',
    gap: 6,
    paddingTop: 2,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
