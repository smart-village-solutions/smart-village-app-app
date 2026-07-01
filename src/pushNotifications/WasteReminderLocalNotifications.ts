import * as Notifications from 'expo-notifications';

import { texts } from '../config';
import { WasteTypeData } from '../types';

import {
  buildPendingWasteReminderState,
  getWasteReminderOwnerKey,
  readWasteReminderLocalState,
  removeWasteReminderLocalState,
  WasteReminderLocalState,
  WasteReminderServerSyncPayload,
  writeWasteReminderLocalState
} from './WasteReminderLocalStorage';
import {
  buildWasteReminderSchedule,
  WasteLocationTypeReminderData,
  WasteReminderOccurrence,
  WasteReminderRegistration
} from './WasteReminderScheduler';

const WASTE_REMINDER_COVERAGE_ONE_MONTH_KEY = 'waste-sync:one-month-before';
const WASTE_REMINDER_COVERAGE_ONE_WEEK_KEY = 'waste-sync:one-week-before';

type ScheduleWasteReminderNotificationsParams = {
  hasMoreReminders?: boolean;
  localCoverageUntil?: Date;
  now?: Date;
  reminders: WasteReminderOccurrence[];
  serverSyncPayload: WasteReminderServerSyncPayload;
  serverSyncStatus?: NonNullable<WasteReminderLocalState['serverSyncStatus']>;
  streetName?: string;
  wasteTypesData?: WasteTypeData;
};

export const scheduleWasteReminderNotifications = async ({
  hasMoreReminders = false,
  localCoverageUntil,
  now = new Date(),
  reminders,
  serverSyncPayload,
  serverSyncStatus = 'pending',
  streetName,
  wasteTypesData = {}
}: ScheduleWasteReminderNotificationsParams) => {
  const previousState = await readWasteReminderLocalState();
  const ownerKey = await getWasteReminderOwnerKey();
  const scheduledNotificationIds: string[] = [];
  const scheduledCoverageReminderNotificationIds: string[] = [];

  try {
    for (const reminder of reminders) {
      const notificationId = await scheduleWasteReminderNotification({
        reminder,
        reminderAt: reminder.reminderAt,
        streetName,
        wasteTypesData
      });

      scheduledNotificationIds.push(notificationId);
    }

    for (const reminder of buildCoverageReminderNotifications({
      hasMoreReminders,
      localCoverageUntil,
      now
    })) {
      const notificationId = await scheduleWasteReminderCoverageNotification(reminder);

      scheduledNotificationIds.push(notificationId);
      scheduledCoverageReminderNotificationIds.push(notificationId);
    }
  } catch (error) {
    await Promise.all(
      scheduledNotificationIds.map((notificationId) =>
        Notifications.cancelScheduledNotificationAsync(notificationId)
      )
    );

    throw error;
  }

  await Promise.all(
    (previousState?.scheduledNotificationIds ?? []).map((notificationId) =>
      Notifications.cancelScheduledNotificationAsync(notificationId)
    )
  );

  const nextState = buildPendingWasteReminderState({
    localCoverageUntil,
    ownerKey,
    reminders,
    scheduledCoverageReminderNotificationIds,
    scheduledNotificationIds,
    serverSyncPayload,
    serverSyncStatus
  });

  await writeWasteReminderLocalState(nextState);
  logWasteReminderLocalState(nextState);
  logWasteReminderScheduledIds({ remindersCount: reminders.length, scheduledNotificationIds });
  await logScheduledWasteReminderNotifications();

  return nextState;
};

export const clearWasteReminderLocalNotifications = async () => {
  const localState = await readWasteReminderLocalState();
  const storedNotificationIds = localState?.scheduledNotificationIds ?? [];
  const scheduledWasteNotificationIds = await getScheduledWasteReminderNotificationIds();
  const notificationIds = Array.from(
    new Set([...storedNotificationIds, ...scheduledWasteNotificationIds])
  );

  await Promise.all(
    notificationIds.map((notificationId) =>
      Notifications.cancelScheduledNotificationAsync(notificationId)
    )
  );

  if (!localState) {
    return;
  }

  await writeWasteReminderLocalState({
    ...localState,
    scheduledCoverageReminderNotificationIds: [],
    scheduledNotificationIds: [],
    scheduledReminderKeys: []
  });
};

