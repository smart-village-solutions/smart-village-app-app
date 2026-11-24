/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('../../src/components/AudioPlayerControls', () => ({
  AudioPlayerControls: 'native-audio-control'
}));
jest.mock('react-native-webview', () => ({ __esModule: true, default: 'embedded-webview' }));
jest.mock('react-native-youtube-iframe', () => ({ __esModule: true, default: 'embedded-youtube' }));

jest.mock('../../src/config', () => ({
  consts: { a11yLabel: { webViewHint: '' } },
  normalize: (value) => value
}));

jest.mock('../../src/helpers', () => ({ trimNewLines: (value) => value }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/components/LoadingContainer', () => ({ LoadingContainer: 'loading' }));
jest.mock('../../src/components/Wrapper', () => {
  const { View } = require('react-native');
  return {
    WrapperHorizontal: ({ children }) => <View>{children}</View>,
    WrapperVertical: ({ children }) => <View>{children}</View>
  };
});

import { MediaSection } from '../../src/components/MediaSection';
import { AudioTrackSourceContext } from '../../src/AudioPlayerProvider';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

describe('MediaSection audio', () => {
  it('renders an MP3 URL with the native audio control', () => {
    const tree = render(
      <MediaSection
        mediaContents={[
          {
            id: '1',
            contentType: 'audio',
            captionText: 'Museumführung',
            sourceUrl: { url: 'https://example.org/museum.mp3' }
          }
        ]}
      />
    );

    expect(tree.UNSAFE_getByType('native-audio-control').props.track).toEqual({
      title: 'Museumführung',
      url: 'https://example.org/museum.mp3'
    });
  });

  it('attaches the detail identity so playback can return to its source', () => {
    const source = { id: '18954', query: 'tour', title: 'Tour' };
    const tree = render(
      <AudioTrackSourceContext.Provider value={source}>
        <MediaSection
          mediaContents={[
            {
              id: '1',
              contentType: 'audio',
              sourceUrl: { url: 'https://example.org/tour.mp3' }
            }
          ]}
        />
      </AudioTrackSourceContext.Provider>
    );

    expect(tree.UNSAFE_getByType('native-audio-control').props.track.source).toEqual(source);
  });

  it('keeps legacy iframe audio out of the native player', () => {
    const tree = render(
      <MediaSection
        mediaContents={[
          { id: '1', contentType: 'audio', sourceUrl: { url: '<iframe src="x"></iframe>' } }
        ]}
      />
    );

    expect(tree.UNSAFE_queryByType('native-audio-control')).toBeNull();
  });

  it('hides direct audio when the remote feature switch is off', () => {
    const tree = render(
      <SettingsContext.Provider
        value={{
          ...initialContext,
          globalSettings: {
            ...initialContext.globalSettings,
            settings: { audioPlayer: { enabled: false } }
          }
        }}
      >
        <MediaSection
          mediaContents={[
            { id: '1', contentType: 'audio', sourceUrl: { url: 'https://example.org/tour.mp3' } }
          ]}
        />
      </SettingsContext.Provider>
    );

    expect(tree.UNSAFE_queryByType('native-audio-control')).toBeNull();
  });

  it.each([
    ['https://w.soundcloud.com/player/?url=example', 'embedded-webview'],
    ['https://www.youtube-nocookie.com/embed/video123', 'embedded-youtube'],
    ['<iframe src="https://w.soundcloud.com/player/?url=example"></iframe>', 'embedded-webview']
  ])('keeps the legacy embed %s when native audio is disabled', (url, player) => {
    const tree = render(
      <SettingsContext.Provider
        value={{
          ...initialContext,
          globalSettings: {
            ...initialContext.globalSettings,
            settings: { audioPlayer: { enabled: false } }
          }
        }}
      >
        <MediaSection mediaContents={[{ id: '1', contentType: 'audio', sourceUrl: { url } }]} />
      </SettingsContext.Provider>
    );

    expect(tree.UNSAFE_getByType(player)).toBeTruthy();
    expect(tree.UNSAFE_queryByType('native-audio-control')).toBeNull();
  });
});
