import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { texts } from '../config';
import { WasteTypeData } from '../types';

import {
  buildPendingWasteReminderState,
  getWasteReminderOwnerKey,
  readWasteReminderLocalState,
  readWasteReminderPendingCancellationIds,
  removeWasteReminderServerStoreIds,
  WasteReminderLocalState,
  WasteReminderSchedulingErrorClass,
  WasteReminderSchedulingState,
  WasteReminderServerSyncPayload,
  writeWasteReminderLocalState,
  writeWasteReminderPendingCancellationIds
} from './WasteReminderLocalStorage';
import {
  buildWasteReminderSchedule,
  WasteLocationTypeReminderData,
  WasteReminderOccurrence,
  WasteReminderRegistration,
  WasteReminderScheduleReason
} from './WasteReminderScheduler';
import {
  classifyWasteReminderError,
  reportWasteReminderOwnerMigration,
  reportWasteReminderSchedulingTransition
} from './WasteReminderDiagnostics';

const WASTE_REMINDER_COVERAGE_ONE_MONTH_KEY = 'waste-sync:one-month-before';
const WASTE_REMINDER_COVERAGE_ONE_WEEK_KEY = 'waste-sync:one-week-before';

type ScheduleWasteReminderNotificationsParams = {
  hasMoreReminders?: boolean;
  localCoverageUntil?: Date;
  now?: Date;
  reminders: WasteReminderOccurrence[];
  scheduleReason?: WasteReminderScheduleReason;
  serverSyncPayload: WasteReminderServerSyncPayload;
  serverSyncStatus?: NonNullable<WasteReminderLocalState['serverSyncStatus']>;
  streetName?: string;
  wasteTypesData?: WasteTypeData;
};

export type WasteReminderSchedulingResult =
  | { actualCount: number; expectedCount: number; status: 'scheduled' }
  | { reason: WasteReminderScheduleReason; status: 'inactive' | 'no-future-reminders' }
  | { status: 'permission-required' }
  | { status: 'waiting-for-data' }
  | { errorClass: WasteReminderSchedulingErrorClass; status: 'failed' };

const getUnavailableSchedulingResult = (
  availability: Extract<Awaited<ReturnType<typeof getSchedulingAvailability>>, { available: false }>
): WasteReminderSchedulingResult => {
  if (availability.status === 'permission-required') {
    return { status: 'permission-required' };
  }

  return { errorClass: availability.errorClass, status: 'failed' };
};

const getSchedulingErrorFallback = (error: unknown): WasteReminderSchedulingErrorClass => {
  if (error instanceof WasteReminderVerificationError) return error.errorClass;
  if (error instanceof WasteReminderStorageError) return 'storage-error';

  return 'native-schedule-error';
};

const scheduleWasteReminderBatch = async ({
  coverageReminders,
  reminders,
  scheduledCoverageReminderNotificationIds,
  scheduledNotificationIds,
  streetName,
  wasteTypesData
}: {
  coverageReminders: ReturnType<typeof buildCoverageReminderNotifications>;
  reminders: WasteReminderOccurrence[];
  scheduledCoverageReminderNotificationIds: string[];
  scheduledNotificationIds: string[];
  streetName?: string;
  wasteTypesData: WasteTypeData;
}) => {
  for (const reminder of reminders) {
    const notificationId = await scheduleWasteReminderNotification({
      reminder,
      reminderAt: reminder.reminderAt,
      streetName,
      wasteTypesData
    });
    scheduledNotificationIds.push(notificationId);
  }

  for (const reminder of coverageReminders) {
    const notificationId = await scheduleWasteReminderCoverageNotification(reminder);
    scheduledNotificationIds.push(notificationId);
    scheduledCoverageReminderNotificationIds.push(notificationId);
  }
};

