import React, { useState } from 'react';
import { Pressable, TextStyle, View, ViewStyle } from 'react-native';

import { AudioTrack, useAudioPlayback } from '../AudioPlayerProvider';
import { useAudioPlayerSettings } from '../AudioPlayerSettings';
import { Icon, normalize, texts } from '../config';
import { useTheme } from '../hooks/useTheme';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { navigationRef } from '../navigation/navigationRef';
import { QUERY_TYPES } from '../queries/types';
import { ScreenName } from '../types/Navigation';
import { ThemeColorPalette } from '../types/Theme';

import { RegularText } from './Text';

const SPEED_OPTIONS = [0.8, 1, 1.2, 1.5, 2];

const sourceLabels: Record<string, string> = {
  [QUERY_TYPES.POINT_OF_INTEREST]: 'Zum Ort',
  [QUERY_TYPES.TOUR]: 'Zur Tour',
  [QUERY_TYPES.NEWS_ITEM]: 'Zur Nachricht',
  [QUERY_TYPES.EVENT_RECORD]: 'Zur Veranstaltung'
};

const isOnAudioSource = (source: NonNullable<AudioTrack['source']>) => {
  if (!navigationRef.isReady()) return false;
  const route = navigationRef.getCurrentRoute();
  const params = route?.params as
    | { id?: string; query?: string; queryVariables?: { id?: string } }
    | undefined;
  return (
    route?.name === ScreenName.Detail &&
    params?.query === source.query &&
    String(params?.queryVariables?.id ?? params?.id) === source.id
  );
};

const openAudioSource = (source: NonNullable<AudioTrack['source']>) => {
  if (!source.query || !navigationRef.isReady()) return;
  const rootState = navigationRef.getRootState();
  const rootRoute = rootState?.routes?.[rootState.index ?? 0]?.name;
  if (!rootRoute || (rootRoute !== 'AppStack' && !/^Stack\d+$/.test(rootRoute))) return;

  navigationRef.navigate(rootRoute, {
    params: {
      query: source.query,
      queryVariables: { id: source.id },
      rootRouteName: source.rootRouteName,
      title: source.title
    },
    screen: ScreenName.Detail
  });
};

