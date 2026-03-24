export type Category = 'Focus' | 'Health' | 'Life' | 'Learning';

export type TodoItem = {
  id: string;
  title: string;
  done: boolean;
  category: Category;
  createdAt: string;
};

export type Habit = {
  id: string;
  name: string;
  color: string;
  category: Category;
  streak: number;
  completions: string[];
  createdAt: string;
};

export type AppState = {
  todos: TodoItem[];
  habits: Habit[];
};

export type DraftMode = 'todo' | 'habit';

export const categories: Category[] = ['Focus', 'Health', 'Life', 'Learning'];

export const categoryLabels: Record<Category, string> = {
  Focus: '专注',
  Health: '健康',
  Life: '生活',
  Learning: '学习',
};