export const scheduleWasteReminderNotifications = async ({
  hasMoreReminders = false,
  localCoverageUntil,
  now = new Date(),
  reminders,
  scheduleReason = reminders.length ? 'has-reminders' : 'no-active-types',
  serverSyncPayload,
  serverSyncStatus = 'pending',
  streetName,
  wasteTypesData = {}
}: ScheduleWasteReminderNotificationsParams): Promise<WasteReminderSchedulingResult> => {
  const previousState = await readWasteReminderLocalState();
  const ownerKey = await getWasteReminderOwnerKey();
  const scheduledNotificationIds: string[] = [];
  const scheduledCoverageReminderNotificationIds: string[] = [];
  const coverageReminders = buildCoverageReminderNotifications({
    hasMoreReminders,
    localCoverageUntil,
    now
  });
  const expectedCount = reminders.length + coverageReminders.length;

  if (expectedCount === 0) {
    const status = scheduleReason === 'no-active-types' ? 'inactive' : 'no-future-reminders';
    const scheduling = buildSchedulingState({
      expectedCount,
      now,
      reason: scheduleReason,
      status
    });
    await cancelNotificationsBestEffort(previousState?.scheduledNotificationIds ?? []).catch(
      () => undefined
    );
    await writeWasteReminderLocalState(
      buildPendingWasteReminderState({
        localCoverageUntil,
        ownerKey,
        reminders,
        scheduledNotificationIds: [],
        scheduling,
        serverSyncPayload,
        serverSyncStatus
      })
    );

    return { reason: scheduleReason, status };
  }

  try {
    const availability = await getSchedulingAvailability();

    if (!availability.available) {
      const scheduling = buildSchedulingState({
        errorClass: availability.errorClass,
        expectedCount,
        now,
        previousState,
        status: availability.status
      });
      await persistUnsuccessfulReplacement({
        previousState,
        scheduling,
        serverSyncPayload,
        serverSyncStatus
      });
      reportSchedulingTransition(scheduling, previousState?.scheduling);

      return getUnavailableSchedulingResult(availability);
    }

    await scheduleWasteReminderBatch({
      coverageReminders,
      reminders,
      scheduledCoverageReminderNotificationIds,
      scheduledNotificationIds,
      streetName,
      wasteTypesData
    });
    const actualCount = await verifyScheduledWasteReminders(scheduledNotificationIds);
    const scheduling = buildSchedulingState({
      actualCount,
      expectedCount,
      now,
      status: 'scheduled'
    });

    const nextState = buildPendingWasteReminderState({
      localCoverageUntil,
      ownerKey,
      reminders,
      scheduledCoverageReminderNotificationIds,
      scheduledNotificationIds,
      scheduling,
      serverSyncPayload,
      serverSyncStatus
    });

    try {
      await writeWasteReminderLocalState(nextState);
    } catch {
      throw new WasteReminderStorageError();
    }

    await cancelNotificationsBestEffort(
      (previousState?.scheduledNotificationIds ?? []).filter(
        (notificationId) => !scheduledNotificationIds.includes(notificationId)
      )
    ).catch(() => undefined);
    if (previousState?.scheduling) {
      reportSchedulingTransition(scheduling, previousState.scheduling);
    }

    return { actualCount, expectedCount, status: 'scheduled' };
  } catch (error) {
    await cancelNotificationsBestEffort(scheduledNotificationIds).catch(() => undefined);
    const errorClass = classifyWasteReminderError(error, getSchedulingErrorFallback(error));
    const scheduling = buildSchedulingState({
      actualCount: error instanceof WasteReminderVerificationError ? error.actualCount : undefined,
      errorClass,
      expectedCount,
      now,
      previousState,
      status: 'failed'
    });

    await persistUnsuccessfulReplacement({
      previousState,
      scheduling,
      serverSyncPayload,
      serverSyncStatus
    });
    reportSchedulingTransition(scheduling, previousState?.scheduling);

    return { errorClass, status: 'failed' };
  }
};

class WasteReminderVerificationError extends Error {
  actualCount?: number;
  errorClass: WasteReminderSchedulingErrorClass;

  constructor(errorClass: WasteReminderSchedulingErrorClass, actualCount?: number) {
    super(errorClass);
    this.actualCount = actualCount;
    this.errorClass = errorClass;
  }
}

class WasteReminderStorageError extends Error {}

const verifyScheduledWasteReminders = async (expectedIds: string[]) => {
  let scheduledNotifications: Notifications.NotificationRequest[];

  try {
    scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    throw new WasteReminderVerificationError('native-verification-error');
  }

  const registeredIds = new Set(
    scheduledNotifications
      .filter(
        ({ content, identifier }) =>
          expectedIds.includes(identifier) &&
          content.data?.query_type === 'WasteAddresses' &&
          !!content.data?.reminderKey
      )
      .map(({ identifier }) => identifier)
  );

  if (registeredIds.size !== expectedIds.length) {
    throw new WasteReminderVerificationError('native-verification-mismatch', registeredIds.size);
  }

  return registeredIds.size;
};

const getSchedulingAvailability = async (): Promise<
  | { available: true }
  | {
      available: false;
      errorClass: 'channel-unavailable' | 'permission-denied';
      status: 'failed' | 'permission-required';
    }
> => {
  const permission = await Notifications.getPermissionsAsync();

  if (
    !permission.granted &&
    permission.status !== 'granted' &&
    permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return {
      available: false,
      errorClass: 'permission-denied',
      status: 'permission-required'
    };
  }

  if (Platform.OS === 'android') {
    const channel = await Notifications.getNotificationChannelAsync('default');

    if (!channel || channel.importance === Notifications.AndroidImportance.NONE) {
      return {
        available: false,
        errorClass: 'channel-unavailable',
        status: 'failed'
      };
    }
  }

  return { available: true };
};

