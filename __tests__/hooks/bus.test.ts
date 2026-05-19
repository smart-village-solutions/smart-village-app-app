jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}));

jest.mock('react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useQuery: jest.fn()
}));

jest.mock('../../src/queries/bus', () => ({
  DEFAULT_LIST_LIMIT: 500,
  findBusCategoryChildren: jest.fn(),
  findBusCategoryRoot: jest.fn(),
  findPublicServicesPage: jest.fn(),
  findPublicServices: jest.fn(),
  getPublicService: jest.fn(),
  searchPoliticalAreas: jest.fn()
}));

jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: {}
}));

jest.mock('../../src/hooks/staticContent', () => ({
  useStaticContent: jest.fn()
}));

import * as React from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import TestRenderer, { act } from 'react-test-renderer';

import {
  DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD,
  getBusLifeSituationsRootSearchWord,
  getBusQueryConfigKey,
  useBusAreas,
  useBusCategoryChildren,
  useBusLifeSituationsRoot,
  useBusServiceSearch,
  useBusServices
} from '../../src/hooks/bus';
import {
  findBusCategoryChildren,
  findBusCategoryRoot,
  findPublicServicesPage,
  searchPoliticalAreas
} from '../../src/queries/bus';

const mockedUseContext = jest.mocked(React.useContext);
const mockedUseInfiniteQuery = jest.mocked(useInfiniteQuery);
const mockedUseQuery = jest.mocked(useQuery);
const mockedFindBusCategoryChildren = jest.mocked(findBusCategoryChildren);
const mockedFindBusCategoryRoot = jest.mocked(findBusCategoryRoot);
const mockedFindPublicServicesPage = jest.mocked(findPublicServicesPage);
const mockedSearchPoliticalAreas = jest.mocked(searchPoliticalAreas);
const defaultBusSettings = {
  uri: 'https://one.example'
};

const createSettingsContextValue = (bus = {}) => ({
  globalSettings: {
    settings: {
      bus: {
        ...defaultBusSettings,
        ...bus
      }
    }
  }
});

const createUseQueryResult = () =>
  ({
    data: undefined,
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: jest.fn()
  } as never);

const createUseInfiniteQueryResult = (pages: unknown[] = []) =>
  ({
    data: { pages },
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetching: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: jest.fn()
  } as never);

const mockEnabledUseQuery = () => {
  mockedUseQuery.mockImplementation((_, queryFn, options) => {
    if (options?.enabled !== false) {
      queryFn();
    }

    return createUseQueryResult();
  });
};

const mockIdleUseQuery = () => {
  mockedUseQuery.mockReturnValue(createUseQueryResult());
};

const mockEnabledUseInfiniteQuery = () => {
  mockedUseInfiniteQuery.mockImplementation((_, queryFn) => {
    queryFn({ pageParam: 0 });

    return createUseInfiniteQueryResult();
  });
};

const mockIdleUseInfiniteQuery = (pages: unknown[] = []) => {
  mockedUseInfiniteQuery.mockReturnValue(createUseInfiniteQueryResult(pages));
};

const renderHook = async (callback: () => void, shouldAwait = false) => {
  const TestComponent = () => {
    callback();
    return null;
  };

  if (shouldAwait) {
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });
    return;
  }

  act(() => {
    TestRenderer.create(React.createElement(TestComponent));
  });
};

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('getBusQueryConfigKey', () => {
  it('changes when relevant bus configuration changes', () => {
    expect(getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha' })).not.toEqual(
      getBusQueryConfigKey({ uri: 'https://two.example', apiKey: 'alpha' })
    );

    expect(getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha' })).not.toEqual(
      getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'beta' })
    );
  });

  it('stays stable for equal relevant configuration', () => {
    expect(
      getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha', areaId: 1 })
    ).toEqual(getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'alpha', areaId: 2 }));
  });

  it('does not expose the raw api key in the query key', () => {
    const queryKey = getBusQueryConfigKey({ uri: 'https://one.example', apiKey: 'secret-key' });

    expect(queryKey).not.toContain('secret-key');
  });
});

