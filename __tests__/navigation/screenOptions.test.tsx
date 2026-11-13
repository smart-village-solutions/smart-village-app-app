/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer from 'react-test-renderer';
import type { StackHeaderProps } from 'expo-router/build/react-navigation/stack';

jest.mock('../../src/components', () => {
  const ReactLocal = require('react');

  return {
    AppStatusBar: (props: object) => ReactLocal.createElement('mock-app-status-bar', props),
    DiagonalGradient: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLocal.createElement('mock-gradient', props, children),
    FavoritesHeader: () => null,
    HeaderLeft: () => null,
    HeaderRight: () => null
  };
});

jest.mock('../../src/config', () => ({
  normalize: (value: number) => value
}));

jest.mock('../../src/components/NavigationHeader', () => ({
  NavigationHeader: (props: object) =>
    require('react').createElement('mock-navigation-header', props)
}));

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#107821',
      surface: '#FFFFFF'
    }
  })
}));

import { getScreenOptions } from '../../src/navigation/screenOptions';

const renderConfiguredHeader = (config: Parameters<typeof getScreenOptions>[0] = {}) => {
  const options = getScreenOptions(config)({ navigation: {} as never, route: {} as never });
  const Header = options.header!;
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(<Header {...({ options } as StackHeaderProps)} />);
  });
  return tree!.root.findByType('mock-navigation-header' as never);
};

describe('getScreenOptions shared header', () => {
  it('delegates default appearance to the shared navigation header', () => {
    const header = renderConfiguredHeader();
    expect(header.props.headerBackgroundColor).toBeUndefined();
    expect(header.props.options.headerTitleStyle.color).toBeUndefined();
  });

  it('passes app branding and explicit status bar preferences to the shared header', () => {
    const background = (colors: { primary: string }) => colors.primary;
    const header = renderConfiguredHeader({
      headerBackgroundColor: background,
      headerStatusBarStyle: 'light-content'
    });
    expect(header.props.headerBackgroundColor).toBe(background);
    expect(header.props.headerStatusBarStyle).toBe('light-content');
  });
});
