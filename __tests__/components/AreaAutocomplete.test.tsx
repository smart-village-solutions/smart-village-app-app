import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { AreaAutocomplete } from '../../src/components/BUS/AreaAutocomplete';

type AutocompleteMockProps = {
  renderTextInput?: () => React.ReactNode;
};

const mockSearchBar = jest.fn(() => null);
const mockUseBusAreas = jest.fn();

jest.mock('../../src/config', () => ({
  colors: {
    primary: '#123456',
    darkText: '#222222',
    backgroundRgba: 'rgba(0,0,0,0.1)',
    borderRgba: 'rgba(0,0,0,0.2)',
    transparent: 'transparent'
  },
  consts: {
    a11yLabel: {
      button: '(button)'
    }
  },
  Icon: {
    Close: () => null,
    Search: () => null
  },
  normalize: (value: number) => value,
  texts: {
    accessibilityLabels: {
      searchInputIcons: {
        delete: 'Delete',
        search: 'Search'
      }
    },
    bus: {
      locationFilter: {
        label: 'Ort',
        searchPlaceholder: 'Ort suchen',
        error: 'Fehler',
        loading: 'Laedt',
        noResults: 'Keine Orte gefunden',
        minSearchLength: 'Mindestens 3 Zeichen',
        resetTo: (label: string) => `Zurueck zu ${label}`
      }
    }
  }
}));

jest.mock('../../src/hooks', () => ({
  useBusAreas: (...args: unknown[]) => mockUseBusAreas(...args)
}));

jest.mock('../../src/components/Label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => children
}));

jest.mock('../../src/components/Text', () => ({
  RegularText: ({ children }: { children: React.ReactNode }) => children
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperHorizontal: ({ children }: { children: React.ReactNode }) => children,
  WrapperRow: ({ children }: { children: React.ReactNode }) => children
}));

jest.mock('react-native-autocomplete-input', () => (props: AutocompleteMockProps) => {
  const ReactLocal = jest.requireActual('react');
  return ReactLocal.createElement(
    'Autocomplete',
    props,
    typeof props.renderTextInput === 'function' ? props.renderTextInput() : null
  );
});

jest.mock('react-native-elements', () => ({
  SearchBar: (props: unknown) => mockSearchBar(props)
}));

describe('AreaAutocomplete', () => {
  let testRenderer;

  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchBar.mockClear();
    mockUseBusAreas.mockReset();
    mockUseBusAreas.mockReturnValue({
      data: [],
      hasBusConfig: true,
      isError: false,
      isFetching: false,
      isLoading: false
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    if (testRenderer) {
      act(() => {
        testRenderer.unmount();
      });
      testRenderer = undefined;
    }
    jest.useRealTimers();
  });

  it('debounces area search input before updating the BUS query term', () => {
    act(() => {
      testRenderer = renderer.create(
        <AreaAutocomplete
          areaId="1"
          areaName=""
          initialAreaId="1"
          initialAreaName="Testort"
          onSelectArea={jest.fn()}
        />
      );
    });

    const initialCallCount = mockUseBusAreas.mock.calls.length;
    const searchBarProps = mockSearchBar.mock.calls[mockSearchBar.mock.calls.length - 1][0];

    act(() => {
      searchBarProps.onChangeText('Dessau-R');
    });

    expect(mockUseBusAreas).toHaveBeenCalledTimes(initialCallCount + 1);
    expect(mockUseBusAreas).toHaveBeenLastCalledWith('', false);

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(mockUseBusAreas).toHaveBeenCalledTimes(initialCallCount + 2);
    expect(mockUseBusAreas).toHaveBeenLastCalledWith('Dessau-R', expect.any(Boolean));
  });

  it('shows the reset icon on initial mount when an area is already prefilled', () => {
    act(() => {
      testRenderer = renderer.create(
        <AreaAutocomplete
          areaId="1"
          areaName="Bad Belzig"
          initialAreaId="1"
          initialAreaName="Bad Belzig"
          onSelectArea={jest.fn()}
        />
      );
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const searchBarProps = mockSearchBar.mock.calls[mockSearchBar.mock.calls.length - 1][0];

    expect(searchBarProps.value).toBe('Bad Belzig');
    expect(mockSearchBar.mock.calls.length).toBeGreaterThan(1);
    expect(searchBarProps.clearIcon).toBeTruthy();
  });

  it('clears the debounced query term immediately when the selection is reset', () => {
    act(() => {
      testRenderer = renderer.create(
        <AreaAutocomplete
          areaId="1"
          areaName="Bad Belzig"
          initialAreaId="1"
          initialAreaName="Bad Belzig"
          onSelectArea={jest.fn()}
        />
      );
    });

    let searchBarProps = mockSearchBar.mock.calls[mockSearchBar.mock.calls.length - 1][0];

    act(() => {
      searchBarProps.onChangeText('Dessau-R');
    });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(mockUseBusAreas).toHaveBeenLastCalledWith('Dessau-R', expect.any(Boolean));

    searchBarProps = mockSearchBar.mock.calls[mockSearchBar.mock.calls.length - 1][0];
    const clearIcon = searchBarProps.clearIcon();

    act(() => {
      clearIcon.props.clearSelection();
    });

    expect(mockUseBusAreas).toHaveBeenLastCalledWith('', false);
  });
});
