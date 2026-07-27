/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer from 'react-test-renderer';

import { darkColors, lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';
import {
  renderThemeAwareBottomTabBar,
  ThemeAwareBottomTabBar
} from '../../src/navigation/ThemeAwareBottomTabBar';

const mockMount = jest.fn();
const mockUnmount = jest.fn();

jest.mock('@react-navigation/bottom-tabs', () => {
  const ReactLocal = require('react');

  return {
    BottomTabBar: () => {
      ReactLocal.useEffect(() => {
        mockMount();

        return () => {
          mockUnmount();
        };
      }, []);

      return ReactLocal.createElement('mock-bottom-tab-bar');
    }
  };
});

const theme = (mode: 'light' | 'dark') => ({
  colors: mode === 'dark' ? darkColors : lightColors,
  isDark: mode === 'dark',
  mode
});

describe('ThemeAwareBottomTabBar', () => {
  beforeEach(() => {
    mockMount.mockClear();
    mockUnmount.mockClear();
  });

  it('provides a hook-free render callback for React Navigation', () => {
    const renderedElement = renderThemeAwareBottomTabBar({} as never);

    expect(renderedElement.type).toBe(ThemeAwareBottomTabBar);
  });

  it('recreates only the visual tab bar when the resolved theme changes', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <ThemeContext.Provider value={theme('light')}>
          <ThemeAwareBottomTabBar {...({} as never)} />
        </ThemeContext.Provider>
      );
    });

    expect(mockMount).toHaveBeenCalledTimes(1);
    expect(mockUnmount).not.toHaveBeenCalled();

    renderer.act(() => {
      tree!.update(
        <ThemeContext.Provider value={theme('dark')}>
          <ThemeAwareBottomTabBar {...({} as never)} />
        </ThemeContext.Provider>
      );
    });

    expect(mockMount).toHaveBeenCalledTimes(2);
    expect(mockUnmount).toHaveBeenCalledTimes(1);
  });
});
