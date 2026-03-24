import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoItem } from '../types';
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
        <Text style={[styles.title, item.done && styles.done]}>{item.title}</Text>
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
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  done: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