describe('getBusLifeSituationsRootSearchWord', () => {
  it('uses the default root search word when bus settings are missing', () => {
    expect(getBusLifeSituationsRootSearchWord()).toBe(DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD);
    expect(getBusLifeSituationsRootSearchWord({})).toBe(
      DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD
    );
  });

  it('falls back to the default when the configured value is blank after trimming', () => {
    expect(
      getBusLifeSituationsRootSearchWord({
        lifeSituationsRootSearchWord: '   '
      })
    ).toBe(DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD);
  });

  it('returns the trimmed configured root search word when present', () => {
    expect(
      getBusLifeSituationsRootSearchWord({
        lifeSituationsRootSearchWord: '  Eigene Lebenslage  '
      })
    ).toBe('Eigene Lebenslage');
  });
});

describe('useBusLifeSituationsRoot', () => {
  it('calls findBusCategoryRoot with areaId and the default fallback search word when the BUS setting is blank', async () => {
    mockedUseContext.mockReturnValue(
      createSettingsContextValue({
        lifeSituationsRootSearchWord: '   '
      })
    );
    mockEnabledUseQuery();

    await renderHook(() => useBusLifeSituationsRoot('09162000'), true);

    expect(mockedFindBusCategoryRoot).toHaveBeenCalledWith({
      areaId: '09162000',
      bus: {
        lifeSituationsRootSearchWord: '   ',
        uri: 'https://one.example'
      },
      searchWord: DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD
    });
  });

  it('does not enable the life situations root query without areaId', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockIdleUseQuery();

    await renderHook(() => useBusLifeSituationsRoot());

    expect(mockedUseQuery).toHaveBeenCalledWith(
      [
        'bus',
        'life-situations-root',
        undefined,
        DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD,
        'https://one.example::'
      ],
      expect.any(Function),
      expect.objectContaining({ enabled: false })
    );
  });
});

describe('useBusAreas', () => {
  it('separates area search query keys when BUS credentials change', async () => {
    mockedUseContext
      .mockReturnValueOnce(
        createSettingsContextValue({
          apiKey: 'alpha'
        })
      )
      .mockReturnValueOnce(
        createSettingsContextValue({
          apiKey: 'beta'
        })
      );
    mockIdleUseQuery();

    await renderHook(() => {
      useBusAreas('berlin');
      useBusAreas('berlin');
    });

    expect(mockedUseQuery).toHaveBeenNthCalledWith(
      1,
      ['bus', 'areas', 'berlin', 'https://one.example::92909918'],
      expect.any(Function),
      expect.objectContaining({ enabled: true, keepPreviousData: true })
    );
    expect(mockedUseQuery).toHaveBeenNthCalledWith(
      2,
      ['bus', 'areas', 'berlin', 'https://one.example::3020272'],
      expect.any(Function),
      expect.objectContaining({ enabled: true, keepPreviousData: true })
    );
  });

  it('calls the political area search with the current term when enabled', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockEnabledUseQuery();

    await renderHook(() => useBusAreas('berlin'), true);

    expect(mockedSearchPoliticalAreas).toHaveBeenCalledWith({
      bus: {
        uri: 'https://one.example'
      },
      searchTerm: 'berlin'
    });
  });
});

describe('useBusCategoryChildren', () => {
  it('calls findBusCategoryChildren for parentId 0 with areaId', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockEnabledUseQuery();

    await renderHook(() => useBusCategoryChildren(0, '09162000'), true);

    expect(mockedFindBusCategoryChildren).toHaveBeenCalledWith({
      areaId: '09162000',
      bus: {
        uri: 'https://one.example'
      },
      parentId: 0
    });
  });

  it('does not enable category children query without areaId', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockIdleUseQuery();

    await renderHook(() => useBusCategoryChildren('247228741'));

    expect(mockedUseQuery).toHaveBeenCalledWith(
      ['bus', 'category-children', '247228741', undefined, 'https://one.example::'],
      expect.any(Function),
      expect.objectContaining({ enabled: false })
    );
  });

  it('uses distinct query keys for different areaIds on life situations root and children', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockIdleUseQuery();

    await renderHook(() => {
      useBusLifeSituationsRoot('09162000');
      useBusLifeSituationsRoot('06414000');
      useBusCategoryChildren('247228741', '09162000');
      useBusCategoryChildren('247228741', '06414000');
    });

    expect(mockedUseQuery).toHaveBeenNthCalledWith(
      1,
      [
        'bus',
        'life-situations-root',
        '09162000',
        DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD,
        'https://one.example::'
      ],
      expect.any(Function),
      expect.objectContaining({ enabled: true })
    );
    expect(mockedUseQuery).toHaveBeenNthCalledWith(
      2,
      [
        'bus',
        'life-situations-root',
        '06414000',
        DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD,
        'https://one.example::'
      ],
      expect.any(Function),
      expect.objectContaining({ enabled: true })
    );
    expect(mockedUseQuery).toHaveBeenNthCalledWith(
      3,
      ['bus', 'category-children', '247228741', '09162000', 'https://one.example::'],
      expect.any(Function),
      expect.objectContaining({ enabled: true })
    );
    expect(mockedUseQuery).toHaveBeenNthCalledWith(
      4,
      ['bus', 'category-children', '247228741', '06414000', 'https://one.example::'],
      expect.any(Function),
      expect.objectContaining({ enabled: true })
    );
  });
});

