import { getLocales } from 'expo-localization';
import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';

import { texts, textsByLocale, setTextsLocale } from '../../src/config/texts';
import { getMainServerUrl } from '../../src/helpers/mainServerHelper';
import { storageHelper } from '../../src/helpers/storageHelper';
import { readAppTextCatalog, refreshAppTextCatalog } from '../../src/helpers/appTextCatalog';
import {
  getTextsLocale,
  initializeTextsLocale,
  getTextsLocalePreference,
  getAvailableTextsLocales,
  synchronizeTextsLocale,
  saveTextsLocaleAndReload
} from '../../src/helpers/textsLocaleHelper';

jest.mock('expo-localization', () => ({ getLocales: jest.fn() }));
jest.mock('../../src/helpers/mainServerHelper', () => ({
  getMainServerUrl: jest.fn(),
  getMainServerConfig: () => ({ oAuthClientId: 'test-client' })
}));
jest.mock('expo-updates', () => ({ reloadAsync: jest.fn() }));
jest.mock('react-native/Libraries/Utilities/DevSettings', () => ({
  __esModule: true,
  default: { reload: jest.fn() }
}));
jest.mock('../../src/helpers/storageHelper', () => ({
  storageHelper: {
    textsLocale: jest.fn(),
    setTextsLocale: jest.fn(),
    textsLocales: jest.fn(),
    setTextsLocales: jest.fn()
  }
}));
jest.mock('../../src/helpers/appTextCatalog', () => ({
  readAppTextCatalog: jest.fn(),
  refreshAppTextCatalog: jest.fn(),
  applyAppTextCatalog: (catalog) => catalog.values
}));

beforeEach(async () => {
  jest.resetAllMocks();
  getMainServerUrl.mockReturnValue('https://locale-test.invalid');
  textsByLocale['pt-PT'] = { ...textsByLocale.de, close: 'Fechar' };
  setTextsLocale('de');
  readAppTextCatalog.mockResolvedValue(null);
  storageHelper.textsLocale.mockResolvedValue(null);
  storageHelper.setTextsLocale.mockResolvedValue();
  storageHelper.textsLocales.mockResolvedValue(undefined);
  storageHelper.setTextsLocales.mockResolvedValue();
  getLocales.mockReturnValue([{ languageTag: 'de-DE', languageCode: 'de' }]);
  await initializeTextsLocale();
});

afterEach(() => {
  delete textsByLocale['pt-PT'];
  setTextsLocale('de');
});

it('selects the exact saved locale before module-level labels are captured', async () => {
  storageHelper.textsLocale.mockResolvedValue('pt-PT');
  expect(await initializeTextsLocale()).toBe('pt-PT');
  expect(texts.close).toBe('Fechar');
  expect(storageHelper.setTextsLocale).not.toHaveBeenCalled();
});

it('reports the selected locale when the downloaded catalog replaces the bundled object', async () => {
  storageHelper.textsLocale.mockResolvedValue('pt-PT');
  readAppTextCatalog.mockResolvedValue({ values: { close: 'Encerrar' } });
  await initializeTextsLocale();
  expect(texts.close).toBe('Encerrar');
  expect(getTextsLocale()).toBe('pt-PT');
});

it.each([null, 'not_a_language', '__proto__'])('falls back as a whole for %s', async (locale) => {
  storageHelper.textsLocale.mockResolvedValue(locale);
  expect(await initializeTextsLocale()).toBe('de');
  expect(texts).toBe(textsByLocale.de);
});

it('uses German if the manually preferred language has no usable catalog', async () => {
  storageHelper.textsLocale.mockResolvedValue('es');
  expect(await initializeTextsLocale()).toBe('de');
  expect(getTextsLocalePreference()).toBe('es');
  expect(getTextsLocale()).toBe('de');
  expect(texts).toBe(textsByLocale.de);
});

it('keeps a saved preference intact when reading storage fails', async () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  storageHelper.textsLocale.mockRejectedValue(new Error('unavailable'));
  expect(await initializeTextsLocale()).toBe('de');
  expect(storageHelper.setTextsLocale).not.toHaveBeenCalled();
  warning.mockRestore();
});

it('persists before reloading and leaves active text captures unchanged until restart', async () => {
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  let finishSave;
  storageHelper.setTextsLocale.mockImplementation(
    () =>
      new Promise((resolve) => {
        finishSave = resolve;
      })
  );
  const changing = saveTextsLocaleAndReload('pt-PT');
  expect(reload).not.toHaveBeenCalled();
  expect(texts).toBe(textsByLocale.de);
  finishSave();
  await changing;
  expect(storageHelper.setTextsLocale).toHaveBeenCalledWith('pt-PT');
  expect(reload).toHaveBeenCalledTimes(1);
  expect(Updates.reloadAsync).not.toHaveBeenCalled();
  reload.mockRestore();
});

