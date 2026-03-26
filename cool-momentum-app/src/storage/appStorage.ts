import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const STORAGE_KEY = 'momentum-state-v2';

export const defaultState: AppState = {
  todos: [
    {
      id: 'todo-demo-1',
      title: '完成今天最重要的一件事',
      done: false,
      category: 'Focus',
      priority: 'High',
      createdAt: new Date().toISOString(),
      reminder: { enabled: false, time: '09:00' },
    },
    {
      id: 'todo-demo-2',
      title: '把会议纪要整理成行动项',
      done: true,
      category: 'Life',
      priority: 'Medium',
      createdAt: new Date().toISOString(),
      reminder: { enabled: false, time: '09:00' },
    },
  ],
  habits: [
    {
      id: 'habit-demo-1',
      name: '深度工作 60 分钟',
      color: '#7C5CFF',
      category: 'Focus',
      streak: 3,
      completions: [],
      createdAt: new Date().toISOString(),
      reminder: { enabled: false, time: '09:00' },
    },
    {
      id: 'habit-demo-2',
      name: '运动 20 分钟',
      color: '#24C8FF',
      category: 'Health',
      streak: 5,
      completions: [],
      createdAt: new Date().toISOString(),
      reminder: { enabled: false, time: '09:00' },
    },
  ],
};

const normalizeState = (value: AppState): AppState => ({
  todos: value.todos.map((todo) => ({
    ...todo,
    category: todo.category ?? 'Focus',
    priority: todo.priority ?? 'Medium',
    completedAt: todo.completedAt,
    reminder: {
      enabled: todo.reminder?.enabled ?? false,
      time: todo.reminder?.time ?? '09:00',
      notificationId: todo.reminder?.notificationId,
    },
  })),
  habits: value.habits.map((habit) => ({
    ...habit,
    category: habit.category ?? 'Focus',
    reminder: {
      enabled: habit.reminder?.enabled ?? false,
      time: habit.reminder?.time ?? '09:00',
      notificationId: habit.reminder?.notificationId,
      resumeEnabledOnUndo: habit.reminder?.resumeEnabledOnUndo,
    },
  })),
});

export const loadState = async (): Promise<AppState> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    return normalizeState(JSON.parse(raw) as AppState);
  } catch {
    return defaultState;
  }
};

export const saveState = async (state: AppState) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
