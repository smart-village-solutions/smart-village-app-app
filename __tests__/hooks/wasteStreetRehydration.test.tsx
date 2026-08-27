import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { useWasteStreetRehydration } from '../../src/hooks/wasteStreetRehydration';

let mockFocusCallback: (() => void) | undefined;

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (callback: () => void) => {
    if (!mockFocusCallback) mockFocusCallback = callback;
  }
}));

const TestHook = ({ editStreet, onRehydrate }: { editStreet?: boolean; onRehydrate: () => void }) => {
  useWasteStreetRehydration({ editStreet, isReset: false, onRehydrate });

  return null;
};

describe('useWasteStreetRehydration', () => {
  beforeEach(() => {
    mockFocusCallback = undefined;
  });

  it('does not restore the saved street when an edit request arrives before focus', () => {
    const onRehydrate = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<TestHook editStreet={false} onRehydrate={onRehydrate} />);
    });

    act(() => {
      tree.update(<TestHook editStreet onRehydrate={onRehydrate} />);
    });

    act(() => mockFocusCallback?.());

    expect(onRehydrate).not.toHaveBeenCalled();
  });
});