it('does not reload or discard the active locale after a failed write', async () => {
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  storageHelper.setTextsLocale.mockRejectedValue(new Error('unavailable'));
  await expect(saveTextsLocaleAndReload('pt-PT')).rejects.toThrow('unavailable');
  expect(reload).not.toHaveBeenCalled();
  expect(texts).toBe(textsByLocale.de);
  reload.mockRestore();
});

it('uses the installed Updates reload in production and reports reload failures', async () => {
  const previous = global.__DEV__;
  global.__DEV__ = false;
  Updates.reloadAsync.mockRejectedValueOnce(new Error('reload unavailable'));
  try {
    await expect(saveTextsLocaleAndReload('pt-PT')).rejects.toThrow('reload unavailable');
    expect(storageHelper.setTextsLocale).toHaveBeenCalledWith('pt-PT');
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
    expect(texts).toBe(textsByLocale.de);
  } finally {
    global.__DEV__ = previous;
  }
});

it.each([
  ['fr-CA', 'fr', 'fr'],
  ['en-US', 'en', 'en'],
  ['pt-PT', 'pt', 'pt-PT'],
  ['pt-BR', 'pt', 'de'],
  ['ja-JP', 'ja', 'de']
])(
  'matches device %s conservatively to %s with fallback %s',
  async (languageTag, languageCode, expected) => {
    getLocales.mockReturnValue([{ languageTag, languageCode }]);
    storageHelper.textsLocales.mockResolvedValue(['de', 'en', 'fr', 'pt-PT']);
    expect(await initializeTextsLocale()).toBe(expected);
    expect(getTextsLocalePreference()).toBe('system');
    expect(storageHelper.setTextsLocale).not.toHaveBeenCalled();
  }
);

it('respects device preference order, including German ahead of other supported languages', async () => {
  storageHelper.textsLocales.mockResolvedValue(['de', 'en', 'fr']);
  getLocales.mockReturnValue([
    { languageTag: 'ja-JP', languageCode: 'ja' },
    { languageTag: 'de-DE', languageCode: 'de' },
    { languageTag: 'fr-FR', languageCode: 'fr' }
  ]);
  expect(await initializeTextsLocale()).toBe('de');
});

it('always gives an existing manual choice priority over the system language', async () => {
  getLocales.mockReturnValue([{ languageTag: 'fr-FR', languageCode: 'fr' }]);
  storageHelper.textsLocale.mockResolvedValue('en');
  storageHelper.textsLocales.mockResolvedValue(['de', 'en', 'fr']);
  expect(await initializeTextsLocale()).toBe('en');
  expect(getTextsLocalePreference()).toBe('en');
});

it('starts in German without cached releases and reloads once after live approval', async () => {
  getLocales.mockReturnValue([{ languageTag: 'fr-FR', languageCode: 'fr' }]);
  expect(await initializeTextsLocale()).toBe('de');
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  await synchronizeTextsLocale({}, ['fr']);
  await synchronizeTextsLocale({}, ['fr']);
  expect(reload).toHaveBeenCalledTimes(1);
  expect(getTextsLocalePreference()).toBe('system');
  expect(storageHelper.setTextsLocale).not.toHaveBeenCalled();
  expect(storageHelper.setTextsLocales).toHaveBeenLastCalledWith(
    JSON.stringify(['https://locale-test.invalid', 'test-client']),
    ['de', 'fr']
  );
  reload.mockRestore();
});

it('rechecks device preferences on each start while keeping them stable during that visit', async () => {
  storageHelper.textsLocales.mockResolvedValue(['de', 'fr', 'en']);
  getLocales.mockReturnValue([{ languageTag: 'fr-FR', languageCode: 'fr' }]);
  expect(await initializeTextsLocale()).toBe('fr');
  getLocales.mockReturnValue([{ languageTag: 'en-US', languageCode: 'en' }]);
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  await synchronizeTextsLocale({}, ['en', 'fr']);
  expect(reload).not.toHaveBeenCalled();
  expect(await initializeTextsLocale()).toBe('en');
  reload.mockRestore();
});

it('falls back after revocation without overwriting a manual preference', async () => {
  storageHelper.textsLocale.mockResolvedValue('fr');
  await initializeTextsLocale();
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  await synchronizeTextsLocale({}, []);
  expect(reload).toHaveBeenCalledTimes(1);
  expect(storageHelper.setTextsLocale).not.toHaveBeenCalled();
  storageHelper.textsLocales.mockResolvedValue(['de']);
  expect(await initializeTextsLocale()).toBe('de');
  expect(getTextsLocalePreference()).toBe('fr');
  reload.mockRestore();
});

