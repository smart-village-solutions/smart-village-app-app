/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../src/config', () => {
  const MockIcon = () => null;

  return {
    colors: { darkText: '#111111' },
    consts: { a11yLabel: { button: '(Taste)', heading: '(Überschrift)' } },
    device: { platform: 'ios' },
    Icon: { ArrowRight: MockIcon },
    normalize: (value: number) => value
  };
});

jest.mock('../../src/SettingsProvider', () => {
  const ReactLocal = require('react');

  return {
    SettingsContext: ReactLocal.createContext({ globalSettings: { settings: {} } })
  };
});

jest.mock('../../src/components/Title', () => {
  const ReactLocal = require('react');

  return {
    Title: ({ children, ...props }) => ReactLocal.createElement('mock-title', props, children),
    TitleContainer: ({ children }) =>
      ReactLocal.createElement('mock-title-container', {}, children),
    TitleShadow: () => null
  };
});

jest.mock('../../src/components/Touchable', () => {
  const ReactLocal = require('react');

  return {
    Touchable: ({ children, ...props }) =>
      ReactLocal.createElement('mock-touchable', props, children)
  };
});

jest.mock('../../src/components/Wrapper', () => {
  const ReactLocal = require('react');

  return {
    WrapperRow: ({ children }) => ReactLocal.createElement('mock-wrapper-row', {}, children)
  };
});

import { SectionHeader } from '../../src/components/SectionHeader';

describe('SectionHeader accessibility', () => {
  it('exposes a non-interactive visually bold section title as a native header', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(<SectionHeader title="Nachrichten" />);
    });

    const title = tree!.root.findByType('mock-title');

    expect(title.props.accessibilityRole).toBe('header');
    expect(title.props.accessibilityLabel).toBe('(Nachrichten) (Überschrift)');
  });

  it('keeps an interactive section title exposed as a button', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(<SectionHeader onPress={jest.fn()} title="Nachrichten" />);
    });

    const touchable = tree!.root.findByType('mock-touchable');
    const title = tree!.root.findByType('mock-title');

    expect(touchable.props.accessibilityLabel).toBe('(Nachrichten) (Überschrift) (Taste)');
    expect(title.props.accessibilityRole).toBeUndefined();
  });
});
