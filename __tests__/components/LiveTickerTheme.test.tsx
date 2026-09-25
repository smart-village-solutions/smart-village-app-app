/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';

import { LiveTicker } from '../../src/components/LiveTicker';
import { themePalettes } from '../../src/config/colors';
import { getContrastRatio } from '../../src/helpers/themeHelper';
import { ThemeContext } from '../../src/ThemeContext';

jest.mock('@animatereactnative/marquee', () => {
  const ReactLocal = require('react');

  return {
    Marquee: (props: object) => ReactLocal.createElement('mock-marquee', props)
  };
});

jest.mock('../../src/components/HtmlView', () => {
  const ReactLocal = require('react');

  return {
    HtmlView: (props: object) => ReactLocal.createElement('mock-html-view', props)
  };
});

jest.mock('../../src/config', () => ({ device: { width: 400 } }));

jest.mock('../../src/hooks', () => ({
  useHomeRefresh: jest.fn(),
  useStaticContent: () => ({ data: mockData, refetch: jest.fn() })
}));

const mockData = {
  text: 'Smart Village App ❤️',
  liveTickerSettings: {
    speed: 0.5,
    style: { backgroundColor: '#C3E470', paddingVertical: 20 }
  },
  dark: {
    liveTickerSettings: {
      style: { backgroundColor: '#2A2A2A' }
    }
  }
};

const renderTicker = (mode: 'light' | 'dark') => (
  <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', colors: themePalettes[mode] }}>
    <LiveTicker publicJsonFile="homeLiveTicker" />
  </ThemeContext.Provider>
);

describe('LiveTicker theme overrides', () => {
  it('keeps the existing light style and applies the dark background without changing the text', async () => {
    let tree: renderer.ReactTestRenderer;

    await renderer.act(async () => {
      tree = renderer.create(renderTicker('light'));
    });

    let ticker = tree!.root.findByType('mock-marquee' as never);
    expect(StyleSheet.flatten(ticker.props.style)).toMatchObject({
      backgroundColor: '#C3E470',
      paddingVertical: 20
    });
    expect(ticker.props.speed).toBe(0.5);

    await renderer.act(async () => {
      tree!.update(renderTicker('dark'));
    });

    ticker = tree!.root.findByType('mock-marquee' as never);
    expect(StyleSheet.flatten(ticker.props.style)).toMatchObject({
      backgroundColor: '#2A2A2A',
      paddingVertical: 20
    });
    expect(tree!.root.findByType('mock-html-view' as never).props.html).toContain(mockData.text);
    expect(getContrastRatio(themePalettes.dark.text, '#2A2A2A')).toBeGreaterThanOrEqual(4.5);
    expect(mockData.liveTickerSettings.style.backgroundColor).toBe('#C3E470');
  });
});
