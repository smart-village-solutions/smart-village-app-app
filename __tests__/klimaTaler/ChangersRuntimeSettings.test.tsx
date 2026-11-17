import { act, render } from '@testing-library/react-native';
import React, { useContext, useEffect } from 'react';
import { Text } from 'react-native';

import changers from '../../modules/expo-changers';
import { SettingsContext, SettingsProvider } from '../../src/SettingsProvider';
import { klimaTalerConfiguration } from '../../src/klimaTaler/configuration';
import { klimaTalerEntry } from '../../src/klimaTaler/entry';
import { klimaTalerSummary } from '../../src/klimaTaler/summary';

jest.mock('../../modules/expo-changers', () => ({
  __esModule: true,
  default: {
    capabilities: { registerUser: { supported: true }, statistics: { supported: true } },
    setEnabled: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn(),
    activate: jest.fn(),
    registerUser: jest.fn(),
    logout: jest.fn(),
    getUserUUID: jest.fn().mockResolvedValue('existing-account'),
    fetchStatistics: jest.fn(),
    openProvider: jest.fn().mockResolvedValue(undefined),
    closeProvider: jest.fn().mockResolvedValue(undefined),
    addProviderClosedListener: () => ({ remove: () => undefined })
  }
}));

const native = jest.mocked(changers);
let updateSettings: (value: object) => void;
const Consumer = () => {
  const context = useContext(SettingsContext) as unknown as {
    setGlobalSettings(value: object): void;
  };
  useEffect(() => {
    updateSettings = context.setGlobalSettings;
  }, [context.setGlobalSettings]);
  return <Text>App</Text>;
};
const mount = (settings: object) =>
  render(
    <SettingsProvider
      initialGlobalSettings={settings}
      initialListTypesSettings={{}}
      initialLocationSettings={{}}
      initialConversationSettings={{}}
    >
      <Consumer />
    </SettingsProvider>
  );
const ready = () =>
  act(async () => {
    await klimaTalerConfiguration.ready();
  });
const update = (settings: object) => act(() => updateSettings(settings));

beforeEach(async () => {
  klimaTalerConfiguration.setEnabled(false);
  await klimaTalerConfiguration.ready();
  klimaTalerEntry.cancel();
  klimaTalerSummary.invalidate();
  jest.clearAllMocks();
  native.getStatus.mockResolvedValue({
    state: 'ready',
    activated: true,
    initialized: true,
    authenticated: true
  } as never);
});

test('missing settings block entry and reads; true enables; removal closes without logout', async () => {
  const screen = mount({ 'klima-taler': true, settings: {} });
  await ready();
  await klimaTalerEntry.open();
  await klimaTalerSummary.refresh();
  expect(native.getStatus).not.toHaveBeenCalled();
  expect(native.activate).not.toHaveBeenCalled();
  update({ settings: { 'klima-taler': true } });
  await ready();
  await klimaTalerEntry.open();
  expect(native.openProvider).toHaveBeenCalledTimes(1);
  update({});
  await ready();
  expect(native.setEnabled).toHaveBeenLastCalledWith(false);
  expect(native.closeProvider).toHaveBeenCalled();
  expect(klimaTalerSummary.getSnapshot().phase).toBe('disabled');
  expect(native.logout).not.toHaveBeenCalled();
  update({ settings: { 'klima-taler': {} } });
  await ready();
  await klimaTalerEntry.open();
  expect(native.openProvider).toHaveBeenCalledTimes(2);
  expect(native.registerUser).not.toHaveBeenCalled();
  screen.unmount();
  await ready();
});

test('removing settings while status is pending prevents activation and provider presentation', async () => {
  const screen = mount({ settings: { 'klima-taler': true } });
  await ready();
  let finish!: (value: unknown) => void;
  native.getStatus.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }) as never
  );
  const opening = klimaTalerEntry.open();
  await new Promise((resolve) => setImmediate(resolve));
  expect(native.getStatus).toHaveBeenCalledTimes(1);
  update({ settings: { 'klima-taler': false } });
  await ready();
  finish({ state: 'inactive', activated: false, initialized: false, authenticated: false });
  await opening;
  expect(native.activate).not.toHaveBeenCalled();
  expect(native.openProvider).not.toHaveBeenCalled();
  screen.unmount();
  await ready();
});

test('removing settings during statistics discards the result and avoids another identity read', async () => {
  const screen = mount({ settings: { 'klima-taler': {} } });
  await ready();
  let finish!: (value: unknown) => void;
  native.fetchStatistics.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }) as never
  );
  const reading = klimaTalerSummary.refresh();
  await new Promise((resolve) => setImmediate(resolve));
  update({});
  await ready();
  finish({ coins: 123 });
  await reading;
  expect(klimaTalerSummary.getSnapshot()).toEqual({ phase: 'disabled' });
  expect(native.getUserUUID).toHaveBeenCalledTimes(1);
  screen.unmount();
  await ready();
});

test('a delayed statistics status response does not read identity after remote disable', async () => {
  const screen = mount({ settings: { 'klima-taler': true } });
  await ready();
  let finish!: (value: unknown) => void;
  native.getStatus.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }) as never
  );
  const reading = klimaTalerSummary.refresh();
  await new Promise((resolve) => setImmediate(resolve));
  update({});
  await ready();
  finish({ state: 'ready', activated: true, initialized: true, authenticated: true });
  await reading;
  expect(native.getUserUUID).not.toHaveBeenCalled();
  expect(native.fetchStatistics).not.toHaveBeenCalled();
  expect(klimaTalerSummary.getSnapshot().phase).toBe('disabled');
  screen.unmount();
  await ready();
});