export const formatAudioTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const wholeSeconds = Math.floor(seconds);
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, '0')}`;
};

type ControlProps = {
  disabled?: boolean;
  iconName?: string;
  label: string;
  onPress: () => void;
  text?: string;
};

const PlayerControl = ({ disabled = false, iconName, label, onPress, text }: ControlProps) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.controlTouchTarget}
    >
      {({ pressed }) => (
        <View style={[styles.controlVisual, pressed && styles.controlVisualPressed]}>
          {text ? (
            <RegularText ignoreTextScale style={styles.controlText}>
              {text}
            </RegularText>
          ) : (
            <Icon.NamedIcon
              color={colors.background}
              hasNoHitSlop
              name={iconName ?? ''}
              size={normalize(18)}
              strokeWidth={2}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

export const AudioPlayerControls = ({ track }: { track: AudioTrack }) => {
  const { label } = useAudioPlayerSettings();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { currentTrack, openPlayer, play } = useAudioPlayback();
  const isCurrentTrack =
    currentTrack?.url === track.url &&
    currentTrack?.source?.id === track.source?.id &&
    currentTrack?.source?.query === track.source?.query;
  const title = track.title.trim().toLowerCase() === 'audio' ? 'Anhören' : track.title;

  return (
    <Pressable
      accessibilityLabel={isCurrentTrack ? 'Audioplayer öffnen' : 'Audio abspielen'}
      accessibilityRole="button"
      onPress={() => {
        if (!isCurrentTrack) void play(track);
        openPlayer();
      }}
      style={({ pressed }) => [styles.trackTrigger, pressed && styles.triggerPressed]}
    >
      <View style={styles.triggerIcon}>
        <Icon.NamedIcon color={colors.primary} hasNoHitSlop name="music" size={normalize(24)} />
      </View>
      <View style={styles.triggerText}>
        <RegularText small style={styles.triggerLabel}>
          {label}
        </RegularText>
        <RegularText numberOfLines={1}>{title}</RegularText>
      </View>
      <Icon.NamedIcon
        color={colors.primary}
        hasNoHitSlop
        name={isCurrentTrack ? 'chevron-up' : 'player-play'}
        size={normalize(22)}
      />
    </Pressable>
  );
};

// eslint-disable-next-line complexity
export const FloatingAudioControls = ({ onCollapse }: { onCollapse: () => void }) => {
  const { label, showSkipControls, showSpeedControl, skipSeconds } = useAudioPlayerSettings();
  const styles = useThemeStyles(createStyles);
  const [progressWidth, setProgressWidth] = useState(0);
  const {
    currentTrack,
    currentTime,
    duration,
    error,
    isBuffering,
    isPlaying,
    pause,
    play,
    rate,
    seekBy,
    seekTo,
    setRate,
    stop
  } = useAudioPlayback();
  if (!currentTrack) return null;

  const progress = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;
  const nextRate = SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(rate) + 1) % SPEED_OPTIONS.length];
  const title = currentTrack.title.trim().toLowerCase() === 'audio' ? label : currentTrack.title;
  const source = currentTrack.source;

  return (
    <View style={styles.floatingContent}>
      <View style={styles.infoRow}>
        <View style={styles.infoDetails}>
          <RegularText numberOfLines={1} small style={styles.audioTitle}>
            {error
              ? 'Audio konnte nicht geladen werden'
              : isBuffering
              ? 'Audio wird geladen …'
              : title}
          </RegularText>
          <RegularText ignoreTextScale small style={styles.timeText}>
            {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
          </RegularText>
          <Pressable
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            accessibilityLabel="Abspielposition"
            accessibilityRole="adjustable"
            accessibilityState={{ disabled: duration <= 0 }}
            accessibilityValue={{
              min: 0,
              max: Math.max(Math.floor(duration), 1),
              now: Math.min(Math.floor(currentTime), Math.max(Math.floor(duration), 1)),
              text: `${formatAudioTime(currentTime)} von ${formatAudioTime(duration)}`
            }}
            onAccessibilityAction={(event) => {
              if (duration <= 0) return;
              if (event.nativeEvent.actionName === 'increment') void seekBy(skipSeconds);
              if (event.nativeEvent.actionName === 'decrement') void seekBy(-skipSeconds);
            }}
            onLayout={(event) => setProgressWidth(event.nativeEvent.layout.width)}
            onPress={(event) => {
              if (duration > 0 && progressWidth > 0) {
                const ratio = Math.max(0, Math.min(event.nativeEvent.locationX / progressWidth, 1));
                void seekTo(ratio * duration);
              }
            }}
            style={styles.progressTouchTarget}
          >
            <View pointerEvents="none" style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </Pressable>
        </View>
        {!!source?.query && !isOnAudioSource(source) && (
          <PlayerControl
            iconName="arrow-up-right"
            label={sourceLabels[source.query] || 'Zum Inhalt'}
            onPress={() => openAudioSource(source)}
          />
        )}
      </View>
      <View style={styles.controlsRow}>
        <View style={styles.leftControls}>
          {showSpeedControl && (
            <PlayerControl
              label={`Wiedergabegeschwindigkeit ${rate}x`}
              onPress={() => setRate(nextRate)}
              text={`${rate}x`}
            />
          )}
          {showSkipControls && (
            <PlayerControl
              iconName="player-skip-back"
              label={`${skipSeconds} Sekunden zurück`}
              onPress={() => void seekBy(-skipSeconds)}
            />
          )}
          <PlayerControl
            iconName={isPlaying ? 'player-pause' : 'player-play'}
            label={isPlaying ? 'Audio pausieren' : 'Audio fortsetzen'}
            onPress={() => (isPlaying ? pause() : void play(currentTrack))}
          />
          {showSkipControls && (
            <PlayerControl
              iconName="player-skip-forward"
              label={`${skipSeconds} Sekunden vor`}
              onPress={() => void seekBy(skipSeconds)}
            />
          )}
          <PlayerControl iconName="player-stop" label="Audio stoppen" onPress={stop} />
        </View>
        <PlayerControl
          iconName="chevron-down"
          label={texts.settingsContents.accessibility.readAloud.collapsePlayer}
          onPress={onCollapse}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColorPalette): Record<string, ViewStyle | TextStyle> => ({
  trackTrigger: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: normalize(12),
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: normalize(64),
    paddingHorizontal: normalize(12)
  },
  triggerPressed: { backgroundColor: colors.gray20 },
  triggerIcon: {
    alignItems: 'center',
    backgroundColor: colors.lighterPrimaryRgba,
    borderRadius: normalize(20),
    height: normalize(40),
    justifyContent: 'center',
    marginRight: normalize(12),
    width: normalize(40)
  },
  triggerText: { flex: 1 },
  triggerLabel: { color: colors.primary, fontWeight: '600' },
  floatingContent: { flex: 1 },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: normalize(56),
    paddingLeft: normalize(16),
    paddingRight: normalize(8)
  },
  infoDetails: { flex: 1 },
  audioTitle: { color: colors.text, flex: 1, fontWeight: '600' },
  timeText: { color: colors.textMuted, fontSize: normalize(11) },
  progressTouchTarget: { height: normalize(16), justifyContent: 'center' },
  progressTrack: {
    backgroundColor: colors.gray40,
    borderRadius: normalize(2),
    height: normalize(4),
    overflow: 'hidden'
  },
  progressFill: { backgroundColor: colors.primary, height: '100%' },
  controlsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: normalize(56),
    justifyContent: 'space-between',
    paddingHorizontal: normalize(8)
  },
  leftControls: { alignItems: 'center', flexDirection: 'row' },
  controlTouchTarget: {
    alignItems: 'center',
    height: normalize(44),
    justifyContent: 'center',
    width: normalize(44)
  },
  controlVisual: {
    alignItems: 'center',
    backgroundColor: colors.text,
    borderRadius: normalize(18),
    height: normalize(36),
    justifyContent: 'center',
    width: normalize(36)
  },
  controlVisualPressed: { backgroundColor: colors.primary },
  controlText: {
    color: colors.background,
    fontSize: normalize(11),
    fontWeight: '600',
    lineHeight: normalize(14)
  }
});
