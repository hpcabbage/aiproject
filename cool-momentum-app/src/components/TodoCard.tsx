import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryLabels, TodoItem } from '../types';
import { colors } from '../theme/colors';

type Props = {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
};

export const TodoCard = ({ item, onToggle, onDelete }: Props) => {
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryLabels[item.category]}</Text>
          </View>
        </View>
        <Text style={styles.meta}>{item.done ? '已完成，干得漂亮' : '今天把它拿下'}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={10}>
        <Ionicons name="close" size={22} color={colors.textMuted} />
      </Pressable>
    </View>
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
  check: {
    alignSelf: 'flex-start',
    paddingTop: 2,
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
});