export const storeWasteReminderSettingsWithoutScheduling = async (
  serverSyncPayload: WasteReminderServerSyncPayload,
  serverSyncStatus: NonNullable<WasteReminderLocalState['serverSyncStatus']> = 'pending'
) => {
  await clearWasteReminderLocalNotifications();

  const ownerKey = await getWasteReminderOwnerKey();
  const nextState: WasteReminderLocalState = {
    ownerKey,
    scheduledCoverageReminderNotificationIds: [],
    scheduledNotificationIds: [],
    scheduledReminderKeys: [],
    serverSyncPayload,
    serverSyncStatus
  };

  await writeWasteReminderLocalState(nextState);
  logWasteReminderLocalState(nextState);
  logWasteReminderScheduledIds({ remindersCount: 0, scheduledNotificationIds: [] });
  await logScheduledWasteReminderNotifications();

  return nextState;
};

export const clearWasteReminderLocalStateForChangedOwner = async () => {
  const localState = await readWasteReminderLocalState();

  if (!localState) {
    return false;
  }

  const ownerKey = await getWasteReminderOwnerKey();

  if (!localState.ownerKey || localState.ownerKey === 'anonymous') {
    await writeWasteReminderLocalState({ ...localState, ownerKey });

    return false;
  }

  if (ownerKey === 'anonymous') {
    return false;
  }

  if (localState.ownerKey === ownerKey) {
    return false;
  }

  await Promise.all(
    localState.scheduledNotificationIds.map((notificationId) =>
      Notifications.cancelScheduledNotificationAsync(notificationId)
    )
  );
  await removeWasteReminderLocalState();

  return true;
};

export const rescheduleWasteReminderNotificationsFromLocalState = async ({
  now = new Date(),
  streetName,
  wasteLocationTypes,
  wasteTypesData = {}
}: {
  now?: Date;
  streetName?: string;
  wasteLocationTypes?: WasteLocationTypeReminderData[];
  wasteTypesData?: WasteTypeData;
}) => {
  const localState = await readWasteReminderLocalState();
  const serverSyncPayload = localState?.serverSyncPayload;

  if (!localState || !serverSyncPayload || !wasteLocationTypes?.length) {
    return;
  }

  const activeReminderRegistrations = buildActiveReminderRegistrations(serverSyncPayload);
  const schedule = buildWasteReminderSchedule({
    activeReminderRegistrations,
    now,
    onDayBefore: serverSyncPayload.onDayBefore,
    reminderTime: buildReminderTimeDate(serverSyncPayload.reminderTime),
    selectedTypeKeys: buildSelectedReminderTypeKeys(serverSyncPayload),
    wasteLocationTypes
  });

  return scheduleWasteReminderNotifications({
    hasMoreReminders: schedule.hasMoreReminders,
    localCoverageUntil: schedule.localCoverageUntil,
    now,
    reminders: schedule.reminders,
    serverSyncPayload,
    serverSyncStatus: localState.serverSyncStatus,
    streetName,
    wasteTypesData
  });
};

const buildActiveReminderRegistrations = ({
  activeReminderRegistrations
}: WasteReminderServerSyncPayload): WasteReminderRegistration[] | undefined =>
  activeReminderRegistrations
    ?.filter((registration) => registration.active)
    .map(({ leadDays, slotId, storeId, time, typeKey }) => ({
      leadDays,
      slotId,
      storeId,
      time,
      typeKey
    }));

const buildSelectedReminderTypeKeys = ({
  notificationSettings,
  usedTypeKeys
}: WasteReminderServerSyncPayload) =>
  usedTypeKeys.filter((typeKey) => !!notificationSettings[typeKey]);

const buildReminderTimeDate = (reminderTime: Date | string) =>
  reminderTime instanceof Date ? reminderTime : new Date(reminderTime);

const scheduleWasteReminderNotification = ({
  reminder,
  reminderAt,
  streetName,
  wasteTypesData
}: {
  reminder: WasteReminderOccurrence;
  reminderAt?: Date;
  streetName?: string;
  wasteTypesData: WasteTypeData;
}) =>
  Notifications.scheduleNotificationAsync({
    content: {
      body: buildReminderBody({ reminder, streetName, wasteTypesData }),
      channelId: 'default',
      data: {
        pickupDates: reminder.pickupDates,
        query_type: 'WasteAddresses',
        reminderKey: reminder.id,
        wasteTypes: reminder.wasteTypes
      },
      title: texts.wasteCalendar.localReminderNotificationTitle
    },
    trigger: {
      date: reminderAt as Date,
      type: Notifications.SchedulableTriggerInputTypes.DATE
    }
  });