describe('useBusServices', () => {
  it('requests the first paginated BUS service page for the selected area', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockEnabledUseInfiniteQuery();

    await renderHook(() => useBusServices('09162000'), true);

    expect(mockedFindPublicServicesPage).toHaveBeenCalledWith({
      areaId: '09162000',
      bus: {
        uri: 'https://one.example'
      },
      limit: 500,
      offset: 0
    });
    expect(mockedUseInfiniteQuery).toHaveBeenCalledWith(
      ['bus', 'services', '09162000', 'https://one.example::'],
      expect.any(Function),
      expect.objectContaining({
        enabled: true,
        retry: 0
      })
    );
  });

  it('flattens accumulated BUS service pages and keeps them sorted by name', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockIdleUseInfiniteQuery([
      {
        items: [
          { id: '2', name: 'Zweiter Dienst' },
          { id: '1', name: 'Alpha Dienst' }
        ],
        totalItemCount: 4
      },
      {
        items: [{ id: '3', name: 'Mitte Dienst' }],
        totalItemCount: 4
      }
    ]);

    let result;
    await renderHook(() => {
      result = useBusServices('09162000');
    });

    expect(result?.data).toEqual([
      { id: '1', name: 'Alpha Dienst' },
      { id: '3', name: 'Mitte Dienst' },
      { id: '2', name: 'Zweiter Dienst' }
    ]);
  });

  it('exposes BUS service pagination errors to the UI layer', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockedUseInfiniteQuery.mockReturnValue({
      ...createUseInfiniteQueryResult(),
      error: new Error('timeout'),
      isError: true
    } as never);

    let result;
    await renderHook(() => {
      result = useBusServices('09162000');
    });

    expect(result?.isError).toBe(true);
    expect(result?.error).toEqual(expect.any(Error));
  });
});

describe('useBusServiceSearch', () => {
  it('does not enable backend BUS search below the minimum search length', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockIdleUseInfiniteQuery();

    await renderHook(() => useBusServiceSearch('09162000', 'ab'));

    expect(mockedUseInfiniteQuery).toHaveBeenCalledWith(
      ['bus', 'service-search', '09162000', 'ab', 'https://one.example::'],
      expect.any(Function),
      expect.objectContaining({ enabled: false })
    );
  });

  it('requests backend BUS search pages with the current search term', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockEnabledUseInfiniteQuery();

    await renderHook(() => useBusServiceSearch('09162000', 'unternehmen'), true);

    expect(mockedFindPublicServicesPage).toHaveBeenCalledWith({
      areaId: '09162000',
      bus: {
        uri: 'https://one.example'
      },
      limit: 500,
      offset: 0,
      searchWord: 'unternehmen'
    });
    expect(mockedUseInfiniteQuery).toHaveBeenCalledWith(
      ['bus', 'service-search', '09162000', 'unternehmen', 'https://one.example::'],
      expect.any(Function),
      expect.objectContaining({
        enabled: true,
        retry: 0
      })
    );
  });

  it('exposes backend BUS search errors to the UI layer', async () => {
    mockedUseContext.mockReturnValue(createSettingsContextValue());
    mockedUseInfiniteQuery.mockReturnValue({
      ...createUseInfiniteQueryResult(),
      error: new Error('timeout'),
      isError: true
    } as never);

    let result;
    await renderHook(() => {
      result = useBusServiceSearch('09162000', 'unternehmen');
    });

    expect(result?.isError).toBe(true);
    expect(result?.error).toEqual(expect.any(Error));
  });
});
