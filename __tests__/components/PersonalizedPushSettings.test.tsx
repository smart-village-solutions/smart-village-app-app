import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { SettingsContext } from '../../src/SettingsProvider';
import { addToStore, readFromStore, removeFromStore } from '../../src/helpers';
import {
  addExcludeNotificationConfigurationOnServer,
  getExcludeNotificationConfigurationFromServer,
  getInAppPermission,
  getPushTokenFromStorage
} from '../../src/pushNotifications';
import { onActivatePushNotifications, onDeactivatePushNotifications } from '../../src/screens';
import { SettingsToggle } from '../../src/components/SettingsToggle';
import { PersonalizedPushSettings } from '../../src/components/settings/PersonalizedPushSettings';

jest.mock('../../src/config', () => ({
  texts: {
    settingsTitles: { pushNotifications: 'Push' },
    settingsContents: { personalizedPush: { sectionTitle: 'Categories' } }
  }
}));
jest.mock('../../src/pushNotifications', () => ({
  addExcludeNotificationConfigurationOnServer: jest.fn(),
  getExcludeNotificationConfigurationFromServer: jest.fn(),
  getInAppPermission: jest.fn(),
  getPushTokenFromStorage: jest.fn()
}));
jest.mock('../../src/helpers', () => ({
  readFromStore: jest.fn(),
  addToStore: jest.fn(),
  removeFromStore: jest.fn()
}));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('react-query', () => ({
  useQuery: () => ({
    data: { categories: [{ id: '1', name: 'News', tagList: ['news_item'] }] },
    isLoading: false
  })
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: { CATEGORIES_FILTER: 'categories' }
}));
jest.mock('../../src/screens', () => ({
  onActivatePushNotifications: jest.fn(),
  onDeactivatePushNotifications: jest.fn()
}));
jest.mock('../../src/components/SettingsToggle', () => ({ SettingsToggle: () => null }));
jest.mock('../../src/components/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
jest.mock('../../src/components/Text', () => ({ RegularText: () => null }));
jest.mock('../../src/components/Wrapper', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  return { Wrapper: View, WrapperHorizontal: View };
});

const settings = {
  globalSettings: {
    settings: {
      personalizedPush: {
        categories: {
          queryVariables: { tagList: ['news_item'] }
        }
      }
    }
  }
};
let tree: renderer.ReactTestRenderer;
const toggle = (index = 0) => tree.root.findAllByType(SettingsToggle)[index].props.item;
const mount = async () => {
  await act(async () => {
    tree = renderer.create(
      <SettingsContext.Provider value={settings as never}>
        <PersonalizedPushSettings />
      </SettingsContext.Provider>
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getInAppPermission).mockResolvedValue(true);
  jest.mocked(getPushTokenFromStorage).mockResolvedValue('token-a');
  jest
    .mocked(getExcludeNotificationConfigurationFromServer)
    .mockResolvedValue({ news_item: { '1': {} }, other: { '2': {} } });
  jest.mocked(addExcludeNotificationConfigurationOnServer).mockResolvedValue(true);
  jest.mocked(readFromStore).mockResolvedValue(null);
  jest.mocked(onActivatePushNotifications).mockResolvedValue(true);
  jest.mocked(onDeactivatePushNotifications).mockResolvedValue(true);
});
afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
});

