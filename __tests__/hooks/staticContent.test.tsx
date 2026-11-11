jest.mock('react-apollo', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../src/hooks/TimeHooks', () => ({
  useRefreshTime: jest.fn()
}));

jest.mock('../../src/helpers', () => ({
  graphqlFetchPolicy: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    PUBLIC_HTML_FILE: 'PUBLIC_HTML_FILE',
    PUBLIC_JSON_FILE: 'PUBLIC_JSON_FILE'
  },
  getQuery: jest.fn()
}));

jest.mock('../../src/AppLanguagesProvider', () => ({
  AppLanguagesContext: jest.requireActual('react').createContext(['de'])
}));
jest.mock('../../src/helpers/textsLocaleHelper');
jest.mock('../../src/ReactQueryClient');

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useQuery } from 'react-apollo';

import { graphqlFetchPolicy } from '../../src/helpers';
import { AppLanguagesContext } from '../../src/AppLanguagesProvider';
import { getTextsLocale } from '../../src/helpers/textsLocaleHelper';
import { NetworkContext } from '../../src/NetworkProvider';
import { getQuery } from '../../src/queries';
import { ReactQueryClient } from '../../src/ReactQueryClient';
import { useRefreshTime } from '../../src/hooks/TimeHooks';
import { useStaticContent } from '../../src/hooks/staticContent';

const mockedUseQuery = jest.mocked(useQuery);
const mockedUseRefreshTime = jest.mocked(useRefreshTime);
const mockedGraphqlFetchPolicy = jest.mocked(graphqlFetchPolicy);
const mockedGetQuery = jest.mocked(getQuery);
const mockedGetTextsLocale = jest.mocked(getTextsLocale);
const mockedReactQueryClient = jest.mocked(ReactQueryClient);

const parseFromJson = (json: unknown) => json;

let latestResult:
  | {
      data?: unknown;
      error: boolean;
      loading: boolean;
      refetch: () => Promise<unknown>;
    }
  | undefined;

const Probe = ({
  onResult,
  ...props
}: {
  name: string;
  onResult: (result: typeof latestResult) => void;
} & ({ parseFromJson: (json: unknown) => unknown; type: 'json' } | { type: 'html' })) => {
  const result = useStaticContent(props);

  React.useEffect(() => {
    onResult(result);
  }, [onResult, result]);

  return null;
};

describe('useStaticContent', () => {
  beforeEach(() => {
    latestResult = undefined;
    mockedUseRefreshTime.mockReturnValue(1);
    mockedGraphqlFetchPolicy.mockReturnValue('network-only');
    mockedGetQuery.mockReturnValue('QUERY');
    mockedGetTextsLocale.mockReturnValue('de');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('recomputes parse errors when loading changes without changing data identity', () => {
    const sharedData = {
      publicJsonFile: {
        content: null
      }
    };
    const refetch = jest.fn();

    mockedUseQuery
      .mockReturnValueOnce({
        data: sharedData,
        error: undefined,
        loading: true,
        refetch
      })
      .mockReturnValueOnce({
        data: sharedData,
        error: undefined,
        loading: false,
        refetch
      });

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
          <Probe
            name="bus-top10"
            type="json"
            parseFromJson={parseFromJson}
            onResult={(result) => {
              latestResult = result;
            }}
          />
        </NetworkContext.Provider>
      );
    });

    expect(latestResult?.error).toBe(false);
    expect(latestResult?.loading).toBe(true);

    act(() => {
      tree.update(
        <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
          <Probe
            name="bus-top10"
            type="json"
            parseFromJson={parseFromJson}
            onResult={(result) => {
              latestResult = result;
            }}
          />
        </NetworkContext.Provider>
      );
    });

    expect(latestResult?.error).toBe(true);
    expect(latestResult?.loading).toBe(false);
  });

  it('shows cached HTML immediately and switches to a ready translation of that source', async () => {
    jest.useFakeTimers();
    const original = '<p>Datenschutz</p>';
    const translated = '<p>Privacy policy</p>';
    const result = (state: string, content?: string) => ({
      scope: 'demo-en',
      data: { publicHtmlFile: { content: original, translation: { state, content } } }
    });
    mockedGetTextsLocale.mockReturnValue('en');
    mockedUseQuery.mockReturnValue({
      data: { publicHtmlFile: { content: original } },
      loading: false
    });
    const rawRequest = jest
      .fn()
      .mockResolvedValueOnce(result('pending'))
      .mockResolvedValueOnce(result('ready', translated));
    mockedReactQueryClient.mockResolvedValue({
      rawRequest,
      cacheScope: async () => 'demo-en',
      request: jest.fn()
    });

    const renderPage = (online: boolean) => (
      <NetworkContext.Provider value={{ isConnected: online, isMainserverUp: online }}>
        <AppLanguagesContext.Provider value={['de', 'en']}>
          <Probe name="privacy" type="html" onResult={(result) => (latestResult = result)} />
        </AppLanguagesContext.Provider>
      </NetworkContext.Provider>
    );

    let tree: renderer.ReactTestRenderer | undefined;
    try {
      await act(async () => {
        tree = renderer.create(renderPage(true));
      });
      expect(latestResult).toMatchObject({ data: original, loading: false, error: false });
      expect(rawRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ name: 'privacy' }),
        { locale: 'en' }
      );

      await act(async () => jest.advanceTimersByTime(1000));
      expect(latestResult).toMatchObject({ data: translated, loading: false });

      await act(async () => tree?.update(renderPage(false)));
      expect(latestResult?.data).toBe(translated);
      expect(rawRequest).toHaveBeenCalledTimes(2);

      mockedGetTextsLocale.mockReturnValue('de');
      await act(async () => tree?.update(renderPage(false)));
      expect(latestResult?.data).toBe(original);
    } finally {
      await act(async () => tree?.unmount());
      jest.useRealTimers();
    }
  });

  it('keeps the original when the translation response belongs to a different source revision', async () => {
    mockedGetTextsLocale.mockReturnValue('en');
    mockedUseQuery.mockReturnValue({
      data: { publicHtmlFile: { content: '<p>Neuer Text</p>' } },
      loading: false
    });
    mockedReactQueryClient.mockResolvedValue({
      rawRequest: jest.fn().mockResolvedValue({
        scope: 'demo-en',
        data: {
          publicHtmlFile: {
            content: '<p>Alter Text</p>',
            translation: { state: 'ready', content: '<p>Old text</p>' }
          }
        }
      }),
      cacheScope: async () => 'demo-en',
      request: jest.fn()
    });

    let tree: renderer.ReactTestRenderer | undefined;
    try {
      await act(async () => {
        tree = renderer.create(
          <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
            <AppLanguagesContext.Provider value={['de', 'en']}>
              <Probe name="privacy" type="html" onResult={(result) => (latestResult = result)} />
            </AppLanguagesContext.Provider>
          </NetworkContext.Provider>
        );
      });
      expect(latestResult).toMatchObject({ data: '<p>Neuer Text</p>', loading: false });
    } finally {
      await act(async () => tree?.unmount());
    }
  });
});
