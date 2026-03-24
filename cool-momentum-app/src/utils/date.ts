export const getTodayKey = () => new Date().toISOString().slice(0, 10);

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
    return date.toISOString().slice(0, 10);
  });

  return keys.reverse().map((key) => days.includes(key));
};
