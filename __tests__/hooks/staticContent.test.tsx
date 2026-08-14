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

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useQuery } from 'react-apollo';

import { graphqlFetchPolicy } from '../../src/helpers';
import { NetworkContext } from '../../src/NetworkProvider';
import { getQuery } from '../../src/queries';
import { useRefreshTime } from '../../src/hooks/TimeHooks';
import { useStaticContent } from '../../src/hooks/staticContent';

const mockedUseQuery = jest.mocked(useQuery);
const mockedUseRefreshTime = jest.mocked(useRefreshTime);
const mockedGraphqlFetchPolicy = jest.mocked(graphqlFetchPolicy);
const mockedGetQuery = jest.mocked(getQuery);

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
  parseFromJson: (json: unknown) => unknown;
  type: 'json';
}) => {
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
});
