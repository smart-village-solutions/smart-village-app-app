/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { TextListItem } from '../../src/components/TextListItem';

jest.mock('../../src/helpers', () => ({
  isOpen: () => ({ open: true }),
  trimNewLines: (value: string) => value
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => {
    const { View: MockView } = require('react-native');

    return <MockView />;
  }
}));

describe('TextListItem key warnings', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders multiple list item children without React key warnings', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <TextListItem
          item={{
            id: 'shop',
            leftIcon: <View />,
            params: {},
            routeName: 'Home',
            teaserTitle: 'Shop',
            title: 'Shop'
          }}
          navigation={undefined as never}
        />
      );
    });

    const keyWarnings = consoleErrorSpy.mock.calls.filter(([message]) =>
      String(message).includes('Each child in a list should have a unique "key" prop')
    );

    expect(keyWarnings).toHaveLength(0);

    act(() => {
      tree!.unmount();
    });
  });
});
