import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { ProgressRing } from '../components/ProgressRing';
import { SectionTitle } from '../components/SectionTitle';
import { TodoCard } from '../components/TodoCard';
import { HabitCard } from '../components/HabitCard';
import { colors, gradients } from '../theme/colors';
import { categoryLabels, Category, Habit, TodoItem } from '../types';
import { getTodayKey } from '../utils/date';

type Props = {
  todos: TodoItem[];
  topTodos: TodoItem[];
  habits: Habit[];
  completionRate: number;
  selectedCategory: Category | 'All';
  categories: (Category | 'All')[];
  focusMessage: string;
  topCategory: string;
  onSelectCategory: (value: Category | 'All') => void;
  onAddPress: () => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string) => void;
  onToggleHabit: (id: string) => void;
  onEditHabit: (id: string) => void;
};

export const HomeScreen = ({
  todos,
  topTodos,
  habits,
  completionRate,
  selectedCategory,
  categories,
  focusMessage,
  topCategory,
  onSelectCategory,
  onAddPress,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onToggleHabit,
  onEditHabit,
}: Props) => {
  const today = getTodayKey();
  const pendingTodos = todos.filter((item) => !item.done).length;
  const doneTodos = todos.filter((item) => item.done).length;
  const habitsDoneToday = habits.filter((habit) => habit.completions.includes(today)).length;
  const reminderCount = [...todos.filter((item) => !item.done), ...habits.filter((habit) => !habit.completions.includes(today))].filter(
    (item) => item.reminder?.enabled,
  ).length;

  const emptyTodoText =
    selectedCategory === 'All'
      ? '今天还没有待办。先放一条真正要推进的事。'
      : `「${categoryLabels[selectedCategory]}」里还没有待办。`;
  const emptyHabitText =
    selectedCategory === 'All'
      ? '今天还没有习惯。先放一条值得长期坚持的动作。'
      : `「${categoryLabels[selectedCategory]}」里还没有习惯。`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.kicker}>TODAY</Text>
            <Text style={styles.heroTitle}>先把最重要的事推掉。</Text>
            <Text style={styles.heroSubtitle}>{focusMessage}</Text>
          </View>
          <ProgressRing value={completionRate} />
        </View>

        <View style={styles.heroFooter}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>{pendingTodos}</Text>
            <Text style={styles.heroMetricLabel}>进行中</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>{habitsDoneToday}</Text>
            <Text style={styles.heroMetricLabel}>已打卡</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>{reminderCount}</Text>
            <Text style={styles.heroMetricLabel}>提醒中</Text>
          </View>
        </View>
      </LinearGradient>

      {topTodos.length ? (
        <GlassCard>
          <View style={styles.topFocusInner}>
            <View style={styles.topFocusHeader}>
              <View>
                <Text style={styles.topFocusTitle}>今日 Top 3</Text>
                <Text style={styles.topFocusSubtitle}>先完成它们，今天就不会跑偏。</Text>
              </View>
              <View style={styles.topFocusBadge}>
                <Ionicons name="flash" size={16} color={colors.white} />
              </View>
            </View>
            <View style={styles.topFocusList}>
              {topTodos.map((item, index) => (
                <TouchableOpacity key={item.id} style={styles.topFocusRow} onPress={() => onEditTodo(item.id)} activeOpacity={0.86}>
                  <View style={styles.topFocusIndex}>
                    <Text style={styles.topFocusIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topFocusContent}>
                    <Text style={styles.topFocusText} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.topFocusMetaRow}>
                      <Text style={styles.topFocusMeta}>{categoryLabels[item.category]}</Text>
                      {item.reminder?.enabled ? (
                        <View style={styles.inlineReminderBadge}>
                          <Ionicons name="notifications-outline" size={12} color={colors.warning} />
                          <Text style={styles.inlineReminderText}>{item.reminder.time}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>
      ) : null}

      <View style={styles.summaryRow}>
        <GlassCard style={styles.summaryCardPrimary}>
          <View style={styles.summaryCardInnerPrimary}>
            <Text style={styles.summaryCardEyebrow}>当前节奏</Text>
            <Text style={styles.summaryCardValue}>{topCategory}</Text>
            <Text style={styles.summaryCardMeta}>已完成 {doneTodos} 项</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.summaryCardSecondary}>
          <View style={styles.summaryCardInnerSecondary}>
            <Text style={styles.summaryCardMiniValue}>{reminderCount}</Text>
            <Text style={styles.summaryCardMiniLabel}>提醒中</Text>
          </View>
        </GlassCard>
      </View>

      <View style={styles.filtersRow}>
        {categories.map((category) => {
          const active = category === selectedCategory;
          const label = category === 'All' ? '全部' : categoryLabels[category];
          return (
            <TouchableOpacity key={category} style={[styles.filterPill, active && styles.filterPillActive]} onPress={() => onSelectCategory(category)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <SectionTitle title="今日待办" subtitle="今天真正要推进的事。" />
        <View style={styles.list}>
          {todos.length ? (
            todos.map((item) => (
              <TodoCard
                key={item.id}
                item={item}
                onToggle={() => onToggleTodo(item.id)}
                onDelete={() => onDeleteTodo(item.id)}
                onEdit={() => onEditTodo(item.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>{emptyTodoText}</Text>
          )}
        </View>
      </View>

      <GlassCard style={styles.quickCard}>
        <View style={styles.quickCardInner}>
          <View>
            <Text style={styles.quickTitle}>新增内容</Text>
            <Text style={styles.quickSubtitle}>把新的待办或习惯放进面板。</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <View style={styles.section}>
        <SectionTitle title="习惯" subtitle="每天点亮，长期复利。" />
        <View style={styles.list}>
          {habits.length ? (
            habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onToggle={() => onToggleHabit(habit.id)} onEdit={() => onEditHabit(habit.id)} />
            ))
          ) : (
            <Text style={styles.emptyText}>{emptyHabitText}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 132, gap: 14 },
  hero: {
    borderRadius: 28,
    padding: 20,
    minHeight: 204,
    gap: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroTextBlock: { flex: 1, gap: 6 },
  kicker: {
    color: 'rgba(255,255,255,0.68)',
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    maxWidth: 220,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 260,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 6,
  },
  heroMetric: { flex: 1, gap: 4, alignItems: 'center' },
  heroMetricValue: { color: colors.white, fontSize: 22, fontWeight: '800' },
  heroMetricLabel: { color: 'rgba(255,255,255,0.68)', fontSize: 11, fontWeight: '700' },
  heroDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.12)' },
  topFocusInner: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  topFocusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  topFocusTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  topFocusSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  topFocusBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topFocusList: { gap: 10 },
  topFocusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topFocusIndex: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  topFocusIndexText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  topFocusContent: { flex: 1, gap: 4 },
  topFocusText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  topFocusMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  topFocusMeta: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  inlineReminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,184,92,0.14)',
  },
  inlineReminderText: { color: colors.warning, fontSize: 11, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCardPrimary: { flex: 1 },
  summaryCardSecondary: { width: 104 },
  summaryCardInnerPrimary: { padding: 16, gap: 4 },
  summaryCardInnerSecondary: { padding: 16, gap: 4, alignItems: 'center', justifyContent: 'center', minHeight: 92 },
  summaryCardEyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  summaryCardValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  summaryCardMeta: { color: colors.textMuted, fontSize: 12 },
  summaryCardMiniValue: { color: colors.text, fontSize: 26, fontWeight: '800' },
  summaryCardMiniLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: { backgroundColor: colors.accent },
  filterText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  filterTextActive: { color: colors.white },
  section: { gap: 10 },
  list: { gap: 12 },
  quickCard: { marginTop: -4 },
  quickCardInner: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  quickSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
});
