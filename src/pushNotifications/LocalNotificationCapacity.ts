import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { isEventReminderNotification } from '../helpers/notificationHelper';

// Leave headroom below the iOS pending-notification limit while device behavior is validated.
export const IOS_LOCAL_NOTIFICATION_BUDGET = 60;
let updateQueue: Promise<void> = Promise.resolve();
let restoreEventReminders: (() => void) | undefined;

export const runLocalNotificationUpdate = <T>(update: () => Promise<T>): Promise<T> => {
  const result = updateQueue.then(update);
  updateQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
};

export const registerEventReminderRestoration = (restore: () => void) => {
  restoreEventReminders = restore;
  return () => {
    if (restoreEventReminders === restore) restoreEventReminders = undefined;
  };
};

export const runWasteNotificationUpdate = <T>(update: () => Promise<T>) =>
  runLocalNotificationUpdate(async () => {
    try {
      return await update();
    } finally {
      restoreEventReminders?.();
    }
  });

export const releaseEventSlotsForWaste = async (countToAdd: number) => {
  if (!restoreEventReminders || Platform.OS !== 'ios') return;

  const inventory = await Notifications.getAllScheduledNotificationsAsync();
  const slotsNeeded = inventory.length + countToAdd - IOS_LOCAL_NOTIFICATION_BUDGET;
  if (slotsNeeded <= 0) return;

  const eventReminders = inventory
    .filter(({ content }) => isEventReminderNotification(content.data))
    .sort(
      (left, right) =>
        Number(right.content.data?.reminderAt) - Number(left.content.data?.reminderAt)
    );

  // Waste scheduling still handles native capacity independently of the outcome of event cleanup.
  await Promise.allSettled(
    eventReminders
      .slice(0, slotsNeeded)
      .map(({ identifier }) => Notifications.cancelScheduledNotificationAsync(identifier))
  );
};
