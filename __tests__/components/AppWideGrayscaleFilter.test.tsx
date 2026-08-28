import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import renderer from 'react-test-renderer';

import { setIosGrayscaleCompositorEnabled } from '../../modules/grayscale-compositor';
import { AppWideGrayscaleFilter } from '../../src/components/AppWideGrayscaleFilter';

jest.mock('../../modules/grayscale-compositor', () => {
  return {
    setIosGrayscaleCompositorEnabled: jest.fn(() => Promise.resolve())
  };
});

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
    jest.mocked(setIosGrayscaleCompositorEnabled).mockClear();
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
    expect(
      tree!.root.findAllByType(View).filter((view) => view.props.pointerEvents === 'none')
    ).toHaveLength(0);
  });

  it('updates the window-level native compositor on iOS', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(
        <AppWideGrayscaleFilter isGrayscaleEnabled>
          <View />
        </AppWideGrayscaleFilter>
      );
    });

    expect(StyleSheet.flatten(tree!.root.findAllByType(View)[0].props.style)).not.toHaveProperty(
      'filter'
    );
    expect(setIosGrayscaleCompositorEnabled).toHaveBeenCalledWith(true);
  });

  it.each(['android', 'ios'])('does not apply grayscale rendering on %s while disabled', (os) => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: os });

    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(
        <AppWideGrayscaleFilter isGrayscaleEnabled={false}>
          <View />
        </AppWideGrayscaleFilter>
      );
    });

    const views = tree!.root.findAllByType(View);

    expect(StyleSheet.flatten(views[0].props.style)).not.toHaveProperty('filter');
    expect(StyleSheet.flatten(views[0].props.style)).not.toHaveProperty('isolation');

    if (os === 'ios') {
      expect(setIosGrayscaleCompositorEnabled).toHaveBeenCalledWith(false);
    } else {
      expect(setIosGrayscaleCompositorEnabled).not.toHaveBeenCalled();
    }
  });
});