type WasteReminderCoverageNotification = {
  id: string;
  reminderAt: Date;
};

const scheduleWasteReminderCoverageNotification = ({
  id,
  reminderAt
}: WasteReminderCoverageNotification) =>
  Notifications.scheduleNotificationAsync({
    content: {
      body: texts.wasteCalendar.localReminderCoverageNotificationBody,
      channelId: 'default',
      data: {
        query_type: 'WasteAddresses',
        reminderKey: id
      },
      title: texts.wasteCalendar.localReminderCoverageNotificationTitle
    },
    trigger: {
      date: reminderAt,
      type: Notifications.SchedulableTriggerInputTypes.DATE
    }
  });

const buildCoverageReminderNotifications = ({
  hasMoreReminders,
  localCoverageUntil,
  now
}: {
  hasMoreReminders: boolean;
  localCoverageUntil?: Date;
  now: Date;
}): WasteReminderCoverageNotification[] => {
  if (!hasMoreReminders || !localCoverageUntil) {
    return [];
  }

  return [
    {
      id: WASTE_REMINDER_COVERAGE_ONE_MONTH_KEY,
      reminderAt: subtractOneMonthClamped(localCoverageUntil)
    },
    {
      id: WASTE_REMINDER_COVERAGE_ONE_WEEK_KEY,
      reminderAt: subtractDays(localCoverageUntil, 7)
    }
  ].filter((reminder) => reminder.reminderAt > now);
};

const subtractOneMonthClamped = (date: Date) => {
  const result = new Date(date);
  const targetMonth = result.getMonth() - 1;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedTargetMonth = (targetMonth + 12) % 12;
  const lastDayOfTargetMonth = new Date(targetYear, normalizedTargetMonth + 1, 0).getDate();

  result.setFullYear(
    targetYear,
    normalizedTargetMonth,
    Math.min(result.getDate(), lastDayOfTargetMonth)
  );

  return result;
};

const subtractDays = (date: Date, days: number) => {
  const result = new Date(date);

  result.setDate(result.getDate() - days);

  return result;
};

const getScheduledWasteReminderNotificationIds = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    return scheduledNotifications
      .filter((notification) => {
        const data = notification.content.data;

        return data?.query_type === 'WasteAddresses' && !!data?.reminderKey;
      })
      .map((notification) => notification.identifier);
  } catch {
    return [];
  }
};

const logWasteReminderLocalState = (state: unknown) => {
  if (!__DEV__) {
    return;
  }

  // eslint-disable-next-line no-console
  console.info('[WasteReminder][local state]', JSON.stringify(state, null, 2));
};

const logWasteReminderScheduledIds = ({
  remindersCount,
  scheduledNotificationIds
}: {
  remindersCount: number;
  scheduledNotificationIds: string[];
}) => {
  if (!__DEV__) {
    return;
  }

  // eslint-disable-next-line no-console
  console.info(
    '[WasteReminder][scheduled ids]',
    JSON.stringify({ remindersCount, scheduledNotificationIds }, null, 2)
  );
};

const logScheduledWasteReminderNotifications = async () => {
  if (!__DEV__) {
    return;
  }

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  // eslint-disable-next-line no-console
  console.info(
    '[WasteReminder][expo scheduled notifications]',
    JSON.stringify(
      scheduledNotifications.map((notification) => ({
        content: notification.content,
        identifier: notification.identifier,
        trigger: notification.trigger
      })),
      null,
      2
    )
  );
};

const buildReminderBody = ({
  reminder,
  streetName,
  wasteTypesData
}: {
  reminder: WasteReminderOccurrence;
  streetName?: string;
  wasteTypesData: WasteTypeData;
}) => {
  const wasteTypeLabels = reminder.wasteTypes.map(
    (wasteType) => wasteTypesData[wasteType]?.label ?? wasteType
  );
  const pickupDate = formatPickupDateForNotification(reminder.pickupDates[0]);
  const locationPrefix = streetName ? `${streetName}: ` : '';

  return `${locationPrefix}Am ${pickupDate} wird ${wasteTypeLabels.join(', ')} abgeholt.`;
};

const formatPickupDateForNotification = (pickupDate: string) => {
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pickupDate);

  if (!isoDateMatch) {
    return pickupDate;
  }

  const [, year, month, day] = isoDateMatch;

  return `${day}.${month}.${year}`;
};
