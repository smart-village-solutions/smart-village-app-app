import { DevSettings } from 'react-native';

import { applyAppTextCatalog, refreshAppTextCatalog } from '../../src/helpers/appTextCatalog';
import { textsByLocale } from '../../src/config/texts';
import { addToStore, readFromStore, removeFromStore } from '../../src/helpers/storageHelper';

jest.mock('expo-updates', () => ({ reloadAsync: jest.fn() }));
jest.mock('../../src/helpers/mainServerHelper', () => ({
  getMainServerUrl: () => 'https://demo.example',
  getMainServerConfig: () => ({ oAuthClientId: 'app' })
}));
jest.mock('../../src/helpers/storageHelper', () => ({
  addToStore: jest.fn(),
  readFromStore: jest.fn(),
  removeFromStore: jest.fn()
}));
jest.mock('react-native/Libraries/Utilities/DevSettings', () => ({
  __esModule: true,
  default: { reload: jest.fn() }
}));

const snapshot = {
  schema: 'sva-mobile-app-texts-v2',
  locale: 'hu',
  revision: '12',
  values: {
    'settingsTitles.language': 'Nyelv',
    'participationProject.categoryCount': ['{{count}} bejegyzés', '{{count}} bejegyzés'],
    'weather.alertsText': 'Invalid {{unexpected}}',
    'screenTitles.home': 'Untrusted app name',
    '__proto__.unsafe': 'Unexpected'
  }
};

beforeEach(() => jest.clearAllMocks());

it('retains the bundled tree and functions while applying compatible data', () => {
  const catalog = applyAppTextCatalog(snapshot);
  expect(catalog.settingsTitles.language).toBe('Nyelv');
  expect(catalog.participationProject.categoryCount(2)).toBe('2 bejegyzés');
  expect(catalog.weather.alertsText).toBe(textsByLocale.de.weather.alertsText);
  expect(catalog.screenTitles.home).toBe(textsByLocale.de.screenTitles.home);
  expect(catalog.unsafe).toBeUndefined();
  expect(textsByLocale.de.settingsTitles.language).toBe('Sprache');
});

it('keeps the offline catalog after failure and reloads only for a change', async () => {
  readFromStore.mockResolvedValue(snapshot);
  const query = jest
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ data: { appTextCatalog: { ...snapshot, values: null } } })
    .mockResolvedValueOnce({ data: { appTextCatalog: { ...snapshot, revision: '13' } } });
  await expect(refreshAppTextCatalog({ query }, 'hu')).rejects.toThrow('offline');
  await refreshAppTextCatalog({ query }, 'hu');
  expect(addToStore).not.toHaveBeenCalled();
  expect(removeFromStore).not.toHaveBeenCalled();
  expect(DevSettings.reload).not.toHaveBeenCalled();
  await refreshAppTextCatalog({ query }, 'hu');
  expect(query).toHaveBeenCalledWith(
    expect.objectContaining({
      variables: { schema: snapshot.schema, locale: 'hu', knownRevision: '12' }
    })
  );
  expect(addToStore).toHaveBeenCalledWith(expect.stringContaining('https://demo.example'), {
    ...snapshot,
    revision: '13'
  });
  expect(DevSettings.reload).toHaveBeenCalledTimes(1);
});