it('loads existing exclusions without writing or resetting them', async () => {
  await mount();
  expect(toggle(1).value).toBe(false);
  expect(addExcludeNotificationConfigurationOnServer).not.toHaveBeenCalled();
});
it('keeps the screen usable and blocks category writes after a failed read', async () => {
  jest.mocked(getExcludeNotificationConfigurationFromServer).mockResolvedValue(undefined);
  await mount();
  expect(toggle().isDisabled).toBe(false);
  expect(toggle(1).isDisabled).toBe(true);
  expect(addExcludeNotificationConfigurationOnServer).not.toHaveBeenCalled();
});
it('awaits registration and handles missing cached categories on activation', async () => {
  jest.mocked(getInAppPermission).mockResolvedValue(false);
  jest.mocked(getPushTokenFromStorage).mockResolvedValueOnce(null).mockResolvedValue('token-b');
  let complete: (value: boolean) => void = () => undefined;
  jest.mocked(onActivatePushNotifications).mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    })
  );
  await mount();
  let activation: Promise<void>;
  await act(async () => {
    activation = toggle().onActivate(jest.fn());
  });
  expect(getExcludeNotificationConfigurationFromServer).not.toHaveBeenCalled();
  expect(toggle().isDisabled).toBe(true);
  await act(async () => {
    complete(true);
    await activation;
  });
  expect(toggle().value).toBe(true);
  expect(getExcludeNotificationConfigurationFromServer).toHaveBeenCalledWith('token-b');
  expect(addExcludeNotificationConfigurationOnServer).not.toHaveBeenCalled();
});
it('does not fetch or write preferences when registration fails', async () => {
  jest.mocked(getInAppPermission).mockResolvedValue(false);
  jest.mocked(onActivatePushNotifications).mockResolvedValue(false);
  await mount();
  await act(async () => {
    await toggle().onActivate(jest.fn());
  });
  expect(toggle().value).toBe(false);
  expect(getExcludeNotificationConfigurationFromServer).not.toHaveBeenCalled();
});
it('restores cached exclusions and preserves other tags before deleting the cache', async () => {
  jest.mocked(readFromStore).mockResolvedValue([{ id: '3', tags: ['news_item'] }]);
  await mount();
  expect(addExcludeNotificationConfigurationOnServer).toHaveBeenCalledWith('token-a', {
    news_item: { '3': {} },
    other: { '2': {} }
  });
  expect(removeFromStore).toHaveBeenCalledWith('PERSONALIZED_PUSH_SETTINGS');
});
it('retains the local cache when restoring preferences fails', async () => {
  jest.mocked(readFromStore).mockResolvedValue([]);
  jest.mocked(addExcludeNotificationConfigurationOnServer).mockResolvedValue(false);
  await mount();
  expect(removeFromStore).not.toHaveBeenCalled();
  expect(toggle(1).isDisabled).toBe(true);
});
it('saves a category change without dropping exclusions for other tags', async () => {
  await mount();
  await act(async () => {
    await toggle(1).onActivate(jest.fn());
  });
  expect(addExcludeNotificationConfigurationOnServer).toHaveBeenCalledWith('token-a', {
    news_item: {},
    other: { '2': {} }
  });
  expect(toggle(1).value).toBe(true);
});
it('reverts category UI and preserves exclusions when saving fails', async () => {
  await mount();
  jest.mocked(addExcludeNotificationConfigurationOnServer).mockResolvedValue(false);
  const revert = jest.fn();
  await act(async () => {
    await toggle(1).onActivate(revert);
  });
  expect(revert).toHaveBeenCalled();
  expect(toggle(1).value).toBe(false);
});
it('backs up preferences on opt-out and reads the fresh token when re-enabled', async () => {
  await mount();
  await act(async () => {
    await toggle().onDeactivate(jest.fn());
  });
  expect(addToStore).toHaveBeenCalledWith(
    'PERSONALIZED_PUSH_SETTINGS',
    expect.arrayContaining([{ id: '1', tags: ['news_item'] }])
  );
  expect(toggle().value).toBe(false);
  jest.mocked(getPushTokenFromStorage).mockResolvedValue('token-b');
  await act(async () => {
    await toggle().onActivate(jest.fn());
  });
  expect(getExcludeNotificationConfigurationFromServer).toHaveBeenLastCalledWith('token-b');
});
it('ignores a delayed read after unmount without writing cached preferences', async () => {
  let complete: (value: Record<string, Record<string, unknown>>) => void = () => undefined;
  jest.mocked(getExcludeNotificationConfigurationFromServer).mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    })
  );
  jest.mocked(readFromStore).mockResolvedValue([]);
  await mount();
  await act(async () => tree.unmount());
  await act(async () => {
    complete({});
  });
  expect(addExcludeNotificationConfigurationOnServer).not.toHaveBeenCalled();
});

it('preserves the enabled state and categories when device removal fails', async () => {
  await mount();
  jest.mocked(onDeactivatePushNotifications).mockResolvedValue(false);
  await act(async () => {
    await toggle().onDeactivate(jest.fn());
  });
  expect(toggle().value).toBe(true);
  expect(toggle(1).value).toBe(false);
});

it('blocks overlapping toggle operations', async () => {
  await mount();
  let complete: (value: boolean) => void = () => undefined;
  jest.mocked(onDeactivatePushNotifications).mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    })
  );
  const main = toggle();
  let deactivation: Promise<void>;
  await act(async () => {
    deactivation = main.onDeactivate(jest.fn());
  });
  const revert = jest.fn();
  await act(async () => {
    await main.onActivate(revert);
  });
  expect(revert).toHaveBeenCalled();
  expect(onActivatePushNotifications).not.toHaveBeenCalled();
  await act(async () => {
    complete(true);
    await deactivation;
  });
});
