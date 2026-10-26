/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React, { useEffect } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockPlayer = {
  pause: jest.fn(),
  play: jest.fn(),
  replace: jest.fn(),
  seekTo: jest.fn(async () => undefined),
  setActiveForLockScreen: jest.fn(),
  setPlaybackRate: jest.fn()
};
const mockStatus = {
  currentTime: 25,
  didJustFinish: false,
  duration: 60,
  error: null,
  isBuffering: false,
  playing: false
};
const mockNavigate = jest.fn();
const mockGetRootState = jest.fn();
const mockGetCurrentRoute = jest.fn();
const mockIsReady = jest.fn();

jest.mock('../../src/navigation/navigationRef', () => ({
  navigationRef: {
    getCurrentRoute: (...args) => mockGetCurrentRoute(...args),
    getRootState: (...args) => mockGetRootState(...args),
    isReady: (...args) => mockIsReady(...args),
    navigate: (...args) => mockNavigate(...args)
  }
}));

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(async () => undefined),
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => mockStatus
}));

jest.mock('../../src/config', () => ({
  Icon: { NamedIcon: () => null },
  normalize: (value) => value,
  texts: {
    settingsContents: { accessibility: { readAloud: { collapsePlayer: 'Collapse player' } } }
  }
}));

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: { background: '#fff' } })
}));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: () => ({})
}));
jest.mock('../../src/components/Text', () => {
  const { Text } = require('react-native');
  return { RegularText: ({ children, ...props }) => <Text {...props}>{children}</Text> };
});

import { AudioPlayerProvider, useAudioPlayback } from '../../src/AudioPlayerProvider';
import {
  AudioPlayerControls,
  FloatingAudioControls,
  formatAudioTime
} from '../../src/components/AudioPlayerControls';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

const ReadAloudRegistration = ({ pauseSpeech }) => {
  const { registerReadAloudPause } = useAudioPlayback();
  useEffect(() => registerReadAloudPause(pauseSpeech), [pauseSpeech, registerReadAloudPause]);
  return null;
};

