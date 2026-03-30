import { categoryLabels, Habit, TodoItem } from '../types';
import { getTodayKey } from './date';

export const getFocusMessage = (todos: TodoItem[], habits: Habit[]) => {
  const pending = todos.filter((item) => !item.done);
  const doneHabits = habits.filter((habit) => habit.completions.includes(getTodayKey()));

  if (pending.length === 0 && doneHabits.length === habits.length && habits.length > 0) {
    return '今天收得很漂亮，已经是稳态输出了。';
  }

  if (pending.length === 0) {
    return '待办已经清空，可以把精力切去长期习惯。';
  }

  if (habits.length === 0) {
    return '待办已经排上了，再补一条习惯，今天的节奏会更完整。';
  }

  const focusTodo = pending[0];
  return `先狠狠干掉「${focusTodo.title}」，这是你现在最该推进的一项。`;
};

export const getTopCategory = (todos: TodoItem[], habits: Habit[]) => {
  const counter = new Map<string, number>();

  [...todos, ...habits].forEach((item) => {
    const category = item.category;
    counter.set(category, (counter.get(category) ?? 0) + 1);
  });

  const top = [...counter.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) {
    return '还没形成明显节奏';
  }

  const topCategoryLabel = categoryLabels[top[0] as keyof typeof categoryLabels] ?? top[0];
  return `${topCategoryLabel}强度最高`;
};
