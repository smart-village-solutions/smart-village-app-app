import React from 'react';
import renderer from 'react-test-renderer';
import * as Speech from 'expo-speech';

import { getNativeSpeechRate, useDetailSpeech } from '../../src/hooks/useDetailSpeech';

jest.mock('expo-speech', () => ({
  maxSpeechInputLength: 4000,
  speak: jest.fn(),
  stop: jest.fn(() => Promise.resolve())
}));

const items = [
  { id: 'title', text: 'Erster Abschnitt' },
  { id: 'description', text: 'Zweiter Abschnitt' }
];

describe('useDetailSpeech section navigation', () => {
  let currentHook: ReturnType<typeof useDetailSpeech>;
  let tree: renderer.ReactTestRenderer;

  const Harness = () => {
    currentHook = useDetailSpeech(items, true, 1);
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    renderer.act(() => {
      tree = renderer.create(<Harness />);
    });
  });

  afterEach(() => {
    renderer.act(() => tree.unmount());
  });

  it('starts the next section and updates skip availability', async () => {
    await renderer.act(async () => {
      await currentHook.skipNext();
    });

    expect(Speech.speak).toHaveBeenCalledWith(
      'Zweiter Abschnitt',
      expect.objectContaining({ language: 'de-DE', rate: 0.9 })
    );
    expect(currentHook.currentItemIndex).toBe(1);
    expect(currentHook.canSkipPrevious).toBe(true);
    expect(currentHook.canSkipNext).toBe(false);
  });

  it('does not skip before the first section', async () => {
    await renderer.act(async () => {
      await currentHook.skipPrevious();
    });

    expect(Speech.speak).toHaveBeenCalledWith(
      'Erster Abschnitt',
      expect.objectContaining({ language: 'de-DE', rate: 0.9 })
    );
    expect(currentHook.currentItemIndex).toBe(0);
    expect(currentHook.canSkipPrevious).toBe(false);
  });
});

describe('getNativeSpeechRate', () => {
  it('uses a calmer device rate while preserving the displayed relative speed', () => {
    expect(getNativeSpeechRate(1)).toBeCloseTo(0.9);
    expect(getNativeSpeechRate(0.5)).toBeCloseTo(0.45);
  });
});
