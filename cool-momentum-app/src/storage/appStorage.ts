import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const STORAGE_KEY = 'momentum-state-v1';

export const defaultState: AppState = {
  todos: [
    {
      id: 'todo-demo-1',
      title: '完成今天最重要的一件事',
      done: false,
      createdAt: new Date().toISOString(),
    },
  ],
  habits: [
    {
      id: 'habit-demo-1',
      name: '深度工作 60 分钟',
      color: '#7C5CFF',
      streak: 3,
      completions: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-demo-2',
      name: '运动 20 分钟',
      color: '#24C8FF',
      streak: 5,
      completions: [],
      createdAt: new Date().toISOString(),
    },
  ],
};

export const loadState = async (): Promise<AppState> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultState;
  }
};

export const saveState = async (state: AppState) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
