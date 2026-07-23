import React from 'react';
import * as Notifications from 'expo-notifications';
import PropTypes from 'prop-types';
import renderer, { act } from 'react-test-renderer';

import { usePushNotifications } from '../../src/hooks/PushNotification';

const mockNotificationResponseSubscription = { remove: jest.fn() };
let mockNotificationResponseListener;

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn((listener) => {
    mockNotificationResponseListener = listener;
    return mockNotificationResponseSubscription;
  }),
  getLastNotificationResponse: jest.fn(() => null),
  setNotificationHandler: jest.fn()
}));

jest.mock('../../src/helpers', () => ({
  readFromStore: jest.fn()
}));

jest.mock('../../src/pushNotifications', () => ({
  PushNotificationStorageKeys: { IN_APP_PERMISSION: 'IN_APP_PERMISSION' },
  getPushTokenFromStorage: jest.fn(),
  updatePushToken: jest.fn()
}));

const TestPushNotifications = ({ active, onInteraction }) => {
  usePushNotifications(undefined, onInteraction, undefined, active);

  return null;
};

TestPushNotifications.propTypes = {
  active: PropTypes.bool.isRequired,
  onInteraction: PropTypes.func.isRequired
};

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationResponseListener = undefined;
  });

  it('keeps foreground notifications visible by default when no custom behavior is provided', async () => {
    act(() => {
      renderer.create(<TestPushNotifications active={true} onInteraction={jest.fn()} />);
    });

    expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1);

    const handlerConfig = Notifications.setNotificationHandler.mock.calls[0][0];
    const behavior = await handlerConfig.handleNotification();

    expect(behavior.shouldShowAlert).toBe(true);
  });

  it('keeps notification tap handling active when push handling is disabled', () => {
    const onInteraction = jest.fn();

    act(() => {
      renderer.create(<TestPushNotifications active={false} onInteraction={onInteraction} />);
    });

    expect(Notifications.setNotificationHandler).not.toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);

    const response = {
      notification: {
        request: {
          identifier: 'waste-reminder-notification',
          content: { data: { query_type: 'WasteAddresses' } }
        }
      }
    };

    act(() => {
      mockNotificationResponseListener(response);
    });

    expect(onInteraction).toHaveBeenCalledWith(response);
  });
});
