import React, { useEffect } from 'react';
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
  beforeEach(() => {
    mountSpy.mockClear();
    unmountSpy.mockClear();
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
});
