/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

const mockNavigateToRoute = jest.fn();

jest.mock('../../src/config', () => ({
  consts: {
    a11yLabel: {
      button: '(Taste)',
      imageCarousel: 'Bilderkarussell'
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  navigateToRoute: (args: object) => mockNavigateToRoute(args)
}));

jest.mock('../../src/components/Image', () => {
  const ReactLocal = require('react');

  return {
    Image: (props: object) => ReactLocal.createElement('mock-image', props)
  };
});

import { ImagesCarouselItem } from '../../src/components/ImagesCarouselItem';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('ImagesCarouselItem accessibility', () => {
  beforeEach(() => {
    mockNavigateToRoute.mockClear();
  });

  it('uses the destination label on a linked slide and hides the nested image', () => {
    const navigation = {};
    const params = { url: 'https://example.com/careers' };
    const tree = renderWithAct(
      <ImagesCarouselItem
        navigation={navigation}
        source={{
          accessibilityLabel: 'Karriereportal öffnen',
          captionText: 'Menschen vor einem Bürogebäude',
          params,
          routeName: 'Web',
          uri: 'https://example.com/careers.jpg'
        }}
      />
    );

    const button = tree.root.findByType(TouchableOpacity);
    const image = tree.root.findByType('mock-image');

    expect(button.props.accessible).toBe(true);
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Karriereportal öffnen (Taste)');
    expect(image.props.accessible).toBe(false);

    renderer.act(() => button.props.onPress());

    expect(mockNavigateToRoute).toHaveBeenCalledWith({
      navigation,
      params,
      routeName: 'Web',
      targetTabIndex: undefined
    });
  });

  it('keeps captionText as a fallback for existing linked slides', () => {
    const tree = renderWithAct(
      <ImagesCarouselItem
        navigation={{}}
        source={{
          captionText: 'Beteiligungsportal öffnen',
          params: { title: 'Beteiligung' },
          routeName: 'Index',
          uri: 'https://example.com/participation.jpg'
        }}
      />
    );

    expect(tree.root.findByType(TouchableOpacity).props.accessibilityLabel).toBe(
      'Beteiligungsportal öffnen (Taste)'
    );
  });
});
