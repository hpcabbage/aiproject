import { useEffect, useMemo, useState } from 'react';
import { AppState, Category, DraftMode, Priority, Reminder, categories } from '../types';
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

  const priorityWeight: Record<Priority, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
  };

  const sortedTodos = [...state.todos].sort((a, b) => {
    if (a.done !== b.done) {
      return Number(a.done) - Number(b.done);
    }

    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredTodos =
    selectedCategory === 'All' ? sortedTodos : sortedTodos.filter((item) => item.category === selectedCategory);
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

  const addItem = (mode: DraftMode, value: string, category: Category, priority: Priority = 'Medium', reminder?: Reminder) => {
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
            priority,
            createdAt: new Date().toISOString(),
            reminder: reminder ?? { enabled: false, time: '09:00' },
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
          reminder: reminder ?? { enabled: false, time: '09:00' },
        },
        ...current.habits,
      ],
    }));
  };

  const toggleTodo = (id: string): AppState['todos'][number] | null => {
    let toggledTodo: AppState['todos'][number] | null = null;

    setState((current) => ({
      ...current,
      todos: current.todos.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }

        const nextDone = !todo.done;
        const previousReminder = todo.reminder ?? { enabled: false, time: '09:00' };

        toggledTodo = {
          ...todo,
          done: nextDone,
          completedAt: nextDone ? new Date().toISOString() : undefined,
          reminder: nextDone
            ? {
                ...previousReminder,
                enabled: false,
                notificationId: undefined,
                resumeEnabledOnUndo: previousReminder.enabled,
              }
            : {
                ...previousReminder,
                enabled: previousReminder.resumeEnabledOnUndo ?? previousReminder.enabled,
                notificationId: undefined,
                resumeEnabledOnUndo: undefined,
              },
        };

        return toggledTodo;
      }),
    }));

    return toggledTodo;
  };

  const deleteTodo = (id: string) => {
    setState((current) => ({
      ...current,
      todos: current.todos.filter((todo) => todo.id !== id),
    }));
  };

  const updateTodo = (id: string, payload: { title: string; category: Category; priority: Priority; reminder?: Reminder }) => {
    const title = payload.title.trim();
    if (!title) {
      return;
    }

    setState((current) => ({
      ...current,
      todos: current.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title,
              category: payload.category,
              priority: payload.priority,
              reminder: payload.reminder ?? todo.reminder ?? { enabled: false, time: '09:00' },
            }
          : todo,
      ),
    }));
  };

  const deleteHabit = (id: string) => {
    setState((current) => ({
      ...current,
      habits: current.habits.filter((habit) => habit.id !== id),
    }));
  };

  const updateHabit = (id: string, payload: { name: string; category: Category; reminder?: Reminder }) => {
    const name = payload.name.trim();
    if (!name) {
      return;
    }

    setState((current) => ({
      ...current,
      habits: current.habits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              name,
              category: payload.category,
              reminder: payload.reminder ?? habit.reminder ?? { enabled: false, time: '09:00' },
            }
          : habit,
      ),
    }));
  };

  const toggleHabit = (id: string): AppState['habits'][number] | null => {
    const today = getTodayKey();
    let toggledHabit: AppState['habits'][number] | null = null;

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
        const previousReminder = habit.reminder ?? { enabled: false, time: '09:00' };

        toggledHabit = {
          ...habit,
          completions,
          streak: doneToday ? Math.max(0, habit.streak - 1) : habit.streak + 1,
          reminder: doneToday
            ? {
                ...previousReminder,
                enabled: previousReminder.resumeEnabledOnUndo ?? previousReminder.enabled,
                notificationId: undefined,
                resumeEnabledOnUndo: undefined,
              }
            : {
                ...previousReminder,
                enabled: false,
                notificationId: undefined,
                resumeEnabledOnUndo: previousReminder.enabled,
              },
        };

        return toggledHabit;
      }),
    }));

    return toggledHabit;
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
    updateTodo,
    deleteHabit,
    updateHabit,
    toggleHabit,
  };
};
