/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import renderer from 'react-test-renderer';

import { TabBarIcon } from '../../src/components/TabBarIcon';

jest.mock('react-native', () => ({
  StyleSheet: { create: (styles) => styles },
  View: 'View'
}));

jest.mock('../../src/components/OrientationAwareIcon', () => {
  const React = require('react');

  return {
    OrientationAwareIcon: ({ Icon, iconName, ...props }) =>
      React.createElement(Icon, { ...props, iconName, name: iconName })
  };
});

jest.mock('../../src/config', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Home = (props) => React.createElement(View, { ...props, testID: 'named-Home' });
  const NamedIcon = ({ name, ...props }) =>
    React.createElement(View, { ...props, testID: `named-${name}` });
  const IconUrl = ({ iconName, ...props }) =>
    React.createElement(View, { ...props, testID: `svg-${iconName}` });

  return {
    Icon: { Home, NamedIcon },
    IconUrl,
    normalize: (value) => value
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Image: ({ source, ...props }) =>
      React.createElement(View, { ...props, testID: `image-${source.uri}` })
  };
});

const themeColors = {
  primary: '#112233',
  surface: '#fefefe'
};

const renderTabBarIcon = (props) => {
  let component;

  renderer.act(() => {
    component = renderer.create(
      <TabBarIcon
        color="#123456"
        focused={false}
        themeColors={themeColors as never}
        themeMode="light"
        {...props}
      />
    );
  });

  return component;
};

describe('TabBarIcon', () => {
  it('renders existing named icon configurations with their icon library', () => {
    const component = renderTabBarIcon({ iconName: 'Home', iconSet: 'ionicons' });
    const icon = component.root.findByProps({ testID: 'named-Home' });

    expect(icon.props.iconSet).toBe('ionicons');
  });

  it('renders a theme-aware remote SVG source', () => {
    const component = renderTabBarIcon({ svg: 'service' });
    const icon = component.root.findByProps({ testID: 'svg-service' });

    expect(icon.props.color).toBe('#123456');
    expect(icon.props.isMonochrome).toBe(true);
  });

  it('applies fill-on-focus colors to remote SVG sources', () => {
    const component = renderTabBarIcon({ svg: 'service', tabBarIconFillOnFocus: true });
    const icon = component.root.findByProps({ testID: 'svg-service' });

    expect(icon.props.fillColor).toBe('transparent');
    expect(icon.props.strokeColor).toBe('#123456');
  });

  it('renders a decorative remote image source', () => {
    const component = renderTabBarIcon({ icon: 'https://example.org/service.png' });
    const image = component.root.findByProps({
      testID: 'image-https://example.org/service.png'
    });

    expect(image.props.accessible).toBe(false);
  });

  it('renders the raster image configured for the active theme mode', () => {
    const component = renderTabBarIcon({
      activeIcon: 'https://example.org/service-active-light.png',
      focused: true,
      icon: 'https://example.org/service-light.png',
      themeImages: {
        dark: {
          activeIcon: 'https://example.org/service-active-dark.png',
          icon: 'https://example.org/service-dark.png'
        }
      },
      themeMode: 'dark'
    });

    expect(
      component.root.findByProps({
        testID: 'image-https://example.org/service-active-dark.png'
      })
    ).toBeTruthy();
  });

  it('renders a themed fallback when a remote image fails', () => {
    const component = renderTabBarIcon({ icon: 'https://example.org/missing.png' });
    const image = component.root.findByProps({
      testID: 'image-https://example.org/missing.png'
    });

    renderer.act(() => image.props.onError());

    const fallback = component.root.findByProps({ testID: 'named-photo-off' });

    expect(fallback.props.color).toBe('#123456');
  });

  it('renders the active source while focused', () => {
    const component = renderTabBarIcon({
      activeSvg: 'service-active',
      focused: true,
      iconName: 'Home'
    });

    expect(component.root.findByProps({ testID: 'svg-service-active' })).toBeTruthy();
  });

  it('uses semantic theme colors for a highlighted tab', () => {
    const component = renderTabBarIcon({ iconName: 'Home', isHighlightedTab: true });
    const icon = component.root.findByProps({ testID: 'named-Home' });
    const wrapper = component.root.findByProps({
      importantForAccessibility: 'no-hide-descendants'
    });

    expect(icon.props.color).toBe(themeColors.surface);
    expect(icon.props.fillColor).toBe(themeColors.surface);
    expect(icon.props.strokeColor).toBe(themeColors.surface);
    expect(wrapper.props.style).toContainEqual({ backgroundColor: themeColors.primary });
  });

  it('hides icon visuals from screen readers because the tab button owns the label', () => {
    const component = renderTabBarIcon({ iconName: 'Home' });
    const wrapper = component.root.findByProps({
      importantForAccessibility: 'no-hide-descendants'
    });

    expect(wrapper.props.accessible).toBe(false);
    expect(wrapper.props.accessibilityElementsHidden).toBe(true);
  });

  it('renders a fallback when no source is configured', () => {
    const component = renderTabBarIcon({});

    expect(component.root.findByProps({ testID: 'named-question-mark' })).toBeTruthy();
  });
});
