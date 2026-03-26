const pad = (value: number) => `${value}`.padStart(2, '0');

export const toLocalDateKey = (value: Date | string = new Date()) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getTodayKey = () => toLocalDateKey();

export const toDateKey = (value: Date | string) => toLocalDateKey(value);

export const formatShortDate = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getWeekCompletion = (days: string[]) => {
  const today = new Date();
  const keys = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    return toDateKey(date);
  });

  return keys.reverse().map((key) => days.includes(key));
};

export const getRecentDateKeys = (length: number) => {
  const today = new Date();
  return Array.from({ length }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (length - 1 - index));
    return toDateKey(date);
  });
};

export const getDateLabel = (value: string, mode: 'week' | 'month') => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('zh-CN', mode === 'week' ? { weekday: 'short' } : { month: 'numeric', day: 'numeric' }).format(date);
};
