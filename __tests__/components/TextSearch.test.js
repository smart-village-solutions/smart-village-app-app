import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { TextSearch } from '../../src/components/BUS/TextSearch';

const mockSearchBar = jest.fn(() => null);

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
  normalize: (value) => value,
  texts: {
    accessibilityLabels: {
      searchInputIcons: {
        delete: 'Delete',
        search: 'Search'
      }
    }
  }
}));

jest.mock('../../src/components/Label', () => {
  return {
    Label: ({ children }) => children
  };
});

jest.mock('../../src/components/Wrapper', () => {
  return {
    WrapperHorizontal: ({ children }) => children
  };
});

jest.mock('react-native-elements', () => ({
  SearchBar: (props) => mockSearchBar(props)
}));

describe('TextSearch', () => {
  beforeEach(() => {
    mockSearchBar.mockClear();
  });

  it('passes render functions for SearchBar icons', () => {
    let testRenderer;

    act(() => {
      testRenderer = renderer.create(
        <TextSearch data="" setData={jest.fn()} label="Label" placeholder="Search here" />
      );
    });

    const searchBarProps = mockSearchBar.mock.calls[0][0];

    expect(typeof searchBarProps.searchIcon).toBe('function');
    expect(typeof searchBarProps.clearIcon).toBe('function');

    act(() => {
      testRenderer.unmount();
    });
  });
});
