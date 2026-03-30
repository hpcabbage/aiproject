import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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
  totalDone: number;
  selectedCategory: Category | 'All';
  categories: (Category | 'All')[];
  focusMessage: string;
  topCategory: string;
  onSelectCategory: (value: Category | 'All') => void;
  onAddPress: () => void;
  onOpenStats: () => void;
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
  totalDone,
  selectedCategory,
  categories,
  focusMessage,
  topCategory,
  onSelectCategory,
  onAddPress,
  onOpenStats,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onToggleHabit,
  onEditHabit,
}: Props) => {
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 440;
  const today = getTodayKey();
  const [todoDoneCollapsed, setTodoDoneCollapsed] = useState(true);
  const [habitDoneCollapsed, setHabitDoneCollapsed] = useState(true);
  const pendingTodoItems = todos.filter((item) => !item.done);
  const completedTodoItems = todos.filter((item) => item.done);
  const activeHabitItems = habits.filter((habit) => !habit.completions.includes(today));
  const completedHabitItems = habits.filter((habit) => habit.completions.includes(today));
  const pendingTodos = pendingTodoItems.length;
  const doneTodos = completedTodoItems.length;
  const habitsDoneToday = completedHabitItems.length;
  const reminderCount = [...pendingTodoItems, ...activeHabitItems].filter((item) => item.reminder?.enabled).length;
  const completionTone =
    completionRate >= 80 ? '今天推进得很稳，继续保持。' : completionRate >= 40 ? '节奏已经拉起来了，再收掉几项会很舒服。' : '先清掉眼前最重要的一项，今天就会顺很多。';
  const instantFeedbackText = totalDone >= 5 ? `今天已经拿下 ${totalDone} 项，状态很漂亮。` : null;

  const emptyTodoText =
    selectedCategory === 'All'
      ? '今天还没有待办。先放一条真正要推进的事。'
      : '这一类里还没有待办。';
  const emptyHabitText =
    selectedCategory === 'All'
      ? '今天还没有习惯。先放一条值得长期坚持的动作。'
      : '这一类里还没有习惯。';
  const showQuickAddCard = !(selectedCategory === 'All' && todos.length === 0 && habits.length === 0);
  const showCategoryContextCard = selectedCategory !== 'All';

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
            <Text style={styles.heroMetricLabel}>待完成</Text>
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

        {instantFeedbackText ? (
          <View style={styles.instantFeedbackPill}>
            <Ionicons name="sparkles" size={14} color={colors.white} />
            <Text style={styles.instantFeedbackText}>{instantFeedbackText}</Text>
          </View>
        ) : null}
      </LinearGradient>

      <GlassCard>
        <View style={styles.pulseCardInner}>
          <View style={styles.pulseCardHeader}>
            <View style={styles.pulseBadge}>
              <Ionicons name="pulse" size={14} color={colors.accentSecondary} />
            </View>
            <View style={styles.pulseHeaderTextBlock}>
              <Text style={styles.pulseTitle}>今日节奏</Text>
              <Text style={styles.pulseSubtitle}>{completionTone}</Text>
            </View>
          </View>

          <View style={[styles.pulseMetricsRow, isCompactWidth && styles.pulseMetricsRowCompact]}>
            <View style={styles.pulseMetricCard}>
              <Text style={styles.pulseMetricLabel}>当前重点</Text>
              <Text style={styles.pulseMetricValue} numberOfLines={1}>
                {topCategory}
              </Text>
              <Text style={styles.pulseMetricMeta}>优先把这个节奏里的关键项收掉。</Text>
            </View>
            <View style={styles.pulseMetricCard}>
              <Text style={styles.pulseMetricLabel}>结果回顾</Text>
              <Text style={styles.pulseMetricValue}>{totalDone} 项</Text>
              <Text style={styles.pulseMetricMeta}>当前完成率 {Math.round(completionRate)}%，结果已经开始积累。</Text>
            </View>
          </View>

          {totalDone > 0 ? (
            <TouchableOpacity style={styles.statsNudgeCard} onPress={onOpenStats} activeOpacity={0.88}>
              <View style={styles.statsNudgeTextBlock}>
                <Text style={styles.statsNudgeTitle}>去统计页看反馈</Text>
                <Text style={styles.statsNudgeSubtitle}>你今天已经完成了 {totalDone} 项动作，结果页现在更有参考价值。</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </GlassCard>

      {topTodos.length ? (
        <GlassCard style={styles.topFocusCard}>
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
                <View key={item.id} style={styles.topFocusRow}>
                  <TouchableOpacity style={styles.topFocusMain} onPress={() => onEditTodo(item.id)} activeOpacity={0.86}>
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
                    <Ionicons name="create-outline" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.topFocusDoneButton} onPress={() => onToggleTodo(item.id)} activeOpacity={0.88}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.white} />
                    <Text style={styles.topFocusDoneButtonText}>完成</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>
      ) : (
        <GlassCard style={styles.topFocusCard}>
          <View style={styles.emptyTopFocusCard}>
            <View style={styles.emptyTopFocusHeader}>
              <View style={styles.emptyTopFocusBadge}>
                <Ionicons name="sparkles" size={18} color={colors.white} />
              </View>
              <View style={styles.emptyTopFocusTextBlock}>
                <Text style={styles.emptyTopFocusTitle}>先选出今天最重要的 1 件事</Text>
                <Text style={styles.emptyTopFocusSubtitle}>竞品里最稳的做法不是堆功能，而是帮你先聚焦。先加一条待办，首页节奏会立刻立住。</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.emptyTopFocusCta} onPress={onAddPress} activeOpacity={0.88}>
              <Ionicons name="add-circle-outline" size={18} color={colors.white} />
              <Text style={styles.emptyTopFocusCtaText}>添加今天的第一条待办</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {showQuickAddCard ? (
        <GlassCard style={styles.quickCard}>
          <View style={styles.quickCardInner}>
            <View>
              <Text style={styles.quickTitle}>新增内容</Text>
              <Text style={styles.quickSubtitle}>把新的待办或习惯放进面板，今天的节奏就会继续往前走。</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
              <Ionicons name="add" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </GlassCard>
      ) : null}

      <View style={styles.section}>
        <SectionTitle title="今日待办" subtitle="今天真正要推进的事。" />

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

        {showCategoryContextCard ? (
          <View style={styles.categoryContextCard}>
            <View style={styles.categoryContextTextBlock}>
              <Text style={styles.categoryContextTitle}>当前只看「{categoryLabels[selectedCategory]}」</Text>
              <Text style={styles.categoryContextSubtitle}>上面的节奏仍是今天的全局视角，下面列表已经切到这个分类里，适合你定点收一类内容。</Text>
            </View>
            <TouchableOpacity style={styles.categoryContextAction} onPress={() => onSelectCategory('All')} activeOpacity={0.88}>
              <Text style={styles.categoryContextActionText}>回到全部</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.list}>
          {todos.length ? (
            <>
              <View style={styles.todoGroup}>
                <View style={styles.todoGroupHeader}>
                  <Text style={styles.todoGroupTitle}>未完成</Text>
                  <View style={styles.todoGroupCountBadge}>
                    <Text style={styles.todoGroupCountText}>{pendingTodoItems.length}</Text>
                  </View>
                </View>
                {pendingTodoItems.length ? (
                  pendingTodoItems.map((item) => (
                    <TodoCard
                      key={item.id}
                      item={item}
                      onToggle={() => onToggleTodo(item.id)}
                      onDelete={() => onDeleteTodo(item.id)}
                      onEdit={() => onEditTodo(item.id)}
                    />
                  ))
                ) : (
                  <Text style={styles.groupHintText}>这组已经清空啦，下面都是今天已经收掉的事。</Text>
                )}
              </View>

              {completedTodoItems.length ? (
                <View style={styles.todoGroupDone}>
                  <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setTodoDoneCollapsed((value) => !value)} activeOpacity={0.86}>
                    <View style={styles.collapsibleHeaderLeft}>
                      <Text style={styles.todoGroupTitleMuted}>已完成</Text>
                      <View style={[styles.todoGroupCountBadge, styles.todoGroupCountBadgeDone]}>
                        <Text style={[styles.todoGroupCountText, styles.todoGroupCountTextDone]}>{completedTodoItems.length}</Text>
                      </View>
                    </View>
                    <View style={styles.collapsibleHeaderRight}>
                      <Text style={styles.collapsibleHint}>{todoDoneCollapsed ? `查看已完成（${completedTodoItems.length}）` : '收起'}</Text>
                      <Ionicons name={todoDoneCollapsed ? 'chevron-down' : 'chevron-up'} size={16} color={colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                  {!todoDoneCollapsed ? (
                    <View style={styles.doneList}>
                      {completedTodoItems.map((item) => (
                        <TodoCard
                          key={item.id}
                          item={item}
                          onToggle={() => onToggleTodo(item.id)}
                          onDelete={() => onDeleteTodo(item.id)}
                          onEdit={() => onEditTodo(item.id)}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyText}>{emptyTodoText}</Text>
              <TouchableOpacity style={styles.emptyStateAction} onPress={onAddPress} activeOpacity={0.88}>
                <Ionicons name="add-circle-outline" size={16} color={colors.white} />
                <Text style={styles.emptyStateActionText}>添加一条待办</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.section, styles.habitSection]}>
        <SectionTitle title="习惯" subtitle="每天点亮，长期复利。" />
        <View style={styles.list}>
          {habits.length ? (
            <>
              <View style={styles.todoGroup}>
                <View style={styles.todoGroupHeader}>
                  <Text style={styles.todoGroupTitle}>今天待打卡</Text>
                  <View style={styles.todoGroupCountBadge}>
                    <Text style={styles.todoGroupCountText}>{activeHabitItems.length}</Text>
                  </View>
                </View>
                {activeHabitItems.length ? (
                  activeHabitItems.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} onToggle={() => onToggleHabit(habit.id)} onEdit={() => onEditHabit(habit.id)} />
                  ))
                ) : (
                  <Text style={styles.groupHintText}>今天这组习惯已经全部点亮啦，继续保持这种节奏。</Text>
                )}
              </View>

              {completedHabitItems.length ? (
                <View style={styles.todoGroupDone}>
                  <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setHabitDoneCollapsed((value) => !value)} activeOpacity={0.86}>
                    <View style={styles.collapsibleHeaderLeft}>
                      <Text style={styles.todoGroupTitleMuted}>今日已打卡</Text>
                      <View style={[styles.todoGroupCountBadge, styles.todoGroupCountBadgeDone]}>
                        <Text style={[styles.todoGroupCountText, styles.todoGroupCountTextDone]}>{completedHabitItems.length}</Text>
                      </View>
                    </View>
                    <View style={styles.collapsibleHeaderRight}>
                      <Text style={styles.collapsibleHint}>{habitDoneCollapsed ? `查看已打卡（${completedHabitItems.length}）` : '收起'}</Text>
                      <Ionicons name={habitDoneCollapsed ? 'chevron-down' : 'chevron-up'} size={16} color={colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                  {!habitDoneCollapsed ? (
                    <View style={styles.doneList}>
                      {completedHabitItems.map((habit) => (
                        <HabitCard key={habit.id} habit={habit} onToggle={() => onToggleHabit(habit.id)} onEdit={() => onEditHabit(habit.id)} />
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyText}>{emptyHabitText}</Text>
              <TouchableOpacity style={styles.emptyStateAction} onPress={onAddPress} activeOpacity={0.88}>
                <Ionicons name="add-circle-outline" size={16} color={colors.white} />
                <Text style={styles.emptyStateActionText}>添加一条习惯</Text>
              </TouchableOpacity>
            </View>
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
  instantFeedbackPill: {
    marginTop: 2,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  instantFeedbackText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  pulseCardInner: { paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  pulseCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pulseBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36, 200, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(36, 200, 255, 0.18)',
  },
  pulseHeaderTextBlock: { flex: 1, gap: 4 },
  pulseTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  pulseSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  pulseMetricsRow: { flexDirection: 'row', gap: 10 },
  pulseMetricsRowCompact: { flexDirection: 'column' },
  statsNudgeCard: {
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 92, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsNudgeTextBlock: { flex: 1, gap: 4 },
  statsNudgeTitle: { color: colors.white, fontSize: 14, fontWeight: '800' },
  statsNudgeSubtitle: { color: 'rgba(255,255,255,0.74)', fontSize: 12, lineHeight: 18 },
  pulseMetricCard: {
    flex: 1,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pulseMetricLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  pulseMetricValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  pulseMetricMeta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  topFocusCard: {
    marginTop: -2,
  },
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
    alignItems: 'stretch',
    gap: 10,
  },
  topFocusMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topFocusDoneButton: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(49, 208, 170, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(49, 208, 170, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  topFocusDoneButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
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
  emptyTopFocusCard: { paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  emptyTopFocusHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  emptyTopFocusBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTopFocusTextBlock: { flex: 1, gap: 4 },
  emptyTopFocusTitle: { color: colors.text, fontSize: 18, fontWeight: '800', lineHeight: 24 },
  emptyTopFocusSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  emptyTopFocusCta: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(124, 92, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.26)',
  },
  emptyTopFocusCtaText: { color: colors.white, fontSize: 14, fontWeight: '800' },
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
  categoryContextCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryContextTextBlock: { flex: 1, gap: 4 },
  categoryContextTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  categoryContextSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  categoryContextAction: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 92, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.24)',
  },
  categoryContextActionText: { color: colors.accentSecondary, fontSize: 12, fontWeight: '800' },
  section: { gap: 10 },
  habitSection: { marginTop: 6 },
  list: { gap: 12 },
  todoGroup: {
    gap: 12,
  },
  todoGroupDone: {
    gap: 12,
    paddingTop: 4,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 2,
  },
  collapsibleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsibleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collapsibleHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  todoGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 2,
  },
  todoGroupTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  todoGroupTitleMuted: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  todoGroupCountBadge: {
    minWidth: 28,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 92, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.24)',
  },
  todoGroupCountBadgeDone: {
    backgroundColor: 'rgba(49, 208, 170, 0.12)',
    borderColor: 'rgba(49, 208, 170, 0.24)',
  },
  todoGroupCountText: {
    color: colors.accentSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  todoGroupCountTextDone: {
    color: colors.success,
  },
  groupHintText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  doneList: {
    gap: 10,
    opacity: 0.96,
  },
  quickCard: { marginTop: -4 },
  quickCardInner: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  quickSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 12, lineHeight: 18, maxWidth: 240 },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  emptyStateCard: {
    gap: 12,
    paddingVertical: 8,
  },
  emptyStateAction: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 92, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.26)',
  },
  emptyStateActionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
});
