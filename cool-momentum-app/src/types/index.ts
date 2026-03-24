export type TodoItem = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

export type Habit = {
  id: string;
  name: string;
  color: string;
  streak: number;
  completions: string[];
  createdAt: string;
};

export type AppState = {
  todos: TodoItem[];
  habits: Habit[];
};

export type DraftMode = 'todo' | 'habit';
