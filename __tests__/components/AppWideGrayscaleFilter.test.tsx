import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import renderer from 'react-test-renderer';

import { AppWideGrayscaleFilter } from '../../src/components/AppWideGrayscaleFilter';

const mountSpy = jest.fn();
const unmountSpy = jest.fn();

const Probe = () => {
  useEffect(() => {
    mountSpy();

    return () => {
      unmountSpy();
    };
  }, []);

  return null;
};

describe('AppWideGrayscaleFilter', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    mountSpy.mockClear();
    unmountSpy.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('does not remount children when grayscale mode toggles', () => {
    let testRenderer: renderer.ReactTestRenderer;

    renderer.act(() => {
      testRenderer = renderer.create(
        <AppWideGrayscaleFilter isGrayscaleEnabled={false}>
          <Probe />
        </AppWideGrayscaleFilter>
      );
    });

    expect(mountSpy).toHaveBeenCalledTimes(1);
    expect(unmountSpy).toHaveBeenCalledTimes(0);

    renderer.act(() => {
      testRenderer!.update(
        <AppWideGrayscaleFilter isGrayscaleEnabled>
          <Probe />
        </AppWideGrayscaleFilter>
      );
    });

    expect(mountSpy).toHaveBeenCalledTimes(1);
    expect(unmountSpy).toHaveBeenCalledTimes(0);
  });

  it('applies the native descendant grayscale filter on Android', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(
        <AppWideGrayscaleFilter isGrayscaleEnabled>
          <View />
        </AppWideGrayscaleFilter>
      );
    });

    expect(StyleSheet.flatten(tree!.root.findAllByType(View)[0].props.style)).toMatchObject({
      filter: [{ grayscale: 1 }]
    });
  });

  it('does not render an unsupported blend overlay on iOS', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(
        <AppWideGrayscaleFilter isGrayscaleEnabled>
          <View />
        </AppWideGrayscaleFilter>
      );
    });

    expect(tree!.root.findAllByType(View)).toHaveLength(3);
  });
});