const RETRY_DELAYS_MS = [60_000, 300_000, 1_800_000, 21_600_000];

const buildSchedulingState = ({
  actualCount,
  errorClass,
  expectedCount,
  now,
  previousState,
  reason,
  status
}: {
  actualCount?: number;
  errorClass?: WasteReminderSchedulingErrorClass;
  expectedCount: number;
  now: Date;
  previousState?: WasteReminderLocalState;
  reason?: WasteReminderScheduleReason;
  status: WasteReminderSchedulingState['status'];
}): WasteReminderSchedulingState => {
  const attemptCount =
    status === 'failed' || status === 'permission-required'
      ? (previousState?.scheduling?.attemptCount ?? 0) + 1
      : 0;
  const retryDelay = RETRY_DELAYS_MS[Math.min(Math.max(attemptCount - 1, 0), 3)];

  return {
    ...(actualCount === undefined ? {} : { actualCount }),
    attemptCount,
    ...(errorClass ? { errorClass } : {}),
    expectedCount,
    lastAttemptAt: now.toISOString(),
    ...(retryDelay && attemptCount
      ? { nextRetryAt: new Date(now.getTime() + retryDelay).toISOString() }
      : {}),
    ...(reason ? { reason } : {}),
    status
  };
};

const persistUnsuccessfulReplacement = async ({
  previousState,
  scheduling,
  serverSyncPayload,
  serverSyncStatus
}: {
  previousState?: WasteReminderLocalState;
  scheduling: WasteReminderSchedulingState;
  serverSyncPayload: WasteReminderServerSyncPayload;
  serverSyncStatus: NonNullable<WasteReminderLocalState['serverSyncStatus']>;
}) => {
  const ownerKey = await getWasteReminderOwnerKey();

  try {
    await writeWasteReminderLocalState({
      ownerKey,
      scheduledCoverageReminderNotificationIds:
        previousState?.scheduledCoverageReminderNotificationIds ?? [],
      scheduledNotificationIds: previousState?.scheduledNotificationIds ?? [],
      scheduledReminderKeys: previousState?.scheduledReminderKeys ?? [],
      scheduling,
      serverSyncPayload,
      serverSyncStatus
    });
  } catch (error) {
    reportWasteReminderSchedulingTransition({
      actualCount: scheduling.actualCount,
      errorClass: 'storage-error',
      expectedCount: scheduling.expectedCount,
      schedulingStatus: 'failed'
    });
    throw error;
  }
};

let cancellationMaintenanceQueue: Promise<string[]> = Promise.resolve([]);

const cancelNotificationsBestEffort = (notificationIds: string[]) => {
  cancellationMaintenanceQueue = cancellationMaintenanceQueue
    .catch(() => [])
    .then(async () => {
      const pendingCancellationIds = await readWasteReminderPendingCancellationIds();
      const idsToCancel = Array.from(new Set([...pendingCancellationIds, ...notificationIds]));
      const results = await Promise.allSettled(
        idsToCancel.map((notificationId) =>
          Notifications.cancelScheduledNotificationAsync(notificationId)
        )
      );
      const failedCancellationIds = idsToCancel.filter(
        (_, index) => results[index].status === 'rejected'
      );

      await writeWasteReminderPendingCancellationIds(failedCancellationIds);

      return failedCancellationIds;
    });

  return cancellationMaintenanceQueue;
};

export const retryPendingWasteReminderNotificationCancellations = () =>
  cancelNotificationsBestEffort([]);

const reportSchedulingTransition = (
  scheduling: WasteReminderSchedulingState,
  previousScheduling?: WasteReminderSchedulingState
) => {
  if (
    previousScheduling?.status === scheduling.status &&
    previousScheduling.errorClass === scheduling.errorClass
  ) {
    return;
  }

  reportWasteReminderSchedulingTransition({
    actualCount: scheduling.actualCount,
    errorClass: scheduling.errorClass,
    expectedCount: scheduling.expectedCount,
    schedulingStatus: scheduling.status
  });
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

export type WasteReminderOwnerMigrationResult = 'unchanged' | 'migrated' | 'deferred-no-token';

export const migrateWasteReminderLocalStateToCurrentOwner =
  async (): Promise<WasteReminderOwnerMigrationResult> => {
    const localState = await readWasteReminderLocalState();

    if (!localState) {
      reportWasteReminderOwnerMigration('unchanged');
      return 'unchanged' as const;
    }

    const ownerKey = await getWasteReminderOwnerKey();

    if (ownerKey === 'anonymous') {
      reportWasteReminderOwnerMigration('deferred-no-token');
      return 'deferred-no-token' as const;
    }

    if (localState.ownerKey === ownerKey) {
      reportWasteReminderOwnerMigration('unchanged');
      return 'unchanged' as const;
    }

    await writeWasteReminderLocalState({
      ...localState,
      ownerKey,
      ...(localState.serverSyncPayload
        ? { serverSyncPayload: removeWasteReminderServerStoreIds(localState.serverSyncPayload) }
        : {}),
      serverSyncStatus: 'pending'
    });
    reportWasteReminderOwnerMigration('migrated');

    return 'migrated' as const;
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

  if (!localState || !serverSyncPayload) {
    return { status: 'waiting-for-data' } as const;
  }

  if (!wasteLocationTypes) {
    await writeWasteReminderLocalState({
      ...localState,
      scheduling: buildSchedulingState({
        expectedCount: 0,
        now,
        reason: 'no-pickup-dates',
        status: 'waiting-for-data'
      })
    });

    return { status: 'waiting-for-data' } as const;
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
    scheduleReason: schedule.reason,
    serverSyncPayload,
    serverSyncStatus: localState.serverSyncStatus,
    streetName,
    wasteTypesData
  });
};

