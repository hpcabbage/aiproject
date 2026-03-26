import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from './src/screens/HomeScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { useMomentumStore } from './src/hooks/useMomentumStore';
import { colors } from './src/theme/colors';
import { categories, Category, categoryLabels, DraftMode, Habit, Priority, priorities, priorityLabels, Reminder, TodoItem } from './src/types';
import { getFocusMessage, getTopCategory } from './src/utils/insights';
import { getTodayKey } from './src/utils/date';
import {
  cancelReminder,
  configureNotifications,
  isReminderTimeValid,
  normalizeReminderTimeInput,
  requestNotificationPermission,
  scheduleDailyReminder,
} from './src/utils/notifications';

export default function App() {
  const {
    ready,
    state,
    filteredTodos,
    filteredHabits,
    selectedCategory,
    setSelectedCategory,
    stats,
    addItem,
    toggleTodo,
    deleteTodo,
    updateTodo,
    deleteHabit,
    updateHabit,
    toggleHabit,
  } = useMomentumStore();
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [modalVisible, setModalVisible] = useState(false);
  const [draftMode, setDraftMode] = useState<DraftMode>('todo');
  const [draftValue, setDraftValue] = useState('');
  const [draftCategory, setDraftCategory] = useState<Category>('Focus');
  const [draftPriority, setDraftPriority] = useState<Priority>('Medium');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  const placeholder = useMemo(
    () => (draftMode === 'todo' ? '比如：把产品首页原型做完' : '比如：晨间复盘 10 分钟'),
    [draftMode],
  );

  const focusMessage = useMemo(() => getFocusMessage(filteredTodos, filteredHabits), [filteredHabits, filteredTodos]);
  const topCategory = useMemo(() => getTopCategory(state.todos, state.habits), [state.habits, state.todos]);
  const topTodos = useMemo(() => filteredTodos.filter((item) => !item.done).slice(0, 3), [filteredTodos]);
  const editingTodo = useMemo(() => state.todos.find((item) => item.id === editingTodoId) ?? null, [editingTodoId, state.todos]);
  const editingHabit = useMemo(() => state.habits.find((item) => item.id === editingHabitId) ?? null, [editingHabitId, state.habits]);

  useEffect(() => {
    configureNotifications();
  }, []);
  const categorySummary = useMemo(
    () => ({
      Focus: state.todos.filter((item) => item.category === 'Focus').length + state.habits.filter((item) => item.category === 'Focus').length,
      Health: state.todos.filter((item) => item.category === 'Health').length + state.habits.filter((item) => item.category === 'Health').length,
      Life: state.todos.filter((item) => item.category === 'Life').length + state.habits.filter((item) => item.category === 'Life').length,
      Learning: state.todos.filter((item) => item.category === 'Learning').length + state.habits.filter((item) => item.category === 'Learning').length,
    }),
    [state.habits, state.todos],
  );

  const resetComposer = () => {
    setDraftMode('todo');
    setDraftValue('');
    setDraftCategory('Focus');
    setDraftPriority('Medium');
    setEditingTodoId(null);
    setEditingHabitId(null);
    setReminderEnabled(false);
    setReminderTime('09:00');
  };

  const openCreateModal = () => {
    resetComposer();
    setModalVisible(true);
  };

  const startEditTodo = (item: TodoItem) => {
    setDraftMode('todo');
    setDraftValue(item.title);
    setDraftCategory(item.category);
    setDraftPriority(item.priority);
    setReminderEnabled(item.reminder?.enabled ?? false);
    setReminderTime(item.reminder?.time ?? '09:00');
    setEditingTodoId(item.id);
    setEditingHabitId(null);
    setModalVisible(true);
  };

  const startEditHabit = (item: Habit) => {
    setDraftMode('habit');
    setDraftValue(item.name);
    setDraftCategory(item.category);
    setDraftPriority('Medium');
    setReminderEnabled(item.reminder?.enabled ?? false);
    setReminderTime(item.reminder?.time ?? '09:00');
    setEditingTodoId(null);
    setEditingHabitId(item.id);
    setModalVisible(true);
  };

  const syncReminder = async (
    entity: { title: string; reminder?: Reminder },
    nextReminder: Reminder,
    mode: DraftMode,
  ): Promise<Reminder> => {
    await cancelReminder(entity.reminder?.notificationId);

    if (!nextReminder.enabled) {
      return { ...nextReminder, notificationId: undefined };
    }

    if (!isReminderTimeValid(nextReminder.time)) {
      return { ...nextReminder, enabled: false, notificationId: undefined };
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      return { ...nextReminder, enabled: false, notificationId: undefined };
    }

    const notificationId = await scheduleDailyReminder(
      mode === 'todo' ? 'Momentum｜该推进一条待办了' : 'Momentum｜习惯该打卡了',
      mode === 'todo' ? `别让「${entity.title}」继续挂着。` : `今天把「${entity.title}」这条习惯点亮。`,
      nextReminder,
    );

    return { ...nextReminder, notificationId };
  };

  const handleSubmit = async () => {
    const trimmed = draftValue.trim();
    if (!trimmed) {
      return;
    }

    const nextReminder: Reminder = {
      enabled: reminderEnabled,
      time: reminderTime,
    };

    if (editingTodoId && editingTodo) {
      const reminder = await syncReminder({ title: trimmed, reminder: editingTodo.reminder }, nextReminder, 'todo');
      updateTodo(editingTodoId, { title: trimmed, category: draftCategory, priority: draftPriority, reminder });
    } else if (editingHabitId && editingHabit) {
      const reminder = await syncReminder({ title: trimmed, reminder: editingHabit.reminder }, nextReminder, 'habit');
      updateHabit(editingHabitId, { name: trimmed, category: draftCategory, reminder });
    } else {
      const reminder = await syncReminder({ title: trimmed }, nextReminder, draftMode);
      addItem(draftMode, trimmed, draftCategory, draftPriority, reminder);
    }

    resetComposer();
    setModalVisible(false);
  };

  return (
    <LinearGradient colors={['#050816', '#0B1224', '#101935']} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.appShell}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>李子昱给你做的第二版</Text>
              <Text style={styles.headerTitle}>Momentum</Text>
            </View>
            <TouchableOpacity style={styles.headerAction} onPress={openCreateModal}>
              <Ionicons name="sparkles" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          {ready ? (
            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'home' ? (
                <HomeScreen
                  todos={filteredTodos}
                  topTodos={topTodos}
                  habits={filteredHabits}
                  completionRate={stats.completionRate}
                  selectedCategory={selectedCategory}
                  categories={['All', ...categories]}
                  focusMessage={focusMessage}
                  topCategory={topCategory}
                  onSelectCategory={setSelectedCategory}
                  onAddPress={openCreateModal}
                  onToggleTodo={async (id) => {
                    const current = state.todos.find((todo) => todo.id === id);
                    if (current && !current.done && current.reminder?.notificationId) {
                      await cancelReminder(current.reminder.notificationId);
                    }

                    const toggled = toggleTodo(id);

                    if (current?.done && toggled?.reminder?.enabled) {
                      const granted = await requestNotificationPermission();
                      if (granted) {
                        const notificationId = await scheduleDailyReminder(
                          'Momentum｜该推进一条待办了',
                          `别让「${toggled.title}」继续挂着。`,
                          toggled.reminder,
                        );

                        updateTodo(id, {
                          title: toggled.title,
                          category: toggled.category,
                          priority: toggled.priority,
                          reminder: {
                            ...toggled.reminder,
                            notificationId,
                          },
                        });
                      }
                    }
                  }}
                  onDeleteTodo={async (id) => {
                    const item = state.todos.find((todo) => todo.id === id);
                    if (item?.reminder?.notificationId) {
                      await cancelReminder(item.reminder.notificationId);
                    }
                    deleteTodo(id);
                  }}
                  onEditTodo={(id) => {
                    const item = state.todos.find((todo) => todo.id === id);
                    if (item) {
                      startEditTodo(item);
                    }
                  }}
                  onToggleHabit={async (id) => {
                    const habit = state.habits.find((item) => item.id === id);
                    const doneToday = habit?.completions.includes(getTodayKey());
                    if (habit && !doneToday && habit.reminder?.notificationId) {
                      await cancelReminder(habit.reminder.notificationId);
                    }

                    const toggled = toggleHabit(id);

                    if (habit?.completions.includes(getTodayKey()) && toggled?.reminder?.enabled) {
                      const granted = await requestNotificationPermission();
                      if (granted) {
                        const notificationId = await scheduleDailyReminder(
                          'Momentum｜习惯该打卡了',
                          `今天把「${toggled.name}」这条习惯点亮。`,
                          toggled.reminder,
                        );

                        updateHabit(id, {
                          name: toggled.name,
                          category: toggled.category,
                          reminder: {
                            ...toggled.reminder,
                            notificationId,
                          },
                        });
                      }
                    }
                  }}
                  onEditHabit={(id) => {
                    const item = state.habits.find((habit) => habit.id === id);
                    if (item) {
                      startEditHabit(item);
                    }
                  }}
                />
              ) : (
                <StatsScreen
                  habits={state.habits}
                  todos={state.todos}
                  completionRate={stats.completionRate}
                  bestStreak={stats.bestStreak}
                  totalDone={stats.totalDone}
                  topCategory={topCategory}
                  categorySummary={categorySummary}
                />
              )}
            </ScrollView>
          ) : (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>正在加载你的推进面板…</Text>
            </View>
          )}

          <View style={styles.tabBar}>
            <Pressable style={[styles.tab, activeTab === 'home' && styles.tabActive]} onPress={() => setActiveTab('home')}>
              <Ionicons name="grid" size={18} color={activeTab === 'home' ? colors.white : colors.textMuted} />
              <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>主页</Text>
            </Pressable>
            <Pressable style={[styles.tab, activeTab === 'stats' && styles.tabActive]} onPress={() => setActiveTab('stats')}>
              <Ionicons name="bar-chart" size={18} color={activeTab === 'stats' ? colors.white : colors.textMuted} />
              <Text style={[styles.tabLabel, activeTab === 'stats' && styles.tabLabelActive]}>统计</Text>
            </Pressable>
          </View>
        </View>

        <Modal
          transparent
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => {
            resetComposer();
            setModalVisible(false);
          }}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => {
                resetComposer();
                setModalVisible(false);
              }}
            />
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{editingTodo || editingHabit ? '编辑内容' : '新增内容'}</Text>
              <Text style={styles.sheetSubtitle}>
                {editingTodo || editingHabit ? '参考竞品的低摩擦编辑体验，不用删掉重建。' : '这版已经支持分类了，任务和习惯都能放进不同节奏里。'}
              </Text>

              {editingTodo || editingHabit ? null : (
                <View style={styles.switcher}>
                  <Pressable style={[styles.switchPill, draftMode === 'todo' && styles.switchPillActive]} onPress={() => setDraftMode('todo')}>
                    <Text style={[styles.switchText, draftMode === 'todo' && styles.switchTextActive]}>待办</Text>
                  </Pressable>
                  <Pressable style={[styles.switchPill, draftMode === 'habit' && styles.switchPillActive]} onPress={() => setDraftMode('habit')}>
                    <Text style={[styles.switchText, draftMode === 'habit' && styles.switchTextActive]}>习惯</Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.categoryWrap}>
                {categories.map((category) => {
                  const active = category === draftCategory;
                  return (
                    <Pressable key={category} style={[styles.categoryPill, active && styles.categoryPillActive]} onPress={() => setDraftCategory(category)}>
                      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{categoryLabels[category]}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {draftMode === 'todo' ? (
                <View style={styles.priorityWrap}>
                  {priorities.map((priority) => {
                    const active = priority === draftPriority;
                    return (
                      <Pressable
                        key={priority}
                        style={[styles.priorityPill, active && styles.priorityPillActive]}
                        onPress={() => setDraftPriority(priority)}
                      >
                        <Text style={[styles.priorityText, active && styles.priorityTextActive]}>{priorityLabels[priority]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <TextInput
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={draftValue}
                onChangeText={setDraftValue}
                autoFocus
              />

              <View style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View>
                    <Text style={styles.reminderTitle}>每日提醒</Text>
                    <Text style={styles.reminderSubtitle}>学竞品该学的：提醒你行动，但不把界面做复杂。</Text>
                  </View>
                  <Pressable style={[styles.reminderToggle, reminderEnabled && styles.reminderToggleActive]} onPress={() => setReminderEnabled((v) => !v)}>
                    <Text style={[styles.reminderToggleText, reminderEnabled && styles.reminderToggleTextActive]}>
                      {reminderEnabled ? '已开启' : '已关闭'}
                    </Text>
                  </Pressable>
                </View>

                <TextInput
                  placeholder="09:00"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, !reminderEnabled && styles.inputDisabled]}
                  value={reminderTime}
                  onChangeText={(value) => setReminderTime(normalizeReminderTimeInput(value))}
                  editable={reminderEnabled}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />

                {reminderEnabled && !isReminderTimeValid(reminderTime) ? (
                  <Text style={styles.reminderError}>时间格式用 24 小时制，比如 09:00 / 21:30</Text>
                ) : null}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>{editingTodo || editingHabit ? '保存修改' : '加入面板'}</Text>
              </TouchableOpacity>

              {editingTodoId || editingHabitId ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={async () => {
                    if (editingTodoId && editingTodo) {
                      await cancelReminder(editingTodo.reminder?.notificationId);
                      deleteTodo(editingTodoId);
                    }
                    if (editingHabitId && editingHabit) {
                      await cancelReminder(editingHabit.reminder?.notificationId);
                      deleteHabit(editingHabitId);
                    }
                    resetComposer();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>删除这条</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  appShell: { flex: 1, paddingTop: Platform.OS === 'android' ? 14 : 0 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerEyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: { marginTop: 8, color: colors.text, fontSize: 30, fontWeight: '800' },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 92, 255, 0.7)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 120 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, fontSize: 15 },
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(9, 14, 28, 0.96)',
    borderRadius: 22,
    padding: 8,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    borderRadius: 16,
    minHeight: 52,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabActive: { backgroundColor: colors.accent },
  tabLabel: { color: colors.textMuted, fontWeight: '600' },
  tabLabelActive: { color: colors.white },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    gap: 16,
    backgroundColor: '#0D1430',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sheetSubtitle: { color: colors.textMuted, lineHeight: 20 },
  switcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 4,
  },
  switchPill: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  switchPillActive: { backgroundColor: colors.accent },
  switchText: { color: colors.textMuted, fontWeight: '700' },
  switchTextActive: { color: colors.white },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  priorityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: { backgroundColor: colors.accentSecondary },
  categoryText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  categoryTextActive: { color: '#05101A' },
  priorityPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityPillActive: { backgroundColor: 'rgba(255, 184, 92, 0.2)', borderColor: 'rgba(255, 184, 92, 0.45)' },
  priorityText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  priorityTextActive: { color: colors.warning },
  input: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputDisabled: { opacity: 0.45 },
  reminderCard: {
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  reminderTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  reminderSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 12, lineHeight: 18, maxWidth: 220 },
  reminderToggle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderToggleActive: { backgroundColor: 'rgba(49, 208, 170, 0.18)', borderColor: 'rgba(49, 208, 170, 0.3)' },
  reminderToggleText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  reminderToggleTextActive: { color: colors.success },
  reminderError: { color: colors.warning, fontSize: 12, lineHeight: 18 },
  submitButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSecondary,
  },
  submitText: { color: '#05101A', fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 138, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 138, 0.28)',
  },
  secondaryButtonText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
