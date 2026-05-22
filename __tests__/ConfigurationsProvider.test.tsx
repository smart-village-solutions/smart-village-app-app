import React from 'react';
import renderer from 'react-test-renderer';

import { ConfigurationsProvider } from '../src/ConfigurationsProvider';
import { SettingsContext, initialContext } from '../src/SettingsProvider';

const mockApolloUseQuery = jest.fn();
const mockReactQueryUseQuery = jest.fn();
const mockSetConfigurations = jest.fn();
const mockUseHomeRefresh = jest.fn();
const mockUseStaticContent = jest.fn();

jest.mock('react-apollo', () => ({
  useQuery: (...args) => mockApolloUseQuery(...args)
}));

jest.mock('react-query', () => ({
  useQuery: (...args) => mockReactQueryUseQuery(...args)
}));

jest.mock('../src/helpers', () => ({
  getSueApiConfig: jest.requireActual('../src/helpers/sueHelper').getSueApiConfig,
  storageHelper: {
    setConfigurations: (...args) => mockSetConfigurations(...args)
  }
}));

jest.mock('../src/hooks', () => ({
  useHomeRefresh: (...args) => mockUseHomeRefresh(...args),
  useStaticContent: (...args) => mockUseStaticContent(...args)
}));

jest.mock('../src/queries', () => ({
  QUERY_TYPES: {
    RESOURCE_FILTERS: 'resource-filters',
    SUE: {
      CONFIGURATIONS: 'sue-configurations'
    }
  },
  getQuery: jest.fn(() => jest.fn())
}));

const renderProvider = (sueSettings = {}) => {
  let testRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(
      <SettingsContext.Provider
        value={{
          ...initialContext,
          globalSettings: {
            ...initialContext.globalSettings,
            settings: {
              sue: sueSettings
            }
          }
        }}
      >
        <ConfigurationsProvider>
          <></>
        </ConfigurationsProvider>
      </SettingsContext.Provider>
    );
  });

  return testRenderer;
};

describe('ConfigurationsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockApolloUseQuery.mockReturnValue({
      data: {
        resourceFilters: []
      }
    });

    mockUseHomeRefresh.mockImplementation(() => undefined);
  });

  it('refetches SUE configuration on home refresh when base apiConfig is complete and whichApi is invalid', async () => {
    const refetchSueConfig = jest.fn().mockResolvedValue(undefined);
    const refetchSueProgress = jest.fn().mockResolvedValue(undefined);

    mockReactQueryUseQuery.mockReturnValue({
      data: undefined,
      refetch: refetchSueConfig
    });

    mockUseStaticContent.mockReturnValue({
      data: undefined,
      refetch: refetchSueProgress
    });

    renderProvider({
      apiConfig: {
        whichApi: 'typoed-api',
        apiKey: 'base-api-key',
        serverUrl: 'https://example.com'
      }
    });

    const onRefresh = mockUseHomeRefresh.mock.calls[0][0];

    await renderer.act(async () => {
      await onRefresh();
    });

    expect(refetchSueConfig).toHaveBeenCalledTimes(1);
    expect(refetchSueProgress).toHaveBeenCalledTimes(1);
  });
});
