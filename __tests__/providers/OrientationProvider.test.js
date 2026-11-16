import React, { useContext } from 'react';
import { Dimensions } from 'react-native';
import renderer from 'react-test-renderer';

import { OrientationContext, OrientationProvider } from '../../src/OrientationProvider';

describe('OrientationProvider', () => {
  const observe = jest.fn();
  const current = () => observe.mock.calls[observe.mock.calls.length - 1][0];
  let dimensions;
  let onChange;
  let tree;
  const remove = jest.fn();
  const Observer = () => {
    observe(useContext(OrientationContext));
    return null;
  };
  const mount = () => {
    renderer.act(() => {
      tree = renderer.create(
        <OrientationProvider>
          <Observer />
        </OrientationProvider>
      );
    });
  };
  const rotate = (width, height) => {
    dimensions = { window: { width, height }, screen: { width, height } };
    renderer.act(() => onChange(dimensions));
  };

  beforeEach(() => {
    dimensions = {
      window: { width: 402, height: 874 },
      screen: { width: 402, height: 874 }
    };
    jest.spyOn(Dimensions, 'get').mockImplementation((name) => dimensions[name]);
    jest.spyOn(Dimensions, 'addEventListener').mockImplementation((_event, listener) => {
      onChange = listener;
      return { remove };
    });
    remove.mockClear();
  });

  afterEach(() => {
    renderer.act(() => tree.unmount());
    expect(remove).toHaveBeenCalledTimes(1);
    jest.restoreAllMocks();
  });

  it('reads the current orientation at mount, even if it changed after module loading', () => {
    dimensions = {
      window: { width: 874, height: 402 },
      screen: { width: 874, height: 402 }
    };
    mount();
    expect(current()).toEqual({
      orientation: 'landscape',
      dimensions: { width: 874, height: 402 }
    });
    rotate(402, 874);
    expect(current()).toEqual({
      orientation: 'portrait',
      dimensions: { width: 402, height: 874 }
    });
  });

  it('updates orientation and dimensions together on repeated rotations', () => {
    mount();
    rotate(874, 402);
    expect(current().orientation).toBe('landscape');
    expect(current().dimensions.width).toBe(874);
    rotate(402, 874);
    expect(current().orientation).toBe('portrait');
    expect(current().dimensions.width).toBe(402);
  });

  it('keeps portrait orientation when the Android keyboard reduces window height', () => {
    mount();
    dimensions = {
      screen: { width: 402, height: 874 },
      window: { width: 402, height: 300 }
    };
    renderer.act(() => onChange(dimensions));
    expect(current().orientation).toBe('portrait');
    expect(current().dimensions).toEqual({ width: 402, height: 300 });
  });
});
