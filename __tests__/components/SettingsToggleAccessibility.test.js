import React from 'react';
import renderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  const ListItem = (props) => ReactLocal.createElement('mock-list-item', props, props.children);
  ListItem.Content = (props) =>
    ReactLocal.createElement('mock-list-item-content', props, props.children);

  return { ListItem };
});

jest.mock('../../src/config', () => ({
  colors: {
    refreshControl: '#107821',
    transparent: 'transparent'
  },
  consts: {
    a11yLabel: {
      button: '(Taste)'
    }
  },
  device: {
    isTablet: false
  },
  Icon: {
    NamedIcon: 'mock-named-icon'
  },
  normalize: (value) => value,
  texts: {
    errors: {
      noData: 'Keine Daten'
    }
  }
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({
      isReduceTransparencyEnabled: false
    })
  };
});

jest.mock('../../src/NetworkProvider', () => {
  const ReactLocal = require('react');

  return {
    NetworkContext: ReactLocal.createContext({
      isConnected: true
    })
  };
});

jest.mock('../../src/pushNotifications', () => ({
  serverConnectionAlert: jest.fn()
}));

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      gray20: '#F2F2F7',
      gray40: '#DBDBE6',
      gray60: '#BCBBC1',
      border: '#C5C5CC',
      onPrimary: '#FFFFFF',
      overlayRgba: 'rgba(0, 0, 0, 0.7)',
      primary: '#107821',
      refreshControl: '#107821',
      shadow: '#858585',
      text: '#141414',
      transparent: 'transparent'
    }
  })
}));

jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }) => children,
  RegularText: ({ children }) => children
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperRow: ({ children, style }) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-wrapper-row', { style }, children);
  }
}));

jest.mock('../../src/components/Touchable', () => ({
  Touchable: 'mock-touchable'
}));

import { SettingsToggle } from '../../src/components/SettingsToggle';

const renderWithAct = (component) => {
  let testRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer;
};

describe('SettingsToggle accessibility', () => {
  it('keeps the row out of the a11y tree and exposes the switch as the named control', () => {
    const tree = renderWithAct(
      <SettingsToggle
        needsConnection={false}
        item={{
          title: 'Filtereinstellungen dauerhaft speichern',
          value: false
        }}
      />
    );

    const row = tree.root.findByType('mock-list-item');
    const switchNode = tree.root.findByProps({ accessibilityRole: 'switch' });

    expect(row.props.accessible).toBe(false);
    expect(row.props.importantForAccessibility).toBe('no');
    expect(row.props.accessibilityLabel).toBeUndefined();
    expect(switchNode.props.accessibilityLabel).toBe('Filtereinstellungen dauerhaft speichern');
  });

  it('reserves a fixed loading slot next to the switch to avoid text shifting', () => {
    const tree = renderWithAct(
      <SettingsToggle
        needsConnection={false}
        item={{
          title: 'Graustufenmodus',
          value: false
        }}
      />
    );

    const loadingSlot = tree.root.findAll(
      (node) =>
        node.props.color === '#107821' &&
        Array.isArray(node.props.style) &&
        node.props.style.some((style) => style?.width === 18)
    )[0];

    expect(loadingSlot).toBeDefined();
  });

  it('preserves the compact control gap while the loading indicator is visible', () => {
    jest.useFakeTimers();
    const tree = renderWithAct(
      <SettingsToggle needsConnection={false} item={{ title: 'Test option', value: false }} />
    );
    const loadingStyle = () =>
      StyleSheet.flatten(
        tree.root.findAll(
          (node) =>
            node.props.color === '#107821' &&
            Array.isArray(node.props.style) &&
            node.props.style.some((style) => style?.width === 18)
        )[0].props.style
      );
    const controlsStyle = () =>
      tree.root
        .findAllByType('mock-wrapper-row')
        .map((node) => StyleSheet.flatten(node.props.style))
        .find((style) => style?.columnGap !== undefined);

    try {
      expect(controlsStyle().columnGap).toBe(8);
      expect(loadingStyle().opacity).toBe(0);
      renderer.act(() => tree.root.findByType('mock-list-item').props.onPress());
      expect(loadingStyle().opacity).toBeUndefined();
      expect(loadingStyle().width).toBe(18);
      expect(loadingStyle().marginRight).toBeUndefined();
      expect(controlsStyle().columnGap).toBe(8);
      renderer.act(() => jest.advanceTimersByTime(1300));
      expect(loadingStyle().opacity).toBe(0);
    } finally {
      renderer.act(() => tree.unmount());
      jest.useRealTimers();
    }
  });

  it('forwards the permanent switch-label preview to the switch control', () => {
    const tree = renderWithAct(
      <SettingsToggle
        needsConnection={false}
        item={{
          showSwitchLabels: true,
          title: 'Ein/Aus-Kennzeichnungen',
          value: false
        }}
      />
    );

    expect(tree.root.findByProps({ testID: 'switch-state-off' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'switch-off-circle' })).toBeTruthy();
  });
});
