import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { useWasteStreetEditRequest } from '../../src/hooks/wasteStreetEditRequest';

jest.mock('expo-router/react-navigation', () => {
  const React = require('react');

  return {
    useFocusEffect: (callback: () => void) => React.useEffect(callback, [])
  };
});

const TestHook = ({
  editStreet,
  onReset,
  onRequestHandled
}: {
  editStreet?: boolean;
  onReset: () => void;
  onRequestHandled: () => void;
}) => {
  useWasteStreetEditRequest({ editStreet, onReset, onRequestHandled });

  return null;
};

describe('useWasteStreetEditRequest', () => {
  it('resets the street when the edit request arrives after the screen is focused', () => {
    const onReset = jest.fn();
    const onRequestHandled = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <TestHook
          editStreet={false}
          onReset={onReset}
          onRequestHandled={onRequestHandled}
        />
      );
    });

    act(() => {
      tree.update(
        <TestHook
          editStreet
          onReset={onReset}
          onRequestHandled={onRequestHandled}
        />
      );
    });

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onRequestHandled).toHaveBeenCalledTimes(1);
  });
});
