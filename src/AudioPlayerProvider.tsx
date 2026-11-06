import { Asset } from 'expo-asset';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useAudioPlayerSettings } from './AudioPlayerSettings';

export type AudioTrackSource = {
  id: string;
  imageUrl?: string;
  query: string;
  rootRouteName?: string;
  title: string;
};

export const AudioTrackSourceContext = createContext<AudioTrackSource | null>(null);

export type AudioTrack = {
  source?: AudioTrackSource;
  title: string;
  url: string;
};

type AudioPlayerContextValue = {
  currentTrack: AudioTrack | null;
  currentTime: number;
  duration: number;
  error: boolean;
  isBuffering: boolean;
  isPlaying: boolean;
  openPlayer: () => void;
  openRequestId: number;
  pause: () => void;
  play: (track: AudioTrack) => Promise<void>;
  seekBy: (seconds: number) => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  setRate: (rate: number) => void;
  rate: number;
  registerReadAloudPause: (callback: () => Promise<void> | void) => () => void;
  stop: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);
const AudioPlayerPresenceContext = createContext(false);

const getLockScreenMetadata = (track: AudioTrack) => ({
  title: track.source?.title || track.title,
  ...(track.source?.title && track.title !== 'Audio' && track.title !== track.source.title
    ? { artist: track.title }
    : {}),
  ...(track.source?.imageUrl ? { artworkUrl: track.source.imageUrl } : {})
});

let appIconArtworkUrl: Promise<string | undefined> | undefined;

const getAppIconArtworkUrl = () => {
  // Metro needs a static require for the bundled app icon.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  appIconArtworkUrl ??= Asset.fromModule(require('../assets/icon.png'))
    .downloadAsync()
    .then((asset) => asset.localUri || asset.uri)
    .catch(() => undefined);
  return appIconArtworkUrl;
};

export const AudioPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const { enabled, showSkipControls } = useAudioPlayerSettings();
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [error, setError] = useState(false);
  const [rate, setRateState] = useState(1);
  const [openRequestId, setOpenRequestId] = useState(0);
  const requestId = useRef(0);
  const pauseReadAloud = useRef<(() => Promise<void> | void) | null>(null);

  const registerReadAloudPause = useCallback((callback: () => Promise<void> | void) => {
    pauseReadAloud.current = callback;
    return () => {
      if (pauseReadAloud.current === callback) pauseReadAloud.current = null;
    };
  }, []);

  const openPlayer = useCallback(() => setOpenRequestId((id) => id + 1), []);

  const play = useCallback(
    async (track: AudioTrack) => {
      const nextRequestId = ++requestId.current;
      setError(false);

      try {
        await pauseReadAloud.current?.();
        if (nextRequestId !== requestId.current) return;

        await setAudioModeAsync({
          interruptionMode: 'doNotMix',
          playsInSilentMode: true,
          shouldPlayInBackground: true
        });
        if (nextRequestId !== requestId.current) return;

        if (currentTrack?.url !== track.url) {
          player.pause();
          player.replace({ uri: track.url });
          player.setPlaybackRate(rate);
          setCurrentTrack(track);
        } else {
          setCurrentTrack(track);
          if (
            status.didJustFinish ||
            (status.duration > 0 && status.currentTime >= status.duration)
          ) {
            await player.seekTo(0);
          }
        }

        if (nextRequestId !== requestId.current) return;
        player.play();
        const metadata = getLockScreenMetadata(track);
        player.setActiveForLockScreen(true, metadata, {
          showSeekBackward: showSkipControls,
          showSeekForward: showSkipControls
        });
        if (!metadata.artworkUrl) {
          void getAppIconArtworkUrl().then((artworkUrl) => {
            if (artworkUrl && nextRequestId === requestId.current) {
              player.updateLockScreenMetadata({ ...metadata, artworkUrl });
            }
          });
        }
      } catch {
        if (nextRequestId === requestId.current) setError(true);
      }
    },
    [
      currentTrack,
      player,
      rate,
      showSkipControls,
      status.currentTime,
      status.didJustFinish,
      status.duration
    ]
  );

  const pause = useCallback(() => player.pause(), [player]);

  const stop = useCallback(() => {
    ++requestId.current;
    player.pause();
    player.setActiveForLockScreen(false);
    setCurrentTrack(null);
    setError(false);
  }, [player]);

  const seekBy = useCallback(
    async (seconds: number) => {
      if (!currentTrack) return;
      const target = Math.max(
        0,
        Math.min(status.currentTime + seconds, status.duration || Infinity)
      );
      await player.seekTo(target);
    },
    [currentTrack, player, status.currentTime, status.duration]
  );

  const seekTo = useCallback(
    async (seconds: number) => {
      if (!currentTrack || !status.duration || !Number.isFinite(seconds)) return;
      await player.seekTo(Math.max(0, Math.min(seconds, status.duration)));
    },
    [currentTrack, player, status.duration]
  );

  useEffect(() => {
    // A remote feature switch can change while a track is active.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!enabled && currentTrack) stop();
  }, [currentTrack, enabled, stop]);

  const setRate = useCallback(
    (nextRate: number) => {
      if (currentTrack) player.setPlaybackRate(nextRate);
      setRateState(nextRate);
    },
    [currentTrack, player]
  );

  return (
    <AudioPlayerPresenceContext.Provider value={!!currentTrack}>
      <AudioPlayerContext.Provider
        value={{
          currentTrack,
          currentTime: status.currentTime,
          duration: status.duration,
          error: error || !!status.error,
          isBuffering: status.isBuffering,
          isPlaying: status.playing,
          openPlayer,
          openRequestId,
          pause,
          play,
          rate,
          registerReadAloudPause,
          seekBy,
          seekTo,
          setRate,
          stop
        }}
      >
        {children}
      </AudioPlayerContext.Provider>
    </AudioPlayerPresenceContext.Provider>
  );
};

export const useAudioPlayback = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('AudioPlayerProvider is missing');
  return context;
};

export const useOptionalAudioPlayback = () => useContext(AudioPlayerContext);

export const useAudioPlayerPresence = () => useContext(AudioPlayerPresenceContext);
