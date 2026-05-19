jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}));

jest.mock('react-query', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../src/queries/bus', () => ({
  findBusCategoryChildren: jest.fn(),
  findBusCategoryRoot: jest.fn(),
  findPublicServices: jest.fn(),
  getPublicService: jest.fn()
}));

jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: {}
}));

jest.mock('../../src/hooks/staticContent', () => ({
  useStaticContent: jest.fn()
}));

import * as React from 'react';
import { useQuery } from 'react-query';
import TestRenderer, { act } from 'react-test-renderer';

import {
  DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD,
  getBusLifeSituationsRootSearchWord,
  getBusQueryConfigKey,
  useBusCategoryChildren,
  useBusLifeSituationsRoot
} from '../../src/hooks/bus';
import { findBusCategoryChildren, findBusCategoryRoot } from '../../src/queries/bus';

const mockedUseContext = jest.mocked(React.useContext);
const mockedUseQuery = jest.mocked(useQuery);
const mockedFindBusCategoryChildren = jest.mocked(findBusCategoryChildren);
const mockedFindBusCategoryRoot = jest.mocked(findBusCategoryRoot);
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
  }) as never;

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
