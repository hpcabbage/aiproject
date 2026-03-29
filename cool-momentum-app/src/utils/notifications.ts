import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

const REMINDER_CHANNEL_ID = 'momentum-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const configureNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Momentum Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return false;
  }

  await configureNotifications();

  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  if (!granted) {
    const asked = await Notifications.requestPermissionsAsync();
    granted = asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }

  return granted;
};

const parseReminderTime = (time: string) => {
  const matched = time.match(/^(\d{2}):(\d{2})$/);
  if (!matched) {
    return { hour: 9, minute: 0 };
  }

  const hour = Math.min(23, Math.max(0, Number(matched[1])));
  const minute = Math.min(59, Math.max(0, Number(matched[2])));
  return { hour, minute };
};

export const normalizeReminderTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits.length === 2 ? `${digits}:` : digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

export const isReminderTimeValid = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

export const getReminderNextTriggerHint = (time: string) => {
  if (!isReminderTimeValid(time)) {
    return '时间格式正确后，才会开始每日提醒。';
  }

  const { hour, minute } = parseReminderTime(time);
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);

  const isToday = next.getTime() > now.getTime();
  if (!isToday) {
    next.setDate(next.getDate() + 1);
  }

  const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return isToday ? `会在今天 ${label} 开始每日提醒。` : `今天这个时间已经过了，会从明天 ${label} 开始每日提醒。`;
};

export const scheduleDailyReminder = async (title: string, body: string, reminder: Reminder) => {
  if (!reminder.enabled || !isReminderTimeValid(reminder.time)) {
    return undefined;
  }

  const { hour, minute } = parseReminderTime(reminder.time);

  await configureNotifications();

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
};

export const scheduleReminderTestNotification = async (title: string, body: string) => {
  await configureNotifications();

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
};

export const cancelReminder = async (notificationId?: string) => {
  if (!notificationId) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore stale IDs
  }
};
