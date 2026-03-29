import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../theme/colors';
import { categoryLabels, Category, Habit, TodoItem } from '../types';
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
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;

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
  const momentumSummary =
    completionRate >= 80 ? '这几天的推进质量很稳，已经接近理想节奏。' : completionRate >= 40 ? '节奏已经起来了，再往前收几项会更漂亮。' : '结果页先不需要太好看，先把今天最重要的几项做出来。';
  const insightSummary =
    topDoneCategory && topDoneCategory.done > 0
      ? `今天推进最多的是「${categoryLabels[topDoneCategory.key]}」，说明你的注意力正在向这里集中。`
      : `当前最重的内容还是「${topCategory}」，等你开始完成动作后，这里会更有参考价值。`;

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="统计" subtitle="看结果，也看节奏怎么形成。" />

      <GlassCard>
        <View style={styles.heroPanel}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.accentSecondary} />
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroEyebrow}>RESULT SNAPSHOT</Text>
              <Text style={styles.heroTitle}>今天的推进结果</Text>
              <Text style={styles.heroSubtitle}>{momentumSummary}</Text>
            </View>
          </View>

          <View style={[styles.heroMetricsRow, isCompactWidth && styles.heroMetricsRowCompact]}>
            <View style={[styles.heroMetricCard, styles.heroMetricCardPrimary]}>
              <Text style={styles.heroMetricValue}>{Math.round(completionRate)}%</Text>
              <Text style={styles.heroMetricLabel}>今日完成率</Text>
              <Text style={styles.heroMetricMeta}>总共已拿下 {totalDone} 项动作</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValueSmall}>{topCategory}</Text>
              <Text style={styles.heroMetricLabel}>当前主战场</Text>
              <Text style={styles.heroMetricMeta}>现在最重的节奏落在这里</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      <GlassCard>
        <View style={styles.trendInner}>
          <View style={[styles.trendHeader, isCompactWidth && styles.trendHeaderCompact]}>
            <View style={styles.trendHeading}>
              <Text style={styles.sectionEyebrow}>趋势</Text>
              <Text style={styles.sectionTitle}>{trendMode === 'week' ? '近 7 天推进曲线' : '近 30 天推进曲线'}</Text>
              <Text style={styles.sectionSubtitle}>
                {emptyTrend
                  ? '还没有形成连续趋势，先开始推进几项，结果页才会慢慢长出来。'
                  : `这段时间一共推进了 ${trendTotal} 项动作，最好的一天完成了 ${bestDay?.total ?? 0} 项。`}
              </Text>
            </View>
            <View style={[styles.trendSwitch, isCompactWidth && styles.trendSwitchCompact]}>
              <Pressable
                style={[
                  styles.trendSwitchPill,
                  isCompactWidth && styles.trendSwitchPillCompact,
                  trendMode === 'week' && styles.trendSwitchPillActive,
                ]}
                onPress={() => setTrendMode('week')}
              >
                <Text style={[styles.trendSwitchText, trendMode === 'week' && styles.trendSwitchTextActive]}>周</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.trendSwitchPill,
                  isCompactWidth && styles.trendSwitchPillCompact,
                  trendMode === 'month' && styles.trendSwitchPillActive,
                ]}
                onPress={() => setTrendMode('month')}
              >
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
            <Text style={styles.metricMeta}>最稳的时候你能连续把节奏保持多久</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.metricCard}>
          <View style={styles.metricInnerCompact}>
            <Text style={styles.metricValueSmall}>{Math.round(highPriorityRate)}%</Text>
            <Text style={styles.metricLabel}>高优先级拿下率</Text>
            <Text style={styles.metricMeta}>真正重要的事有没有被你优先收掉</Text>
          </View>
        </GlassCard>
      </View>

      <GlassCard>
        <View style={styles.summaryInner}>
          <Text style={styles.sectionEyebrow}>分类</Text>
          <Text style={styles.sectionTitle}>当前内容分布</Text>
          <Text style={styles.sectionSubtitle}>现在内容最多的是「{topCategory}」，它基本定义了你最近这段时间的注意力方向。</Text>
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
          <Text style={styles.sectionTitle}>今天的推进重心</Text>
          <Text style={styles.sectionSubtitle}>{insightSummary}</Text>
          <View style={styles.insightList}>
            {categoryDoneSummary.map((item) => {
              const percent = item.total === 0 ? 0 : Math.round((item.done / item.total) * 100);
              return (
                <View key={item.key} style={styles.insightRow}>
                  <View style={styles.insightRowTop}>
                    <Text style={styles.insightLabel}>{categoryLabels[item.key]}</Text>
                    <Text style={styles.insightValue}>
                      {item.done}/{item.total} · {percent}%
                    </Text>
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
  heroPanel: { padding: 16, gap: 14 },
  heroTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  heroBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36, 200, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(36, 200, 255, 0.2)',
  },
  heroTextBlock: { flex: 1, gap: 4 },
  heroEyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  heroMetricsRow: { flexDirection: 'row', gap: 10 },
  heroMetricsRowCompact: { flexDirection: 'column' },
  heroMetricCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  heroMetricCardPrimary: {
    flex: 1.2,
  },
  heroMetricValue: { color: colors.text, fontSize: 30, fontWeight: '800' },
  heroMetricValueSmall: { color: colors.text, fontSize: 18, fontWeight: '800' },
  heroMetricLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  heroMetricMeta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  trendInner: { padding: 16, gap: 12 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  trendHeaderCompact: { alignItems: 'stretch' },
  trendHeading: { flex: 1, minWidth: 0, gap: 2 },
  sectionEyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  trendSwitch: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 4,
    borderRadius: 999,
    flexShrink: 1,
    maxWidth: '100%',
    alignSelf: 'flex-start',
  },
  trendSwitchCompact: { width: '100%', alignSelf: 'stretch' },
  trendSwitchPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  trendSwitchPillCompact: { flex: 1, alignItems: 'center' },
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
  metricInnerCompact: { minHeight: 112, padding: 16, justifyContent: 'center', gap: 4 },
  metricValueSmall: { color: colors.text, fontSize: 24, fontWeight: '800' },
  metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  metricMeta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
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
