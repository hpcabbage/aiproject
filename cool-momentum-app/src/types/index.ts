export type Category = 'Focus' | 'Health' | 'Life' | 'Learning';

export type Priority = 'High' | 'Medium' | 'Low';

export type Reminder = {
  enabled: boolean;
  time: string;
  notificationId?: string;
  resumeEnabledOnUndo?: boolean;
};

export type TodoItem = {
  id: string;
  title: string;
  done: boolean;
  category: Category;
  priority: Priority;
  createdAt: string;
  completedAt?: string;
  reminder?: Reminder;
};

export type Habit = {
  id: string;
  name: string;
  color: string;
  category: Category;
  streak: number;
  completions: string[];
  createdAt: string;
  reminder?: Reminder;
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

export const priorities: Priority[] = ['High', 'Medium', 'Low'];

export const priorityLabels: Record<Priority, string> = {
  High: '高优先级',
  Medium: '中优先级',
  Low: '低优先级',
};
