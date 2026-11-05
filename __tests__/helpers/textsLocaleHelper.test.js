import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';

import { texts, textsByLocale, setTextsLocale } from '../../src/config/texts';
import { storageHelper } from '../../src/helpers/storageHelper';
import {
  initializeTextsLocale,
  saveTextsLocaleAndReload
} from '../../src/helpers/textsLocaleHelper';

jest.mock('expo-updates', () => ({ reloadAsync: jest.fn() }));
jest.mock('react-native/Libraries/Utilities/DevSettings', () => ({
  __esModule: true,
  default: { reload: jest.fn() }
}));
jest.mock('../../src/helpers/storageHelper', () => ({
  storageHelper: { textsLocale: jest.fn(), setTextsLocale: jest.fn() }
}));

beforeEach(() => {
  jest.clearAllMocks();
  textsByLocale['pt-PT'] = { ...textsByLocale.de, close: 'Fechar' };
  setTextsLocale('de');
  storageHelper.textsLocale.mockResolvedValue(null);
  storageHelper.setTextsLocale.mockResolvedValue();
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

it.each([null, 'unknown', 'pt-BR', '__proto__'])('falls back as a whole for %s', async (locale) => {
  storageHelper.textsLocale.mockResolvedValue(locale);
  expect(await initializeTextsLocale()).toBe('de');
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
