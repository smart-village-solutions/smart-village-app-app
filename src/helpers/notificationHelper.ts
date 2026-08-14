import type { NotificationResponse } from 'expo-notifications';

type NotificationData = Record<string, unknown>;

export type PushNotificationNavigationData = {
  data: NotificationData;
  id: string | number;
  queryType: string;
  title?: string;
};

const asNotificationData = (value: unknown): NotificationData | undefined => {
  if (!value || Array.isArray(value) || typeof value !== 'object') return;

  return value as NotificationData;
};

const parseNotificationData = (value: unknown): NotificationData | undefined => {
  const data = asNotificationData(value);

  if (data) return data;
  if (typeof value !== 'string') return;

  try {
    return asNotificationData(JSON.parse(value));
  } catch {
    return;
  }
};

/**
 * Normalizes notification data from Expo and direct FCM payloads.
 * Android cold starts can expose the custom payload as a JSON string in `body`,
 * while foreground/background responses usually expose it directly in `data`.
 */
export const getPushNotificationNavigationData = (
  response: NotificationResponse
): PushNotificationNavigationData | undefined => {
  const content = response?.notification?.request?.content;
  const directData = asNotificationData(content?.data) ?? {};
  const nestedData = [
    content?.body,
    directData.body,
    directData.data,
    directData.payload
  ].reduce<NotificationData>(
    (result, value) => ({ ...result, ...(parseNotificationData(value) ?? {}) }),
    {}
  );
  const data = { ...nestedData, ...directData };
  const id = data.id;
  const queryType = data.query_type ?? data.queryType;

  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    String(id).trim().length === 0 ||
    typeof queryType !== 'string' ||
    queryType.trim().length === 0
  ) {
    return;
  }

  return {
    data,
    id,
    queryType,
    title: typeof data.title === 'string' ? data.title : undefined
  };
};

/**
 * Expo types the request identifier as required, but Android intent-based cold starts
 * can omit it. Always return a key so a valid response is never confused with the
 * initial `undefined` handled state.
 */
export const getNotificationResponseKey = (response: NotificationResponse): string => {
  const identifier = response?.notification?.request?.identifier;

  if (typeof identifier === 'string' && identifier.trim().length > 0) {
    return identifier;
  }

  const target = getPushNotificationNavigationData(response);
  const content = response?.notification?.request?.content;

  return JSON.stringify([
    response?.actionIdentifier ?? '',
    target?.queryType ?? '',
    target?.id ?? '',
    response?.notification?.date ?? '',
    content?.title ?? '',
    content?.body ?? ''
  ]);
};
