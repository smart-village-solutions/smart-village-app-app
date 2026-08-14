import * as Notifications from 'expo-notifications';
import PropTypes from 'prop-types';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { usePushNotifications } from '../../src/hooks/PushNotification';

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  clearLastNotificationResponse: jest.fn(),
  setNotificationHandler: jest.fn(),
  useLastNotificationResponse: jest.fn()
}));

jest.mock('../../src/helpers', () => ({ readFromStore: jest.fn() }));
jest.mock('../../src/pushNotifications', () => ({
  PushNotificationStorageKeys: { IN_APP_PERMISSION: 'IN_APP_PERMISSION' },
  getPushTokenFromStorage: jest.fn(),
  updatePushToken: jest.fn()
}));

const coldStartResponse = {
  actionIdentifier: 'expo.modules.notifications.actions.DEFAULT',
  notification: {
    date: 1_700_000_000,
    request: {
      content: {
        body: 'Test',
        data: { id: 'news-10', query_type: 'NewsItem' },
        title: 'Augsburg News'
      },
      identifier: undefined
    }
  }
};

const TestComponent = ({ handler }) => {
  // Response handling intentionally remains active for already delivered notifications,
  // even if remote push registration is disabled.
  usePushNotifications(undefined, handler, undefined, false);

  return null;
};

TestComponent.propTypes = {
  handler: PropTypes.func.isRequired
};

describe('usePushNotifications response handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Notifications.useLastNotificationResponse.mockReturnValue(coldStartResponse);
  });

  it('handles and clears an Android cold-start response without an identifier', async () => {
    const handler = jest.fn(() => true);

    await act(async () => {
      renderer.create(<TestComponent handler={handler} />);
    });

    expect(handler).toHaveBeenCalledWith(coldStartResponse);
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  it('does not handle the same fallback response twice', async () => {
    const handler = jest.fn(() => true);
    let component;

    await act(async () => {
      component = renderer.create(<TestComponent handler={handler} />);
    });

    Notifications.useLastNotificationResponse.mockReturnValue({
      ...coldStartResponse,
      notification: { ...coldStartResponse.notification }
    });

    await act(async () => {
      component.update(<TestComponent handler={handler} />);
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  it('keeps the response available when navigation throws', async () => {
    const handler = jest.fn(() => {
      throw new Error('Navigation is not ready');
    });
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await act(async () => {
      renderer.create(<TestComponent handler={handler} />);
    });

    expect(Notifications.clearLastNotificationResponse).not.toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });

  it('keeps the response retryable when clearing native state fails', async () => {
    const handler = jest.fn(() => true);
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    Notifications.clearLastNotificationResponse.mockImplementationOnce(() => {
      throw new Error('Native state could not be cleared');
    });

    await act(async () => {
      renderer.create(<TestComponent handler={handler} />);
    });

    await act(async () => {
      renderer.create(<TestComponent handler={handler} />);
    });

    expect(handler).toHaveBeenCalledTimes(2);
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(2);

    consoleWarn.mockRestore();
  });
});
