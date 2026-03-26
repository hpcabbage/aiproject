import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

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
    await Notifications.setNotificationChannelAsync('momentum-reminders', {
      name: 'Momentum Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};

export const requestNotificationPermission = async () => {
  if (!Device.isDevice) {
    return false;
  }

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
  const cleaned = value.replace(/[^\d:]/g, '').slice(0, 5);
  if (cleaned.length === 2 && !cleaned.includes(':')) {
    return `${cleaned}:`;
  }

  return cleaned;
};

export const isReminderTimeValid = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

export const scheduleDailyReminder = async (title: string, body: string, reminder: Reminder) => {
  if (!reminder.enabled || !isReminderTimeValid(reminder.time)) {
    return undefined;
  }

  const { hour, minute } = parseReminderTime(reminder.time);

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
      channelId: 'momentum-reminders',
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
