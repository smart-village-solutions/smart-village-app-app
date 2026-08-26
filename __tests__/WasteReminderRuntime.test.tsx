import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { WasteReminderRuntime } from '../src/WasteReminderRuntime';
import { getNotificationNavigationTarget } from '../src/helpers';
import { navigateToNotificationTarget } from '../src/helpers/notificationNavigationHelper';
import { usePushNotifications, useWasteReminderSync } from '../src/hooks';
import { SettingsContext, initialContext } from '../src/SettingsProvider';

jest.mock('../src/helpers', () => ({
  getNotificationNavigationTarget: jest.fn()
}));

jest.mock('../src/helpers/notificationNavigationHelper', () => ({
  navigateToNotificationTarget: jest.fn()
}));

jest.mock('../src/hooks', () => ({
  usePushNotifications: jest.fn(),
  useWasteReminderSync: jest.fn()
}));

const navigationTarget = {
  name: 'WasteCollection',
  params: { title: 'Abfallkalender' }
};

const settingsValue = (navigation: string, pushNotifications: boolean) => ({
  ...initialContext,
  globalSettings: {
    ...initialContext.globalSettings,
    navigation,
    settings: {
      ...initialContext.globalSettings.settings,
      pushNotifications
    }
  }
});

const runtime = (navigation: string, pushNotifications: boolean) => (
  <SettingsContext.Provider value={settingsValue(navigation, pushNotifications)}>
    <WasteReminderRuntime />
  </SettingsContext.Provider>
);

describe('WasteReminderRuntime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('installs reminder hooks and forwards recognized notification interactions', () => {
    (getNotificationNavigationTarget as jest.Mock).mockReturnValue(navigationTarget);

    act(() => {
      renderer.create(runtime('drawer', true));
    });

    expect(useWasteReminderSync).toHaveBeenCalledTimes(1);
    expect(usePushNotifications).toHaveBeenCalledWith(
      undefined,
      expect.any(Function),
      undefined,
      true
    );

    const interactionHandler = (usePushNotifications as jest.Mock).mock.calls[0][1];
    const data = { id: 'waste-1', query_type: 'wasteAddress' };

    act(() => {
      interactionHandler({ notification: { request: { content: { data } } } });
    });

    expect(getNotificationNavigationTarget).toHaveBeenCalledWith(data);
    expect(navigateToNotificationTarget).toHaveBeenCalledWith({
      navigationTarget,
      navigationType: 'drawer'
    });
  });

  it('ignores unknown data and uses rerendered navigation and push settings', () => {
    (getNotificationNavigationTarget as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(navigationTarget);

    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(runtime('drawer', true));
    });

    const initialInteractionHandler = (usePushNotifications as jest.Mock).mock.calls[0][1];
    act(() => {
      initialInteractionHandler({ notification: { request: { content: { data: {} } } } });
    });

    expect(navigateToNotificationTarget).not.toHaveBeenCalled();

    act(() => {
      testRenderer.update(runtime('tab', false));
    });

    expect(usePushNotifications).toHaveBeenLastCalledWith(
      undefined,
      expect.any(Function),
      undefined,
      false
    );

    const currentInteractionHandler = (usePushNotifications as jest.Mock).mock.calls.at(-1)[1];
    act(() => {
      currentInteractionHandler({ notification: { request: { content: { data: {} } } } });
    });

    expect(navigateToNotificationTarget).toHaveBeenCalledWith({
      navigationTarget,
      navigationType: 'tab'
    });
  });
});
