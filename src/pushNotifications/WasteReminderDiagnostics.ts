import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

import {
  WasteReminderSchedulingErrorClass,
  WasteReminderSchedulingStatus
} from './WasteReminderLocalStorage';

export type WasteReminderDiagnostic = {
  actualCount?: number;
  androidVersion?: string;
  appVersion?: string;
  errorClass?: WasteReminderSchedulingErrorClass;
  expectedCount: number;
  manufacturer?: string;
  model?: string;
  schedulingStatus: WasteReminderSchedulingStatus;
};

export type WasteReminderOwnerMigrationOutcome = 'deferred-no-token' | 'migrated';
export type WasteReminderMaintenanceSyncOutcome = 'failed-pending' | 'skipped-no-token' | 'synced';

export const buildWasteReminderDiagnostic = ({
  actualCount,
  errorClass,
  expectedCount,
  schedulingStatus
}: Pick<
  WasteReminderDiagnostic,
  'actualCount' | 'errorClass' | 'expectedCount' | 'schedulingStatus'
>): WasteReminderDiagnostic => ({
  ...(actualCount === undefined ? {} : { actualCount }),
  androidVersion: Platform.OS === 'android' ? String(Platform.Version) : undefined,
  appVersion: Application.nativeApplicationVersion ?? undefined,
  ...(errorClass ? { errorClass } : {}),
  expectedCount,
  manufacturer: Device.manufacturer ?? undefined,
  model: Device.modelName ?? undefined,
  schedulingStatus
});

export const reportWasteReminderSchedulingTransition = (
  input: Pick<
    WasteReminderDiagnostic,
    'actualCount' | 'errorClass' | 'expectedCount' | 'schedulingStatus'
  >
) => {
  Sentry.captureMessage('waste_reminder_scheduling', {
    contexts: { wasteReminder: buildWasteReminderDiagnostic(input) },
    level: input.schedulingStatus === 'scheduled' ? 'info' : 'warning'
  });
};

export const reportWasteReminderOwnerMigration = (outcome: WasteReminderOwnerMigrationOutcome) => {
  Sentry.captureMessage('waste_reminder_owner_migration', {
    contexts: { wasteReminder: { outcome } },
    level: outcome === 'migrated' ? 'info' : 'debug'
  });
};

export const reportWasteReminderMaintenanceSync = (
  outcome: WasteReminderMaintenanceSyncOutcome
) => {
  Sentry.captureMessage('waste_reminder_maintenance_sync', {
    contexts: { wasteReminder: { outcome } },
    level: outcome === 'failed-pending' ? 'warning' : 'info'
  });
};

export const classifyWasteReminderError = (
  error: unknown,
  fallback: WasteReminderSchedulingErrorClass
): WasteReminderSchedulingErrorClass => {
  const code =
    typeof error === 'object' && error && 'code' in error ? String(error.code).toLowerCase() : '';

  if (code.includes('permission')) {
    return 'permission-denied';
  }

  return fallback;
};
