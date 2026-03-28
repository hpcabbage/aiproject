import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../theme/colors';
import { categoryLabels, Category, Habit, priorityLabels, TodoItem } from '../types';
import { getDateLabel, getRecentDateKeys, getWeekCompletion, getTodayKey, toDateKey } from '../utils/date';

type Props = {
  habits: Habit[];
  todos: TodoItem[];
  completionRate: number;
  bestStreak: number;
  totalDone: number;
  topCategory: string;
  categorySummary: Record<Category, number>;
};

type TrendMode = 'week' | 'month';

export const StatsScreen = ({ habits, todos, completionRate, bestStreak, totalDone, topCategory, categorySummary }: Props) => {
  const [trendMode, setTrendMode] = useState<TrendMode>('week');

  const trendData = useMemo(() => {
    const range = trendMode === 'week' ? 7 : 30;
    const keys = getRecentDateKeys(range);
    const todayKey = getTodayKey();

    return keys.map((key) => {
      const habitCount = habits.filter((habit) => habit.completions.includes(key)).length;
      const todoCount = todos.filter((todo) => todo.completedAt && toDateKey(todo.completedAt) === key).length;
      const total = habitCount + todoCount;

      return {
        key,
        label: getDateLabel(key, trendMode),
        total,
        isToday: key === todayKey,
      };
    });
  }, [habits, todos, trendMode]);

  const trendMax = Math.max(...trendData.map((item) => item.total), 1);
  const trendTotal = trendData.reduce((sum, item) => sum + item.total, 0);
  const activeDays = trendData.filter((item) => item.total > 0).length;
  const averagePerDay = trendTotal / trendData.length;
  const bestDay = trendData.reduce((best, current) => (current.total > best.total ? current : best), trendData[0]);

  const highPriorityTotal = todos.filter((todo) => todo.priority === 'High').length;
  const highPriorityDone = todos.filter((todo) => todo.priority === 'High' && todo.done).length;
  const highPriorityRate = highPriorityTotal === 0 ? 0 : (highPriorityDone / highPriorityTotal) * 100;

  const categoryDoneSummary = useMemo(
    () =>
      (Object.keys(categorySummary) as Category[]).map((key) => {
        const doneTodos = todos.filter((todo) => todo.category === key && todo.done).length;
        const doneHabits = habits.filter((habit) => habit.category === key && habit.completions.includes(getTodayKey())).length;
        return {
          key,
          total: categorySummary[key],
          done: doneTodos + doneHabits,
        };
      }),
    [categorySummary, habits, todos],
  );

  const topDoneCategory = categoryDoneSummary.reduce((best, current) => (current.done > best.done ? current : best), categoryDoneSummary[0]);
  const emptyTrend = trendTotal === 0;

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="统计" subtitle="看结果，不看解释。" />

      <View style={[styles.heroRow, styles.heroRowCompact]}>
        <GlassCard style={[styles.heroCardPrimary, styles.heroCardPrimaryCompact]}>
          <View style={styles.heroCardInnerPrimary}>
            <Text style={styles.heroCardValue}>{Math.round(completionRate)}%</Text>
            <Text style={styles.heroCardLabel}>今日完成率</Text>
          </View>
        </GlassCard>
        <GlassCard style={[styles.heroCardSecondary, styles.heroCardSecondaryCompact]}>
          <View style={styles.heroCardInnerSecondary}>
            <Text style={styles.heroCardMiniValue}>{totalDone}</Text>
            <Text style={styles.heroCardMiniLabel}>总完成</Text>
          </View>
        </GlassCard>
      </View>

      <GlassCard>
        <View style={styles.trendInner}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>趋势</Text>
              <Text style={styles.sectionTitle}>{trendMode === 'week' ? '近 7 天' : '近 30 天'}</Text>
            </View>
            <View style={styles.trendSwitch}>
              <Pressable style={[styles.trendSwitchPill, trendMode === 'week' && styles.trendSwitchPillActive]} onPress={() => setTrendMode('week')}>
                <Text style={[styles.trendSwitchText, trendMode === 'week' && styles.trendSwitchTextActive]}>周</Text>
              </Pressable>
              <Pressable style={[styles.trendSwitchPill, trendMode === 'month' && styles.trendSwitchPillActive]} onPress={() => setTrendMode('month')}>
                <Text style={[styles.trendSwitchText, trendMode === 'month' && styles.trendSwitchTextActive]}>月</Text>
              </Pressable>
            </View>
          </View>

          {emptyTrend ? (
            <Text style={styles.emptyText}>还没有形成趋势，先完成几条待办或点亮几次习惯。</Text>
          ) : (
            <>
              <View style={styles.trendChart}>
                {trendData.map((item) => (
                  <View key={item.key} style={styles.trendBarWrap}>
                    <Text style={styles.trendValue}>{item.total || ''}</Text>
                    <View style={styles.trendTrack}>
                      <View
                        style={[
                          styles.trendBar,
                          { height: `${Math.max((item.total / trendMax) * 100, item.total ? 10 : 4)}%` },
                          item.isToday && styles.trendBarToday,
                        ]}
                      />
                    </View>
                    <Text style={[styles.trendLabel, item.isToday && styles.trendLabelToday]} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.trendStatsRow}>
                <View style={styles.trendStatCard}>
                  <Text style={styles.trendStatValue}>{activeDays}</Text>
                  <Text style={styles.trendStatLabel}>活跃天数</Text>
                </View>
                <View style={styles.trendStatCard}>
                  <Text style={styles.trendStatValue}>{averagePerDay.toFixed(1)}</Text>
                  <Text style={styles.trendStatLabel}>日均推进</Text>
                </View>
                <View style={styles.trendStatCard}>
                  <Text style={styles.trendStatValue}>{bestDay?.total ?? 0}</Text>
                  <Text style={styles.trendStatLabel}>单日峰值</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </GlassCard>

      <View style={styles.grid}>
        <GlassCard style={styles.metricCard}>
          <View style={styles.metricInnerCompact}>
            <Text style={styles.metricValueSmall}>{bestStreak}</Text>
            <Text style={styles.metricLabel}>最佳连续天数</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.metricCard}>
          <View style={styles.metricInnerCompact}>
            <Text style={styles.metricValueSmall}>{Math.round(highPriorityRate)}%</Text>
            <Text style={styles.metricLabel}>高优先级拿下率</Text>
          </View>
        </GlassCard>
      </View>

      <GlassCard>
        <View style={styles.summaryInner}>
          <Text style={styles.sectionEyebrow}>分类</Text>
          <Text style={styles.sectionTitle}>{topCategory}</Text>
          <View style={styles.summaryRow}>
            {(Object.keys(categorySummary) as Category[]).map((key) => (
              <View key={key} style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeLabel}>{categoryLabels[key]}</Text>
                <Text style={styles.summaryBadgeValue}>{categorySummary[key]}</Text>
              </View>
            ))}
          </View>
        </View>
      </GlassCard>

      <GlassCard>
        <View style={styles.summaryInner}>
          <Text style={styles.sectionEyebrow}>洞察</Text>
          <Text style={styles.sectionTitle}>今天你主要在推进什么</Text>
          <View style={styles.insightList}>
            {categoryDoneSummary.map((item) => {
              const percent = item.total === 0 ? 0 : Math.round((item.done / item.total) * 100);
              return (
                <View key={item.key} style={styles.insightRow}>
                  <View style={styles.insightRowTop}>
                    <Text style={styles.insightLabel}>{categoryLabels[item.key]}</Text>
                    <Text style={styles.insightValue}>{item.done}/{item.total} · {percent}%</Text>
                  </View>
                  <View style={styles.insightTrack}>
                    <View style={[styles.insightFill, { width: `${percent}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </GlassCard>

      <View style={styles.habitList}>
        {habits.length ? (
          habits.map((habit) => {
            const week = getWeekCompletion(habit.completions);
            return (
              <GlassCard key={habit.id} style={styles.habitCard}>
                <View style={styles.habitInner}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <Text style={styles.habitMeta}>{categoryLabels[habit.category]} · 连续 {habit.streak} 天</Text>
                    </View>
                    <View style={[styles.habitDot, { backgroundColor: habit.color }]} />
                  </View>
                  <View style={styles.weekRow}>
                    {week.map((done, index) => (
                      <View key={`${habit.id}-${index}`} style={[styles.weekCell, done && styles.weekCellDone]} />
                    ))}
                  </View>
                </View>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard>
            <View style={styles.emptyCardInner}>
              <Text style={styles.emptyText}>还没有习惯趋势数据，先建立一条 habit。</Text>
            </View>
          </GlassCard>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { gap: 14 },
  heroRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  heroRowCompact: { flexDirection: 'column' },
  heroCardPrimary: { flex: 1, minWidth: 0 },
  heroCardPrimaryCompact: { width: '100%' },
  heroCardSecondary: { flexBasis: 100, flexGrow: 0, flexShrink: 1, minWidth: 90, maxWidth: 108 },
  heroCardSecondaryCompact: { width: '100%', maxWidth: '100%' },
  heroCardInnerPrimary: { paddingHorizontal: 16, paddingVertical: 14, minHeight: 92, justifyContent: 'center', gap: 3 },
  heroCardInnerSecondary: { paddingHorizontal: 12, paddingVertical: 14, minHeight: 86, justifyContent: 'center', alignItems: 'center', gap: 2 },
  heroCardValue: { color: colors.text, fontSize: 30, fontWeight: '800' },
  heroCardLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  heroCardMiniValue: { color: colors.text, fontSize: 24, fontWeight: '800' },
  heroCardMiniLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  trendInner: { padding: 16, gap: 12 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sectionEyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  trendSwitch: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 4,
    borderRadius: 999,
  },
  trendSwitchPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  trendSwitchPillActive: { backgroundColor: colors.accent },
  trendSwitchText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  trendSwitchTextActive: { color: colors.white },
  trendChart: {
    minHeight: 188,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  trendBarWrap: { flex: 1, alignItems: 'center', gap: 8 },
  trendValue: { color: colors.textMuted, fontSize: 10, minHeight: 12 },
  trendTrack: {
    width: '100%',
    height: 118,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBar: { width: '100%', minHeight: 4, borderRadius: 999, backgroundColor: colors.accentSecondary },
  trendBarToday: { backgroundColor: colors.accent },
  trendLabel: { color: colors.textMuted, fontSize: 10 },
  trendLabelToday: { color: colors.text, fontWeight: '700' },
  trendStatsRow: { flexDirection: 'row', gap: 8 },
  trendStatCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 4,
  },
  trendStatValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  trendStatLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1 },
  metricInnerCompact: { minHeight: 92, padding: 16, justifyContent: 'center', gap: 4 },
  metricValueSmall: { color: colors.text, fontSize: 24, fontWeight: '800' },
  metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  summaryInner: { padding: 16, gap: 10 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryBadge: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 2,
  },
  summaryBadgeLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  summaryBadgeValue: { color: colors.text, fontSize: 16, fontWeight: '800' },
  insightList: { gap: 12 },
  insightRow: { gap: 8 },
  insightRowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  insightLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  insightValue: { color: colors.textMuted, fontSize: 12 },
  insightTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  insightFill: { height: '100%', borderRadius: 999, backgroundColor: colors.accent },
  habitList: { gap: 12 },
  habitCard: {},
  habitInner: { padding: 18, gap: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  habitName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  habitMeta: { color: colors.textMuted, marginTop: 6, fontSize: 12 },
  habitDot: { width: 16, height: 16, borderRadius: 999 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekCell: { width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' },
  weekCellDone: { backgroundColor: colors.success },
  emptyCardInner: { padding: 18 },
  emptyText: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
});
