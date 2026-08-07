import React from 'react';
import renderer from 'react-test-renderer';

const mockUseDetailSpeech = jest.fn();
const mockSetPlayerBottomSpacing = jest.fn();

jest.mock('../../src/hooks', () => ({
  useDetailSpeech: (...args: unknown[]) => mockUseDetailSpeech(...args)
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({ isReduceMotionEnabled: true })
  };
});

jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudAvailability: () => ({ setPlayerBottomSpacing: mockSetPlayerBottomSpacing })
}));

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  return {
    device: { height: 844, width: 390 },
    Icon: {
      NamedIcon: (props: unknown) => ReactLocal.createElement('mock-named-icon', props)
    },
    normalize: (value: number) => value,
    texts: {
      settingsContents: {
        accessibility: {
          readAloud: {
            disableQuickToggle: 'Disable read aloud',
            enableQuickToggle: 'Enable read aloud',
            expandPlayer: 'Expand player',
            hideReadAlong: 'Hide read along',
            next: 'Next section',
            pause: 'Pause',
            previous: 'Previous section',
            progress: 'Section {{current}} of {{total}}',
            resume: 'Resume',
            showReadAlong: 'Show read along',
            speedTitle: 'Speech speed',
            start: 'Start'
          }
        }
      }
    }
  };
});

jest.mock('../../src/components/Text', () => ({
  RegularText: ({ children, ...props }: { children?: unknown; [key: string]: unknown }) => {
    const ReactLocal = require('react');
    const { Text: MockText } = require('react-native');

    return ReactLocal.createElement(MockText, props, children);
  }
}));

import {
  FloatingReadAloudPlayer,
  getNextSpeechRate,
  getReadAlongWords
} from '../../src/components/FloatingReadAloudPlayer';

describe('FloatingReadAloudPlayer helpers', () => {
  it('cycles through every Figma speech-rate option', () => {
    const rates = [1, 1.2, 1.5, 1.8, 2, 0.5, 0.8];

    rates.forEach((rate, index) => {
      expect(getNextSpeechRate(rate)).toBe(rates[(index + 1) % rates.length]);
    });
  });

  it('keeps the active word centered in a seven-word ticker when possible', () => {
    const text = 'eins zwei drei vier fünf sechs sieben acht neun zehn elf';
    const activeStart = text.indexOf('sieben');
    const words = getReadAlongWords(text, { length: 'sieben'.length, start: activeStart });

    expect(words).toHaveLength(7);
    expect(words.map(({ text: word }) => word)).toEqual([
      'vier',
      'fünf',
      'sechs',
      'sieben',
      'acht',
      'neun',
      'zehn'
    ]);
    expect(words.filter(({ active }) => active).map(({ text: word }) => word)).toEqual(['sieben']);
  });

  it('marks the first word while speech has not emitted a boundary yet', () => {
    expect(getReadAlongWords('Erster zweiter dritter')).toEqual([
      { active: true, key: '0-0', text: 'Erster' },
      { active: false, key: '7-1', text: 'zweiter' },
      { active: false, key: '15-2', text: 'dritter' }
    ]);
  });
});

describe('FloatingReadAloudPlayer controls', () => {
  const speechState = {
    activeWordRange: { length: 4, start: 0 },
    canSkipNext: true,
    canSkipPrevious: false,
    canStart: true,
    currentItemIndex: 0,
    currentItemText: 'Die Schülerinnen und Schüler lesen gemeinsam weiter',
    isPaused: false,
    isSpeaking: false,
    pause: jest.fn(),
    resume: jest.fn(),
    skipNext: jest.fn(),
    skipPrevious: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    totalItems: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDetailSpeech.mockReturnValue(speechState);
  });

  it('expands from the minimal speaker into six accessible controls', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <FloatingReadAloudPlayer
          isEnabled
          items={[{ id: 'title', text: speechState.currentItemText }]}
          onDisable={jest.fn()}
          onEnable={jest.fn()}
        />
      );
    });

    const minimalButton = tree!.root.findByProps({ accessibilityLabel: 'Expand player' });
    renderer.act(() => minimalButton.props.onPress());

    const controlLabels = [
      'Speech speed: 1,0x',
      'Previous section',
      'Start',
      'Next section',
      'Show read along',
      'Disable read aloud'
    ];
    const controls = controlLabels.map((label) =>
      tree!.root.findByProps({ accessibilityLabel: label })
    );

    expect(controls.map(({ props }) => props.accessibilityLabel)).toEqual(controlLabels);
    expect(controls[1].props.accessibilityState.disabled).toBe(true);
    expect(controls[4].props.accessibilityState.expanded).toBe(false);
  });

  it('expands the read-along ticker and disables the global feature from the player', () => {
    const onDisable = jest.fn();
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <FloatingReadAloudPlayer
          isEnabled
          items={[{ id: 'title', text: speechState.currentItemText }]}
          onDisable={onDisable}
          onEnable={jest.fn()}
        />
      );
    });

    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Expand player' }).props.onPress()
    );
    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Show read along' }).props.onPress()
    );

    expect(
      tree!.root.findByProps({ accessibilityLabel: 'Hide read along' }).props.accessibilityState
    ).toEqual({ disabled: false, expanded: true });

    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Disable read aloud' }).props.onPress()
    );

    expect(speechState.stop).toHaveBeenCalledTimes(1);
    expect(onDisable).toHaveBeenCalledTimes(1);
  });

  it('keeps the centered speaker available globally and enables the feature while expanding', () => {
    const onEnable = jest.fn();
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <FloatingReadAloudPlayer
          isEnabled={false}
          items={[{ id: 'title', text: speechState.currentItemText }]}
          onDisable={jest.fn()}
          onEnable={onEnable}
        />
      );
    });

    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Enable read aloud' }).props.onPress()
    );

    expect(onEnable).toHaveBeenCalledTimes(1);
    expect(tree!.root.findByProps({ accessibilityLabel: 'Speech speed: 1,0x' })).toBeTruthy();
    expect(mockSetPlayerBottomSpacing).toHaveBeenLastCalledWith(72);
  });

  it('renders the active read-along word with a primary underline', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <FloatingReadAloudPlayer
          isEnabled
          items={[{ id: 'title', text: speechState.currentItemText }]}
          onDisable={jest.fn()}
          onEnable={jest.fn()}
        />
      );
    });

    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Expand player' }).props.onPress()
    );
    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Show read along' }).props.onPress()
    );

    const activeWord = tree!.root.findByProps({ testID: 'active-read-along-word' });
    const activeStyle = Object.assign({}, ...activeWord.props.style.filter(Boolean));

    expect(activeStyle.borderBottomWidth).toBe(4);
    expect(activeStyle.borderBottomColor).toBeTruthy();
  });

  it('collapses the read-along area after hiding its text', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <FloatingReadAloudPlayer
          isEnabled
          items={[{ id: 'title', text: speechState.currentItemText }]}
          onDisable={jest.fn()}
          onEnable={jest.fn()}
        />
      );
    });

    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Expand player' }).props.onPress()
    );
    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Show read along' }).props.onPress()
    );
    expect(mockSetPlayerBottomSpacing).toHaveBeenLastCalledWith(128);
    renderer.act(() =>
      tree!.root.findByProps({ accessibilityLabel: 'Hide read along' }).props.onPress()
    );

    expect(tree!.root.findByProps({ accessibilityLabel: 'Show read along' })).toBeTruthy();
    expect(tree!.root.findAllByProps({ testID: 'active-read-along-word' })).toHaveLength(0);
    expect(mockSetPlayerBottomSpacing).toHaveBeenLastCalledWith(72);
  });
});
