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
