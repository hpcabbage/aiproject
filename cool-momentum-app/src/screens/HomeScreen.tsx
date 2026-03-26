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
  const activeHabitCount = habits.filter((habit) => !habit.completions.includes(today)).length;
  const reminderCount = [...todos.filter((item) => !item.done), ...habits.filter((habit) => !habit.completions.includes(today))].filter(
    (item) => item.reminder?.enabled,
  ).length;

  const emptyTodoText = selectedCategory === 'All' ? '今天的待办列表还是空的，先丢一条真正要推进的事进来。' : '这个分类下面还没有待办，补一条最关键的行动项吧。';
  const emptyHabitText = selectedCategory === 'All' ? '今天还没有习惯卡片，挑一个最值得长期坚持的动作开始。' : '这个分类下面还没有习惯，正好补一条长期会复利的动作。';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.kicker}>MOMENTUM V2</Text>
          <Text style={styles.heroTitle}>今天别散，狠狠干完。</Text>
          <Text style={styles.heroSubtitle}>{focusMessage}</Text>
        </View>
        <ProgressRing value={completionRate} />
      </LinearGradient>

      <View style={styles.quickStatsGrid}>
        <GlassCard style={styles.quickStatCard}>
          <View style={styles.quickStatInner}>
            <Text style={styles.quickStatValue}>{pendingTodos}</Text>
            <Text style={styles.quickStatLabel}>待拿下</Text>
            <Text style={styles.quickStatHint}>优先清最关键的待办，别把注意力散掉。</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.quickStatCard}>
          <View style={styles.quickStatInner}>
            <Text style={styles.quickStatValue}>{habitsDoneToday}/{Math.max(habits.length, 0)}</Text>
            <Text style={styles.quickStatLabel}>今日打卡</Text>
            <Text style={styles.quickStatHint}>把今天该完成的动作点亮，节奏会更稳。</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.quickStatCardWide}>
          <View style={styles.quickStatWideInner}>
            <View>
              <Text style={styles.quickStatWideTitle}>提醒中的项目</Text>
              <Text style={styles.quickStatWideSubtitle}>只统计今天还会继续推着你走的条目。</Text>
            </View>
            <View style={styles.reminderBadgeLarge}>
              <Ionicons name="notifications" size={16} color={colors.white} />
              <Text style={styles.reminderBadgeLargeText}>{reminderCount}</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      <GlassCard>
        <View style={styles.insightCardInner}>
          <View style={styles.insightBadge}>
            <Ionicons name="pulse" size={16} color={colors.white} />
          </View>
          <View style={styles.insightBody}>
            <Text style={styles.insightTitle}>当前节奏</Text>
            <Text style={styles.insightText}>{topCategory}</Text>
          </View>
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>已完成 {doneTodos}</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard>
        <View style={styles.secondaryInsightRow}>
          <View style={styles.secondaryInsightItem}>
            <Text style={styles.secondaryInsightLabel}>未打卡习惯</Text>
            <Text style={styles.secondaryInsightValue}>{activeHabitCount}</Text>
          </View>
          <View style={styles.secondaryDivider} />
          <View style={styles.secondaryInsightItem}>
            <Text style={styles.secondaryInsightLabel}>已完成待办</Text>
            <Text style={styles.secondaryInsightValue}>{doneTodos}</Text>
          </View>
          <View style={styles.secondaryDivider} />
          <View style={styles.secondaryInsightItem}>
            <Text style={styles.secondaryInsightLabel}>进行中待办</Text>
            <Text style={styles.secondaryInsightValue}>{pendingTodos}</Text>
          </View>
        </View>
      </GlassCard>

      {topTodos.length ? (
        <GlassCard>
          <View style={styles.topFocusInner}>
            <View style={styles.topFocusHeader}>
              <View>
                <Text style={styles.topFocusTitle}>今日 Top 3</Text>
                <Text style={styles.topFocusSubtitle}>先把最重要的几条砍掉，别被杂事带节奏。</Text>
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
                          <Text style={styles.inlineReminderText}>提醒 {item.reminder.time}</Text>
                        </View>
                      ) : (
                        <View style={styles.inlineReminderBadgeMuted}>
                          <Ionicons name="notifications-off-outline" size={12} color={colors.textMuted} />
                          <Text style={styles.inlineReminderTextMuted}>未开启提醒</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>
      ) : null}

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

      <GlassCard style={styles.quickCard}>
        <View style={styles.quickCardInner}>
          <View>
            <Text style={styles.quickTitle}>开始推进</Text>
            <Text style={styles.quickSubtitle}>新增一条要推进的事，或者补上一条会长期复利的习惯。</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <View style={styles.section}>
        <SectionTitle title="今日待办" subtitle="只摆真正要推进的事，完成一条就少一条噪音。" />
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

      <View style={styles.section}>
        <SectionTitle title="习惯打卡" subtitle="每天点亮一点，靠连续性把状态慢慢抬上去。" />
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
  content: { padding: 20, paddingBottom: 120, gap: 20 },
  hero: {
    borderRadius: 30,
    padding: 22,
    minHeight: 210,
    justifyContent: 'space-between',
    gap: 18,
  },
  heroTextBlock: { gap: 10 },
  kicker: {
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    maxWidth: 220,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 280,
  },
  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickStatCard: { width: '48%' },
  quickStatCardWide: { width: '100%' },
  quickStatInner: { minHeight: 104, padding: 16, justifyContent: 'center', gap: 6 },
  quickStatWideInner: {
    minHeight: 88,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickStatValue: { color: colors.text, fontSize: 28, fontWeight: '800' },
  quickStatLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  quickStatHint: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  quickStatWideTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  quickStatWideSubtitle: { marginTop: 6, color: colors.textMuted, fontSize: 12, lineHeight: 18, maxWidth: 220 },
  reminderBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 92, 255, 0.28)',
  },
  reminderBadgeLargeText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  insightCardInner: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  insightBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBody: { flex: 1, gap: 4 },
  insightTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  insightText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  doneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(49, 208, 170, 0.16)',
  },
  doneBadgeText: { color: colors.success, fontSize: 12, fontWeight: '800' },
  secondaryInsightRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryInsightItem: { flex: 1, gap: 6, alignItems: 'center' },
  secondaryInsightLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  secondaryInsightValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  secondaryDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  topFocusInner: { paddingHorizontal: 18, paddingVertical: 16, gap: 14 },
  topFocusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  topFocusTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  topFocusSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 12, lineHeight: 18, maxWidth: 240 },
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
  topFocusText: { color: colors.text, fontSize: 14, fontWeight: '700' },
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
  inlineReminderBadgeMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inlineReminderTextMuted: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.accent,
  },
  filterText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  filterTextActive: { color: colors.white },
  quickCard: { marginTop: -6 },
  quickCardInner: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  quickSubtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    maxWidth: 220,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  section: { gap: 12 },
  list: { gap: 12 },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
});
