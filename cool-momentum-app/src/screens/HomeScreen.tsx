import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { ProgressRing } from '../components/ProgressRing';
import { SectionTitle } from '../components/SectionTitle';
import { TodoCard } from '../components/TodoCard';
import { HabitCard } from '../components/HabitCard';
import { colors, gradients } from '../theme/colors';
import { Habit, TodoItem } from '../types';

type Props = {
  todos: TodoItem[];
  habits: Habit[];
  completionRate: number;
  onAddPress: () => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onToggleHabit: (id: string) => void;
};

export const HomeScreen = ({
  todos,
  habits,
  completionRate,
  onAddPress,
  onToggleTodo,
  onDeleteTodo,
  onToggleHabit,
}: Props) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.kicker}>MOMENTUM</Text>
          <Text style={styles.heroTitle}>今天别散，狠狠干完。</Text>
          <Text style={styles.heroSubtitle}>把待办和习惯收进一个很顺手的执行面板里。</Text>
        </View>
        <ProgressRing value={completionRate} />
      </LinearGradient>

      <GlassCard style={styles.quickCard}>
        <View style={styles.quickCardInner}>
          <View>
            <Text style={styles.quickTitle}>开始推进</Text>
            <Text style={styles.quickSubtitle}>新增一个待办，或者埋下一条长期习惯。</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <View style={styles.section}>
        <SectionTitle title="今日待办" subtitle="只保留真正要做的事" />
        <View style={styles.list}>
          {todos.length ? (
            todos.map((item) => (
              <TodoCard key={item.id} item={item} onToggle={() => onToggleTodo(item.id)} onDelete={() => onDeleteTodo(item.id)} />
            ))
          ) : (
            <Text style={styles.emptyText}>现在很干净。加一个任务，给今天一点推进感。</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="习惯打卡" subtitle="小动作，靠连续性变强" />
        <View style={styles.list}>
          {habits.length ? (
            habits.map((habit) => <HabitCard key={habit.id} habit={habit} onToggle={() => onToggleHabit(habit.id)} />)
          ) : (
            <Text style={styles.emptyText}>先种下一条习惯，明天开始就有节奏了。</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  hero: {
    borderRadius: 30,
    padding: 22,
    minHeight: 210,
    justifyContent: 'space-between',
    gap: 18,
  },
  heroTextBlock: {
    gap: 10,
  },
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
  quickCard: {
    marginTop: -6,
  },
  quickCardInner: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
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
  section: {
    gap: 12,
  },
  list: {
    gap: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 12,
  },
});