const WASTE_REMINDER_FOREGROUND_VERIFICATION_INTERVAL_MS = 6 * 60 * 60 * 1000;

export const verifyWasteReminderNotificationsFromLocalState = async ({
  force = false,
  now = new Date()
}: {
  force?: boolean;
  now?: Date;
} = {}) => {
  const localState = await readWasteReminderLocalState();

  if (!localState?.serverSyncPayload || localState.scheduling?.status !== 'scheduled') {
    return { checked: false, status: localState?.scheduling?.status } as const;
  }

  try {
    const availability = await getSchedulingAvailability();
    if (!availability.available) {
      const scheduling = buildSchedulingState({
        errorClass: availability.errorClass,
        expectedCount: localState.scheduledNotificationIds.length,
        now,
        previousState: localState,
        status: availability.status
      });
      await writeWasteReminderLocalState({ ...localState, scheduling });
      reportSchedulingTransition(scheduling, localState.scheduling);

      return { checked: true, status: availability.status } as const;
    }

    const lastVerificationAt = new Date(localState.scheduling.lastAttemptAt).getTime();
    if (
      !force &&
      Number.isFinite(lastVerificationAt) &&
      now.getTime() - lastVerificationAt < WASTE_REMINDER_FOREGROUND_VERIFICATION_INTERVAL_MS
    ) {
      return { checked: false, status: 'scheduled' } as const;
    }

    const actualCount = await verifyScheduledWasteReminders(localState.scheduledNotificationIds);
    const scheduling = buildSchedulingState({
      actualCount,
      expectedCount: localState.scheduledNotificationIds.length,
      now,
      status: 'scheduled'
    });
    await writeWasteReminderLocalState({ ...localState, scheduling });

    return { checked: true, status: 'scheduled' } as const;
  } catch (error) {
    const errorClass =
      error instanceof WasteReminderVerificationError
        ? error.errorClass
        : 'native-verification-error';
    const scheduling = buildSchedulingState({
      actualCount: error instanceof WasteReminderVerificationError ? error.actualCount : undefined,
      errorClass,
      expectedCount: localState.scheduledNotificationIds.length,
      now,
      previousState: localState,
      status: 'failed'
    });
    await writeWasteReminderLocalState({ ...localState, scheduling });
    reportSchedulingTransition(scheduling, localState.scheduling);

    return { checked: true, errorClass, status: 'failed' } as const;
  }
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

export const getScheduledWasteReminderNotificationCount = async () =>
  (await getScheduledWasteReminderNotificationIds()).length;

const logWasteReminderLocalState = (state: WasteReminderLocalState) => {
  if (!__DEV__) {
    return;
  }

  // eslint-disable-next-line no-console
  console.info('[WasteReminder][local state]', {
    activeRegistrationCount: state.serverSyncPayload?.activeReminderRegistrations?.length ?? 0,
    activeTypeCount: Object.values(state.serverSyncPayload?.activeTypes ?? {}).filter(
      ({ active }) => active
    ).length,
    scheduledCoverageReminderCount: state.scheduledCoverageReminderNotificationIds?.length ?? 0,
    scheduledReminderCount: state.scheduledNotificationIds.length,
    schedulingStatus: state.scheduling?.status,
    serverSyncStatus: state.serverSyncStatus
  });
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
  console.info('[WasteReminder][scheduled inventory]', {
    expectedCount: remindersCount,
    scheduledCount: scheduledNotificationIds.length
  });
};

const logScheduledWasteReminderNotifications = async () => {
  if (!__DEV__) {
    return;
  }

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  // eslint-disable-next-line no-console
  console.info('[WasteReminder][expo scheduled inventory]', {
    scheduledCount: scheduledNotifications.length
  });
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
