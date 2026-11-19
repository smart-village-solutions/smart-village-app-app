import React, { useContext } from 'react';
import { AppState } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from 'react-query';

import {
  AppLanguageNamesContext,
  AppLanguagesContext,
  AppLanguagesProvider
} from '../src/AppLanguagesProvider';
import { getAvailableTextsLocales, synchronizeTextsLocale } from '../src/helpers/textsLocaleHelper';

jest.mock('../src/helpers/appTextCatalog', () => ({
  refreshAppTextCatalog: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../src/NetworkProvider', () => ({
  NetworkContext: jest
    .requireActual('react')
    .createContext({ isConnected: true, isMainserverUp: true })
}));
jest.mock('../src/helpers/mainServerHelper', () => ({
  getMainServerUrl: () => 'https://test.invalid',
  getMainServerConfig: () => ({ oAuthClientId: 'app' })
}));
jest.mock('../src/helpers/textsLocaleHelper', () => ({
  ...jest.requireActual('../src/helpers/textsLocaleHelper'),
  getAvailableTextsLocales: jest.fn(),
  synchronizeTextsLocale: jest.fn()
}));

const Probe = () => {
  const locales = useContext(AppLanguagesContext);
  const names = useContext(AppLanguageNamesContext);
  return <probe locales={locales} names={names} />;
};

let tree;
let queryClient;
let activate;
const flush = () => act(async () => new Promise((resolve) => setTimeout(resolve, 20)));

beforeEach(() => {
  jest.clearAllMocks();
  synchronizeTextsLocale.mockResolvedValue(undefined);
  getAvailableTextsLocales.mockReturnValue(['de']);
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  queryClient = new QueryClient();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, callback) => {
    activate = () => callback('active');
    return { remove: jest.fn() };
  });
});

afterEach(async () => {
  await act(async () => tree.unmount());
  queryClient.clear();
  jest.restoreAllMocks();
});

const mount = async (query) => {
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={queryClient}>
        <AppLanguagesProvider client={{ query }}>
          <Probe />
        </AppLanguagesProvider>
      </QueryClientProvider>
    );
  });
  await flush();
};

const locales = () => tree.root.findByType('probe').props.locales;
const response = (locales) => ({ data: { appTranslationLocales: locales } });

it('offers server languages without bundled catalogs and falls back after revocation', async () => {
  const query = jest.fn().mockResolvedValueOnce(response(['en', 'fr', 'pt-PT', 'es', 'fr']));
  await mount(query);
  expect(locales()).toEqual(['de', 'en', 'fr', 'pt-PT', 'es']);
  expect(query).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: 'no-cache' }));
  expect(synchronizeTextsLocale).toHaveBeenCalledTimes(1);

  query.mockResolvedValueOnce(response(['fr']));
  activate();
  await flush();
  expect(locales()).toEqual(['de', 'fr']);
  expect(synchronizeTextsLocale).toHaveBeenLastCalledWith(expect.objectContaining({ query }), [
    'de',
    'fr'
  ]);
});

it('exposes only German if the server has no language query', async () => {
  await mount(jest.fn().mockRejectedValue(new Error('Unknown field')));
  expect(locales()).toEqual(['de']);
  expect(synchronizeTextsLocale).not.toHaveBeenCalled();
});

it('retains the last release on failure and treats a successful empty list as a revocation', async () => {
  const query = jest.fn().mockResolvedValueOnce(response(['fr']));
  await mount(query);
  query.mockResolvedValueOnce(response(null));
  activate();
  await flush();
  expect(locales()).toEqual(['de', 'fr']);
  expect(synchronizeTextsLocale).toHaveBeenCalledTimes(1);

  query.mockResolvedValueOnce(response([]));
  activate();
  await flush();
  expect(locales()).toEqual(['de']);
  expect(synchronizeTextsLocale).toHaveBeenLastCalledWith(expect.objectContaining({ query }), [
    'de'
  ]);
});

it('uses server display names only for the enabled locales', async () => {
  await mount(
    jest.fn().mockResolvedValue({
      data: {
        appTranslationLocales: ['hu'],
        appTranslationLanguageNames: { de: 'Deutsch', hu: 'Magyar', fr: 'Français' }
      }
    })
  );
  expect(tree.root.findByType('probe').props.names).toEqual({ de: 'Deutsch', hu: 'Magyar' });
});

it('falls back to the locale query on an older Mainserver', async () => {
  const query = jest
    .fn()
    .mockRejectedValueOnce({
      graphQLErrors: [
        {
          extensions: { code: 'undefinedField', fieldName: 'appTranslationLanguageNames' }
        }
      ]
    })
    .mockResolvedValueOnce(response(['fr']));
  await mount(query);
  expect(locales()).toEqual(['de', 'fr']);
  expect(query).toHaveBeenCalledTimes(2);
});

it('keeps the scoped cached releases available if the server cannot be reached', async () => {
  getAvailableTextsLocales.mockReturnValue(['de', 'fr']);
  await mount(jest.fn().mockRejectedValue(new Error('offline')));
  expect(locales()).toEqual(['de', 'fr']);
  expect(synchronizeTextsLocale).not.toHaveBeenCalled();
});
