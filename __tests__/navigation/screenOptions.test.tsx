/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer from 'react-test-renderer';

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

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#107821',
      surface: '#FFFFFF'
    }
  })
}));

import { getScreenOptions } from '../../src/navigation/screenOptions';

const renderHeaderBackground = (
  config: Parameters<typeof getScreenOptions>[0] = {}
): renderer.ReactTestRenderer => {
  const options = getScreenOptions(config)({ navigation: {} as never, route: {} as never });
  const HeaderBackground = options.headerBackground as () => React.ReactElement;
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(<HeaderBackground />);
  });

  return tree!;
};

describe('getScreenOptions status bar', () => {
  it('uses the theme surface for the default header', () => {
    const tree = renderHeaderBackground();

    expect(tree.root.findByType('mock-app-status-bar' as never).props.backgroundColor).toBe(
      '#FFFFFF'
    );
  });

  it('supports theme-aware header colors and explicit status bar overrides', () => {
    const tree = renderHeaderBackground({
      headerBackgroundColor: (colors) => colors.primary,
      headerStatusBarStyle: () => 'light-content'
    });
    const statusBar = tree.root.findByType('mock-app-status-bar' as never);

    expect(statusBar.props.backgroundColor).toBe('#107821');
    expect(statusBar.props.barStyle).toBe('light-content');
  });
});