it('can return from manual selection to the system preference', async () => {
  storageHelper.textsLocale.mockResolvedValue('en');
  await initializeTextsLocale();
  await saveTextsLocaleAndReload('system');
  expect(storageHelper.setTextsLocale).toHaveBeenCalledWith('system');
  expect(getTextsLocalePreference()).toBe('system');
});

it('uses a newly downloaded device-language catalog with one reload', async () => {
  getLocales.mockReturnValue([{ languageTag: 'hu-HU', languageCode: 'hu' }]);
  await initializeTextsLocale();
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  let catalog;
  readAppTextCatalog.mockImplementation(async (locale) => (locale === 'hu' ? catalog : null));
  refreshAppTextCatalog.mockImplementation(async (client, locale) => {
    if (locale === 'hu') catalog = { locale: 'hu', revision: '1', values: { close: 'Bezárás' } };
  });
  await synchronizeTextsLocale({}, ['hu']);
  expect(reload).toHaveBeenCalledTimes(1);
  storageHelper.textsLocales.mockResolvedValue(['de', 'hu']);
  expect(await initializeTextsLocale()).toBe('hu');
  expect(texts.close).toBe('Bezárás');
  reload.mockRestore();
});

it('falls back if an approved device-language catalog cannot be downloaded', async () => {
  getLocales.mockReturnValue([{ languageTag: 'hu-HU', languageCode: 'hu' }]);
  storageHelper.textsLocales.mockResolvedValue(['de', 'hu']);
  expect(await initializeTextsLocale()).toBe('de');
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  refreshAppTextCatalog.mockRejectedValue(new Error('offline'));
  await synchronizeTextsLocale({}, ['hu']);
  expect(reload).not.toHaveBeenCalled();
  expect(getTextsLocale()).toBe('de');
  reload.mockRestore();
});

it('ignores a pending automatic selection after the user saves a manual language', async () => {
  getLocales.mockReturnValue([{ languageTag: 'fr-FR', languageCode: 'fr' }]);
  await initializeTextsLocale();
  let finish;
  refreshAppTextCatalog.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  const syncing = synchronizeTextsLocale({}, ['fr', 'en']);
  for (let i = 0; i < 5; i++) await Promise.resolve();
  await saveTextsLocaleAndReload('en');
  finish();
  await syncing;
  expect(reload).toHaveBeenCalledTimes(1);
  expect(getTextsLocalePreference()).toBe('en');
  reload.mockRestore();
});

it('does not overwrite an unknown preference after a storage read failure', async () => {
  storageHelper.textsLocale.mockRejectedValue(new Error('storage unavailable'));
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  await initializeTextsLocale();
  await synchronizeTextsLocale({}, ['fr']);
  expect(storageHelper.setTextsLocales).not.toHaveBeenCalled();
  expect(storageHelper.setTextsLocale).not.toHaveBeenCalled();
  warning.mockRestore();
});

it('reuses cached releases offline but never across a different server scope', async () => {
  const snapshots = new Map();
  storageHelper.textsLocales.mockImplementation(async (scope) => snapshots.get(scope));
  storageHelper.setTextsLocales.mockImplementation(async (scope, locales) =>
    snapshots.set(scope, locales)
  );
  getLocales.mockReturnValue([{ languageTag: 'fr-FR', languageCode: 'fr' }]);
  expect(await initializeTextsLocale()).toBe('de');
  await synchronizeTextsLocale({}, ['fr']);
  expect(await initializeTextsLocale()).toBe('fr');
  expect(getAvailableTextsLocales()).toEqual(['de', 'fr']);
  expect(storageHelper.textsLocales).toHaveBeenLastCalledWith(
    JSON.stringify(['https://locale-test.invalid', 'test-client'])
  );
  getMainServerUrl.mockReturnValue('https://other.invalid');
  expect(await initializeTextsLocale()).toBe('de');
  expect(getAvailableTextsLocales()).toEqual(['de']);
  expect(storageHelper.textsLocales).toHaveBeenLastCalledWith(
    JSON.stringify(['https://other.invalid', 'test-client'])
  );
});

it('reloads a refreshed active catalog once without changing the preference', async () => {
  storageHelper.textsLocale.mockResolvedValue('fr');
  let catalog = { revision: '1', values: { close: 'Ancien' } };
  readAppTextCatalog.mockImplementation(async () => catalog);
  await initializeTextsLocale();
  refreshAppTextCatalog.mockImplementationOnce(async () => {
    catalog = { revision: '2', values: { close: 'Nouveau' } };
  });
  const reload = jest.spyOn(DevSettings, 'reload').mockImplementation(() => {});
  await synchronizeTextsLocale({}, ['fr']);
  expect(reload).toHaveBeenCalledTimes(1);
  expect(getTextsLocalePreference()).toBe('fr');
  expect(storageHelper.setTextsLocale).not.toHaveBeenCalled();
  reload.mockRestore();
});
