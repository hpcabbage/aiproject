import { useMemo, useState } from 'react';
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
import { categories, Category, categoryLabels, DraftMode } from './src/types';
import { getFocusMessage, getTopCategory } from './src/utils/insights';

export default function App() {
  const { ready, state, filteredTodos, filteredHabits, selectedCategory, setSelectedCategory, stats, addItem, toggleTodo, deleteTodo, toggleHabit } =
    useMomentumStore();
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [modalVisible, setModalVisible] = useState(false);
  const [draftMode, setDraftMode] = useState<DraftMode>('todo');
  const [draftValue, setDraftValue] = useState('');
  const [draftCategory, setDraftCategory] = useState<Category>('Focus');

  const placeholder = useMemo(
    () => (draftMode === 'todo' ? '比如：把产品首页原型做完' : '比如：晨间复盘 10 分钟'),
    [draftMode],
  );

  const focusMessage = useMemo(() => getFocusMessage(filteredTodos, filteredHabits), [filteredHabits, filteredTodos]);
  const topCategory = useMemo(() => getTopCategory(state.todos, state.habits), [state.habits, state.todos]);
  const categorySummary = useMemo(
    () => ({
      Focus: state.todos.filter((item) => item.category === 'Focus').length + state.habits.filter((item) => item.category === 'Focus').length,
      Health: state.todos.filter((item) => item.category === 'Health').length + state.habits.filter((item) => item.category === 'Health').length,
      Life: state.todos.filter((item) => item.category === 'Life').length + state.habits.filter((item) => item.category === 'Life').length,
      Learning: state.todos.filter((item) => item.category === 'Learning').length + state.habits.filter((item) => item.category === 'Learning').length,
    }),
    [state.habits, state.todos],
  );

  const handleSubmit = () => {
    addItem(draftMode, draftValue, draftCategory);
    setDraftValue('');
    setDraftCategory('Focus');
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
            <TouchableOpacity style={styles.headerAction} onPress={() => setModalVisible(true)}>
              <Ionicons name="sparkles" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          {ready ? (
            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'home' ? (
                <HomeScreen
                  todos={filteredTodos}
                  habits={filteredHabits}
                  completionRate={stats.completionRate}
                  selectedCategory={selectedCategory}
                  categories={['All', ...categories]}
                  focusMessage={focusMessage}
                  topCategory={topCategory}
                  onSelectCategory={setSelectedCategory}
                  onAddPress={() => setModalVisible(true)}
                  onToggleTodo={toggleTodo}
                  onDeleteTodo={deleteTodo}
                  onToggleHabit={toggleHabit}
                />
              ) : (
                <StatsScreen
                  habits={state.habits}
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

        <Modal transparent animationType="slide" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>新增内容</Text>
              <Text style={styles.sheetSubtitle}>这版已经支持分类了，任务和习惯都能放进不同节奏里。</Text>

              <View style={styles.switcher}>
                <Pressable style={[styles.switchPill, draftMode === 'todo' && styles.switchPillActive]} onPress={() => setDraftMode('todo')}>
                  <Text style={[styles.switchText, draftMode === 'todo' && styles.switchTextActive]}>待办</Text>
                </Pressable>
                <Pressable style={[styles.switchPill, draftMode === 'habit' && styles.switchPillActive]} onPress={() => setDraftMode('habit')}>
                  <Text style={[styles.switchText, draftMode === 'habit' && styles.switchTextActive]}>习惯</Text>
                </Pressable>
              </View>

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

              <TextInput
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={draftValue}
                onChangeText={setDraftValue}
                autoFocus
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>加入面板</Text>
              </TouchableOpacity>
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
  submitButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSecondary,
  },
  submitText: { color: '#05101A', fontSize: 16, fontWeight: '800' },
});
