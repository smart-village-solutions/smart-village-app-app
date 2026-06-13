import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { CardListItem } from '../../src/components/CardListItem';

jest.mock('../../src/helpers', () => ({
  imageHeight: () => 100,
  imageWidth: () => 100,
  momentFormat: (value) => value,
  trimNewLines: (value) => value
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => null
}));

jest.mock('../../src/components/SUE', () => ({
  SueCategory: () => null,
  SueImageFallback: () => null,
  SueStatus: () => null
}));

describe('CardListItem key warnings', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders non-SUE card content without React key warnings', () => {
    let tree;

    act(() => {
      tree = renderer.create(
        <CardListItem
          index={0}
          item={{
            params: {},
            routeName: 'Detail',
            subtitle: 'Subtitle',
            title: 'Card title'
          }}
        />
      );
    });

    const keyWarnings = consoleErrorSpy.mock.calls.filter(([message]) =>
      String(message).includes('Each child in a list should have a unique "key" prop')
    );

    expect(keyWarnings).toHaveLength(0);

    act(() => {
      tree.unmount();
    });
  });
});