describe('AudioPlayerControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStatus.playing = false;
    mockStatus.currentTime = 25;
    mockIsReady.mockReturnValue(true);
    mockGetRootState.mockReturnValue({ index: 0, routes: [{ name: 'Stack0' }] });
    mockGetCurrentRoute.mockReturnValue({ name: 'Home' });
  });

  it('opens the source detail from the persistent player and hides the shortcut on that detail', async () => {
    const track = {
      source: {
        id: '18954',
        query: 'tour',
        rootRouteName: 'PointsOfInterestAndTours',
        title: 'Tour'
      },
      title: 'Audio',
      url: 'https://example.org/tour.mp3'
    };
    const tree = render(
      <AudioPlayerProvider>
        <AudioPlayerControls track={track} />
        <FloatingAudioControls onCollapse={jest.fn()} />
      </AudioPlayerProvider>
    );

    fireEvent.press(tree.getByLabelText('Audio abspielen'));
    await waitFor(() => expect(tree.getByLabelText('Zur Tour')).toBeTruthy());
    fireEvent.press(tree.getByLabelText('Zur Tour'));

    expect(mockNavigate).toHaveBeenCalledWith('Stack0', {
      params: {
        query: 'tour',
        queryVariables: { id: '18954' },
        rootRouteName: 'PointsOfInterestAndTours',
        title: 'Tour'
      },
      screen: 'Detail'
    });

    mockGetCurrentRoute.mockReturnValue({
      name: 'Detail',
      params: { query: 'tour', queryVariables: { id: '18954' } }
    });
    tree.rerender(
      <AudioPlayerProvider>
        <FloatingAudioControls onCollapse={jest.fn()} />
      </AudioPlayerProvider>
    );
    expect(tree.queryByLabelText('Zur Tour')).toBeNull();
  });

  it('opens a POI detail from a drawer-based app', async () => {
    mockGetRootState.mockReturnValue({ index: 0, routes: [{ name: 'AppStack' }] });
    const tree = render(
      <AudioPlayerProvider>
        <AudioPlayerControls
          track={{
            source: { id: '42', query: 'pointOfInterest', title: 'Ort' },
            title: 'Audioguide',
            url: 'https://example.org/poi.mp3'
          }}
        />
        <FloatingAudioControls onCollapse={jest.fn()} />
      </AudioPlayerProvider>
    );

    fireEvent.press(tree.getByLabelText('Audio abspielen'));
    await waitFor(() => expect(tree.getByLabelText('Zum Ort')).toBeTruthy());
    fireEvent.press(tree.getByLabelText('Zum Ort'));

    expect(mockNavigate).toHaveBeenCalledWith('AppStack', {
      params: {
        query: 'pointOfInterest',
        queryVariables: { id: '42' },
        rootRouteName: undefined,
        title: 'Ort'
      },
      screen: 'Detail'
    });
  });

  it('starts MP3 from a compact detail action and keeps one floating control after navigation', async () => {
    const track = { title: 'Stadtrundgang', url: 'https://example.org/tour.mp3' };
    const tree = render(
      <AudioPlayerProvider>
        <AudioPlayerControls track={track} />
        <FloatingAudioControls onCollapse={jest.fn()} />
      </AudioPlayerProvider>
    );

    expect(tree.getByText('Stadtrundgang')).toBeTruthy();
    fireEvent.press(tree.getByLabelText('Audio abspielen'));

    await waitFor(() => expect(mockPlayer.play).toHaveBeenCalledTimes(1));
    expect(mockPlayer.replace).toHaveBeenCalledWith({ uri: track.url });
    expect(mockPlayer.setActiveForLockScreen).toHaveBeenCalledWith(true, { title: track.title });
    expect(tree.getByLabelText('Audioplayer öffnen')).toBeTruthy();
    expect(tree.getByLabelText('Audio fortsetzen')).toBeTruthy();

    tree.rerender(
      <AudioPlayerProvider>
        <FloatingAudioControls onCollapse={jest.fn()} />
      </AudioPlayerProvider>
    );

    fireEvent.press(tree.getByLabelText('Audio fortsetzen'));
    await waitFor(() => expect(mockPlayer.play).toHaveBeenCalledTimes(2));
    expect(mockPlayer.replace).toHaveBeenCalledTimes(1);
  });

  it('seeks and stops from the shared floating control', async () => {
    const tree = render(
      <AudioPlayerProvider>
        <AudioPlayerControls track={{ title: 'Nachricht', url: 'https://example.org/news.mp3' }} />
        <FloatingAudioControls onCollapse={jest.fn()} />
      </AudioPlayerProvider>
    );

    fireEvent.press(tree.getByLabelText('Audio abspielen'));
    await waitFor(() => expect(mockPlayer.play).toHaveBeenCalledTimes(1));
    fireEvent.press(tree.getByLabelText('10 Sekunden zurück'));
    await waitFor(() => expect(mockPlayer.seekTo).toHaveBeenCalledWith(15));

    fireEvent(tree.getByLabelText('Abspielposition'), 'layout', {
      nativeEvent: { layout: { width: 200 } }
    });
    fireEvent.press(tree.getByLabelText('Abspielposition'), {
      nativeEvent: { locationX: 100 }
    });
    await waitFor(() => expect(mockPlayer.seekTo).toHaveBeenCalledWith(30));

    fireEvent.press(tree.getByLabelText('Audio stoppen'));
    expect(mockPlayer.pause).toHaveBeenCalled();
    expect(mockPlayer.setActiveForLockScreen).toHaveBeenCalledWith(false);
  });

  it('uses remote label and control options in the shared player', async () => {
    const tree = render(
      <SettingsContext.Provider
        value={{
          ...initialContext,
          globalSettings: {
            ...initialContext.globalSettings,
            settings: {
              audioPlayer: {
                label: 'Audioguide',
                showSkipControls: false,
                showSpeedControl: false
              }
            }
          }
        }}
      >
        <AudioPlayerProvider>
          <AudioPlayerControls track={{ title: 'Tour', url: 'https://example.org/tour.mp3' }} />
          <FloatingAudioControls onCollapse={jest.fn()} />
        </AudioPlayerProvider>
      </SettingsContext.Provider>
    );

    expect(tree.getByText('Audioguide')).toBeTruthy();
    fireEvent.press(tree.getByLabelText('Audio abspielen'));
    await waitFor(() => expect(mockPlayer.play).toHaveBeenCalledTimes(1));
    expect(tree.queryByLabelText('10 Sekunden zurück')).toBeNull();
    expect(tree.queryByLabelText('Wiedergabegeschwindigkeit 1x')).toBeNull();
  });

  it('pauses read aloud before starting MP3', async () => {
    const pauseSpeech = jest.fn(async () => undefined);
    const tree = render(
      <AudioPlayerProvider>
        <ReadAloudRegistration pauseSpeech={pauseSpeech} />
        <AudioPlayerControls track={{ title: 'Tour', url: 'https://example.org/tour.mp3' }} />
      </AudioPlayerProvider>
    );

    fireEvent.press(tree.getByLabelText('Audio abspielen'));
    await waitFor(() => expect(mockPlayer.play).toHaveBeenCalledTimes(1));
    expect(pauseSpeech).toHaveBeenCalledTimes(1);
    expect(pauseSpeech.mock.invocationCallOrder[0]).toBeLessThan(
      mockPlayer.play.mock.invocationCallOrder[0]
    );
  });

  it('formats known and unknown duration values', () => {
    expect(formatAudioTime(125.9)).toBe('2:05');
    expect(formatAudioTime(Infinity)).toBe('0:00');
  });
});
