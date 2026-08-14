import type { NotificationResponse } from 'expo-notifications';

import {
  getNotificationResponseKey,
  getPushNotificationNavigationData
} from '../../src/helpers/notificationHelper';

const createResponse = (
  options: {
    body?: string | null;
    data?: Record<string, unknown>;
    date?: number;
    identifier?: string | undefined;
  } = {}
) => {
  const { body = null, data = {}, date = 1_700_000_000 } = options;
  const identifier = Object.prototype.hasOwnProperty.call(options, 'identifier')
    ? options.identifier
    : 'notification-id';

  return {
    actionIdentifier: 'expo.modules.notifications.actions.DEFAULT',
    notification: {
      date,
      request: {
        content: { body, data, title: 'Test notification' },
        identifier
      }
    }
  } as NotificationResponse;
};

describe('getPushNotificationNavigationData', () => {
  it('reads the regular Expo notification data shape', () => {
    const response = createResponse({
      data: { id: 42, query_type: 'NewsItem', title: 'Augsburg News' }
    });

    expect(getPushNotificationNavigationData(response)).toEqual({
      data: { id: 42, query_type: 'NewsItem', title: 'Augsburg News' },
      id: 42,
      queryType: 'NewsItem',
      title: 'Augsburg News'
    });
  });

  it('parses the JSON body exposed by an Android cold-start intent', () => {
    const response = createResponse({
      body: JSON.stringify({ id: 'news-7', query_type: 'NewsItem', title: 'Cold start' })
    });

    expect(getPushNotificationNavigationData(response)).toEqual({
      data: { id: 'news-7', query_type: 'NewsItem', title: 'Cold start' },
      id: 'news-7',
      queryType: 'NewsItem',
      title: 'Cold start'
    });
  });

  it('parses a JSON body nested in direct FCM data', () => {
    const response = createResponse({
      data: { body: JSON.stringify({ id: 'news-8', queryType: 'NewsItem' }) }
    });

    expect(getPushNotificationNavigationData(response)).toMatchObject({
      id: 'news-8',
      queryType: 'NewsItem'
    });
  });

  it('rejects payloads without a destination', () => {
    expect(
      getPushNotificationNavigationData(createResponse({ data: { query_type: 'NewsItem' } }))
    ).toBeUndefined();
  });
});

describe('getNotificationResponseKey', () => {
  it('uses the native identifier when it exists', () => {
    expect(getNotificationResponseKey(createResponse())).toBe('notification-id');
  });

  it('creates a stable fallback when Android omits the native identifier', () => {
    const response = createResponse({
      data: { id: 'news-9', query_type: 'NewsItem' },
      identifier: undefined
    });

    const key = getNotificationResponseKey(response);

    expect(key).toContain('NewsItem');
    expect(key).toContain('news-9');
    expect(key).toBe(getNotificationResponseKey(response));
  });
});
