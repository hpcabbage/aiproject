import { useEffect, useMemo, useState } from 'react';
import { AppState, Category, DraftMode, categories } from '../types';
import { defaultState, loadState, saveState } from '../storage/appStorage';
import { getTodayKey } from '../utils/date';

const colorPalette = ['#7C5CFF', '#24C8FF', '#31D0AA', '#FFB85C', '#FF6B8A'];

export const useMomentumStore = () => {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      saveState(state);
    }
  }, [ready, state]);

  const todoCompleted = state.todos.filter((item) => item.done).length;
  const habitsCompleted = state.habits.filter((item) => item.completions.includes(getTodayKey())).length;
  const totalTrackable = state.todos.length + state.habits.length;
  const totalDone = todoCompleted + habitsCompleted;
  const completionRate = totalTrackable === 0 ? 0 : (totalDone / totalTrackable) * 100;

  const filteredTodos =
    selectedCategory === 'All' ? state.todos : state.todos.filter((item) => item.category === selectedCategory);
  const filteredHabits =
    selectedCategory === 'All' ? state.habits : state.habits.filter((item) => item.category === selectedCategory);

  const stats = useMemo(
    () => ({
      todoCompleted,
      todoPending: Math.max(state.todos.length - todoCompleted, 0),
      habitsCompleted,
      totalTrackable,
      totalDone,
      completionRate,
      bestStreak: state.habits.reduce((max, habit) => Math.max(max, habit.streak), 0),
      categoryCount: categories.length,
      filteredCount: filteredTodos.length + filteredHabits.length,
    }),
    [completionRate, filteredHabits.length, filteredTodos.length, habitsCompleted, state.habits, state.todos.length, todoCompleted, totalDone, totalTrackable],
  );

  const addItem = (mode: DraftMode, value: string, category: Category) => {
    const title = value.trim();
    if (!title) {
      return;
    }

    if (mode === 'todo') {
      setState((current) => ({
        ...current,
        todos: [
          {
            id: `${Date.now()}`,
            title,
            done: false,
            category,
            createdAt: new Date().toISOString(),
          },
          ...current.todos,
        ],
      }));
      return;
    }

    setState((current) => ({
      ...current,
      habits: [
        {
          id: `${Date.now()}`,
          name: title,
          color: colorPalette[current.habits.length % colorPalette.length],
          category,
          streak: 0,
          completions: [],
          createdAt: new Date().toISOString(),
        },
        ...current.habits,
      ],
    }));
  };

  const toggleTodo = (id: string) => {
    setState((current) => ({
      ...current,
      todos: current.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    }));
  };

  const deleteTodo = (id: string) => {
    setState((current) => ({
      ...current,
      todos: current.todos.filter((todo) => todo.id !== id),
    }));
  };

  const toggleHabit = (id: string) => {
    const today = getTodayKey();

    setState((current) => ({
      ...current,
      habits: current.habits.map((habit) => {
        if (habit.id !== id) {
          return habit;
        }

        const doneToday = habit.completions.includes(today);
        const completions = doneToday
          ? habit.completions.filter((value) => value !== today)
          : [...habit.completions, today];

        return {
          ...habit,
          completions,
          streak: doneToday ? Math.max(0, habit.streak - 1) : habit.streak + 1,
        };
      }),
    }));
  };

  return {
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
    toggleHabit,
  };
};
