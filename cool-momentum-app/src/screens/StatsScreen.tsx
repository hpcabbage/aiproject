import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../theme/colors';
import { categoryLabels, Category, Habit } from '../types';
import { getWeekCompletion } from '../utils/date';

type Props = {
  habits: Habit[];
  completionRate: number;
  bestStreak: number;
  totalDone: number;
  topCategory: string;
  categorySummary: Record<Category, number>;
};

export const StatsScreen = ({ habits, completionRate, bestStreak, totalDone, topCategory, categorySummary }: Props) => {
  return (
    <View style={styles.wrapper}>
      <SectionTitle title="统计面板" subtitle="让坚持这件事更有反馈感" />

      <View style={styles.grid}>
        <GlassCard style={styles.metricCard}>
          <View style={styles.metricInner}>
            <Text style={styles.metricValue}>{Math.round(completionRate)}%</Text>
            <Text style={styles.metricLabel}>今日完成率</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.metricCard}>
          <View style={styles.metricInner}>
            <Text style={styles.metricValue}>{bestStreak}</Text>
            <Text style={styles.metricLabel}>最佳连续天数</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.metricCardWide}>
          <View style={styles.metricInner}>
            <Text style={styles.metricValue}>{totalDone}</Text>
            <Text style={styles.metricLabel}>今日总完成项</Text>
          </View>
        </GlassCard>
      </View>

      <GlassCard>
        <View style={styles.summaryInner}>
          <Text style={styles.summaryEyebrow}>当前主线</Text>
          <Text style={styles.summaryTitle}>{topCategory}</Text>
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

      <View style={styles.habitList}>
        {habits.map((habit) => {
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
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { width: '48%' },
  metricCardWide: { width: '100%' },
  metricInner: { minHeight: 120, padding: 18, justifyContent: 'center', gap: 10 },
  metricValue: { color: colors.text, fontSize: 28, fontWeight: '800' },
  metricLabel: { color: colors.textMuted, fontSize: 13 },
  summaryInner: { padding: 18, gap: 12 },
  summaryEyebrow: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  summaryTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
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
  habitList: { gap: 12 },
  habitCard: {},
  habitInner: { padding: 18, gap: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  habitName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  habitMeta: { color: colors.textMuted, marginTop: 6, fontSize: 12 },
  habitDot: { width: 16, height: 16, borderRadius: 999 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekCell: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  weekCellDone: { backgroundColor: colors.success },
});
