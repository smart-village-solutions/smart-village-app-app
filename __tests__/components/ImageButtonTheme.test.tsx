import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => ({ navigate: jest.fn() })
}));

jest.mock('../../src/config', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    Icon: {
      Plus: (props: object) => ReactLocal.createElement('mock-plus-icon', props)
    },
    lightColors: {},
    normalize: (value: number) => value
  };
});

jest.mock('../../src/helpers', () => ({
  navigateToRoute: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    SUE: {
      MY_REQUESTS: 'myRequests'
    }
  }
}));

jest.mock('../../src/queries/SUE', () => ({
  myRequests: jest.fn().mockResolvedValue([])
}));

jest.mock('../../src/components/Button', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    Button: ({ icon }: { icon?: React.ReactNode }) =>
      ReactLocal.createElement('mock-button', null, icon)
  };
});

jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }: { children?: React.ReactNode }) => children
}));

import { ThemeContext } from '../../src/ThemeContext';
import { ImageButton, TImageButton } from '../../src/components/ImageButton';

const button: TImageButton = {
  iconName: 'Plus',
  params: {},
  routeName: 'SueReport',
  style: {
    iconColor: '#FFFFFF',
    iconPosition: 'right',
    dark: {
      iconColor: '#141414'
    }
  },
  title: 'Etwas melden'
};

const renderImageButton = (mode: 'light' | 'dark') => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={{ colors: {} as never, isDark: mode === 'dark', mode }}>
        <ImageButton button={button} />
      </ThemeContext.Provider>
    );
  });

  return tree!;
};

describe('ImageButton theme overrides', () => {
  it('uses the root icon color in light mode', () => {
    const tree = renderImageButton('light');

    expect(tree.root.findByType('mock-plus-icon').props.color).toBe('#FFFFFF');
  });

  it('uses the configured dark icon color in dark mode', () => {
    const tree = renderImageButton('dark');

    expect(tree.root.findByType('mock-plus-icon').props.color).toBe('#141414');
  });
});
