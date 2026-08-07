import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, Pressable, TextStyle, View, ViewStyle } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { device, Icon, normalize, texts } from '../config';
import { DetailSpeechItem } from '../helpers/accessibility/detailSpeechParser';
import { useDetailSpeech } from '../hooks';
import { useTheme } from '../hooks/useTheme';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useReadAloudAvailability } from '../ReadAloudAvailabilityProvider';
import { ThemeColorPalette } from '../types/Theme';

import { RegularText } from './Text';

type Props = {
  isEnabled: boolean;
  items: DetailSpeechItem[];
  onDisable: () => void;
  onEnable: () => void;
};

type PlayerControlProps = {
  disabled?: boolean;
  expanded?: boolean;
  iconName?: string;
  label: string;
  onPress: () => void;
  text?: string;
};

type ReadAlongWord = {
  active: boolean;
  key: string;
  text: string;
};

const FLOATING_BUTTON_SIZE = normalize(56);
const CONTROL_TOUCH_SIZE = normalize(44);
const CONTROL_VISUAL_SIZE = normalize(36);
const COMPACT_PLAYER_HEIGHT = normalize(56);
const EXPANDED_PLAYER_HEIGHT = normalize(112);
const PLAYER_WIDTH = device.width - normalize(32);
const PLAYER_BOTTOM_CLEARANCE = normalize(16);
const SPEED_OPTIONS = [1, 1.2, 1.5, 1.8, 2, 0.5, 0.8];
const TICKER_WORD_COUNT = 7;

const formatSpeechRate = (rate: number) => `${rate.toFixed(1).replace('.', ',')}x`;

export const getNextSpeechRate = (currentRate: number) => {
  const currentIndex = SPEED_OPTIONS.findIndex((rate) => Math.abs(rate - currentRate) < 0.001);

  return SPEED_OPTIONS[(currentIndex + 1) % SPEED_OPTIONS.length];
};

export const getReadAlongWords = (
  text: string,
  activeWordRange?: { length: number; start: number } | null
): ReadAlongWord[] => {
  const matches = Array.from(text.matchAll(/\S+/g)).map((match, index) => ({
    end: (match.index || 0) + match[0].length,
    key: `${match.index || 0}-${index}`,
    start: match.index || 0,
    text: match[0]
  }));

  if (!matches.length) return [];

  const activeStart = Math.max(activeWordRange?.start ?? 0, 0);
  const activeIndex = Math.max(
    matches.findIndex(({ end, start }) => activeStart >= start && activeStart < end),
    0
  );
  const maxStartIndex = Math.max(matches.length - TICKER_WORD_COUNT, 0);
  const startIndex = Math.min(
    Math.max(activeIndex - Math.floor(TICKER_WORD_COUNT / 2), 0),
    maxStartIndex
  );

  return matches.slice(startIndex, startIndex + TICKER_WORD_COUNT).map((word, index) => ({
    active: startIndex + index === activeIndex,
    key: word.key,
    text: word.text
  }));
};

const PlayerControl = ({
  disabled = false,
  expanded,
  iconName,
  label,
  onPress,
  text
}: PlayerControlProps) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, expanded }}
      disabled={disabled}
      onPress={onPress}
      style={styles.controlTouchTarget}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.controlVisual,
            disabled && styles.controlVisualDisabled,
            pressed && !disabled && styles.controlVisualPressed
          ]}
        >
          {text ? (
            <RegularText ignoreTextScale style={styles.speedText}>
              {text}
            </RegularText>
          ) : (
            <Icon.NamedIcon
              color={pressed && !disabled ? colors.onPrimary : colors.background}
              hasNoHitSlop
              name={iconName}
              size={normalize(18)}
              strokeWidth={2}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

// eslint-disable-next-line complexity
export const FloatingReadAloudPlayer = ({ isEnabled, items, onDisable, onEnable }: Props) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const { setPlayerBottomSpacing } = useReadAloudAvailability();
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isReadAlongRendered, setIsReadAlongRendered] = useState(false);
  const [showReadAlong, setShowReadAlong] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [width] = useState(() => new Animated.Value(FLOATING_BUTTON_SIZE));
  const [height] = useState(() => new Animated.Value(COMPACT_PLAYER_HEIGHT));
  const [readAlongProgress] = useState(() => new Animated.Value(0));

  const {
    activeWordRange,
    canSkipNext,
    canSkipPrevious,
    canStart,
    currentItemIndex,
    currentItemText,
    isPaused,
    isSpeaking,
    pause,
    resume,
    skipNext,
    skipPrevious,
    start,
    stop,
    totalItems
  } = useDetailSpeech(items, isEnabled, speechRate);

  const animationDuration = isReduceMotionEnabled ? 0 : 240;
  const rateLabel = formatSpeechRate(speechRate);
  const primaryLabel = isSpeaking
    ? texts.settingsContents.accessibility.readAloud.pause
    : isPaused
    ? texts.settingsContents.accessibility.readAloud.resume
    : texts.settingsContents.accessibility.readAloud.start;
  const progressLabel = texts.settingsContents.accessibility.readAloud.progress
    .replace('{{current}}', String(Math.min(currentItemIndex + 1, totalItems)))
    .replace('{{total}}', String(totalItems));
  const readAlongWords = useMemo(
    () => getReadAlongWords(currentItemText, activeWordRange),
    [activeWordRange, currentItemText]
  );

  const collapsePlayer = useCallback(() => {
    width.stopAnimation();
    height.stopAnimation();
    readAlongProgress.stopAnimation();

    Animated.parallel([
      Animated.timing(width, {
        duration: animationDuration,
        easing: Easing.inOut(Easing.cubic),
        toValue: FLOATING_BUTTON_SIZE,
        useNativeDriver: false
      }),
      Animated.timing(height, {
        duration: animationDuration,
        easing: Easing.inOut(Easing.cubic),
        toValue: COMPACT_PLAYER_HEIGHT,
        useNativeDriver: false
      }),
      Animated.timing(readAlongProgress, {
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: false
      })
    ]).start(({ finished }) => {
      if (!finished) return;
      setIsControlsVisible(false);
      setIsReadAlongRendered(false);
      setShowReadAlong(false);
    });
  }, [animationDuration, height, readAlongProgress, width]);

  useEffect(() => {
    if (isEnabled) return;

    collapsePlayer();
  }, [collapsePlayer, isEnabled]);

  useEffect(() => {
    const targetWidth = isControlsVisible ? PLAYER_WIDTH : FLOATING_BUTTON_SIZE;

    Animated.timing(width, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      toValue: targetWidth,
      useNativeDriver: false
    }).start();
  }, [animationDuration, isControlsVisible, width]);

  useEffect(() => {
    setPlayerBottomSpacing(
      (isReadAlongRendered ? EXPANDED_PLAYER_HEIGHT : COMPACT_PLAYER_HEIGHT) +
        PLAYER_BOTTOM_CLEARANCE
    );

    return () => setPlayerBottomSpacing(0);
  }, [isReadAlongRendered, setPlayerBottomSpacing]);

  const toggleReadAlong = useCallback(() => {
    const shouldShowReadAlong = !showReadAlong;

    height.stopAnimation();
    readAlongProgress.stopAnimation();

    if (shouldShowReadAlong) {
      setIsReadAlongRendered(true);
    }
    setShowReadAlong(shouldShowReadAlong);

    Animated.parallel([
      Animated.timing(height, {
        duration: animationDuration,
        easing: Easing.inOut(Easing.cubic),
        toValue: shouldShowReadAlong ? EXPANDED_PLAYER_HEIGHT : COMPACT_PLAYER_HEIGHT,
        useNativeDriver: false
      }),
      Animated.timing(readAlongProgress, {
        duration: animationDuration,
        easing: Easing.inOut(Easing.cubic),
        toValue: shouldShowReadAlong ? 1 : 0,
        useNativeDriver: false
      })
    ]).start(({ finished }) => {
      if (finished && !shouldShowReadAlong) {
        setIsReadAlongRendered(false);
      }
    });
  }, [animationDuration, height, readAlongProgress, showReadAlong]);

  const primaryAction = useCallback(() => {
    if (isSpeaking) return pause();
    if (isPaused) return resume();
    return start();
  }, [isPaused, isSpeaking, pause, resume, start]);

  const disableReadAloud = useCallback(() => {
    void stop();
    onDisable();
  }, [onDisable, stop]);

  const expandPlayer = useCallback(() => {
    if (!isEnabled) onEnable();
    setIsControlsVisible(true);
  }, [isEnabled, onEnable]);

  const controlsOpacity = width.interpolate({
    extrapolate: 'clamp',
    inputRange: [FLOATING_BUTTON_SIZE, PLAYER_WIDTH],
    outputRange: [0, 1]
  });
  const readAlongTranslateY = readAlongProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [normalize(12), 0]
  });

  if (!items.length) return null;

  if (!isControlsVisible) {
    return (
      <Animated.View style={[styles.shadowContainer, { height, width }]}>
        <View style={[styles.container, styles.floatingContainer]}>
          <Pressable
            accessibilityLabel={
              isEnabled
                ? texts.settingsContents.accessibility.readAloud.expandPlayer
                : texts.settingsContents.accessibility.readAloud.enableQuickToggle
            }
            accessibilityRole="button"
            onPress={expandPlayer}
            style={({ pressed }) => [
              styles.floatingButton,
              pressed && styles.floatingButtonPressed
            ]}
          >
            <Icon.NamedIcon
              color={colors.text}
              hasNoHitSlop
              name="volume"
              size={normalize(24)}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.shadowContainer, { height, width }]}>
      <View style={[styles.container, styles.expandedContainer]}>
        <Animated.View style={[styles.controlsContent, { opacity: controlsOpacity }]}>
          {isReadAlongRendered && (
            <Animated.View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.readAlongRow,
                { opacity: readAlongProgress, transform: [{ translateY: readAlongTranslateY }] }
              ]}
            >
              <View style={styles.readAlongWords}>
                {readAlongWords.map((word) => (
                  <RegularText
                    key={word.key}
                    numberOfLines={1}
                    style={[styles.readAlongWord, word.active && styles.activeWord]}
                    testID={word.active ? 'active-read-along-word' : undefined}
                  >
                    {word.text}
                  </RegularText>
                ))}
              </View>
            </Animated.View>
          )}

          <View accessibilityLabel={progressLabel} style={styles.controlsRow}>
            <View style={styles.leftControls}>
              <PlayerControl
                label={`${texts.settingsContents.accessibility.readAloud.speedTitle}: ${rateLabel}`}
                onPress={() => setSpeechRate((currentRate) => getNextSpeechRate(currentRate))}
                text={rateLabel}
              />
              <PlayerControl
                disabled={!canSkipPrevious}
                iconName="player-skip-back"
                label={texts.settingsContents.accessibility.readAloud.previous}
                onPress={() => void skipPrevious()}
              />
              <PlayerControl
                disabled={!canStart}
                iconName={isSpeaking ? 'player-pause' : 'player-play'}
                label={primaryLabel}
                onPress={() => void primaryAction()}
              />
              <PlayerControl
                disabled={!canSkipNext}
                iconName="player-skip-forward"
                label={texts.settingsContents.accessibility.readAloud.next}
                onPress={() => void skipNext()}
              />
              <PlayerControl
                expanded={showReadAlong}
                iconName={showReadAlong ? 'eye' : 'eye-off'}
                label={
                  showReadAlong
                    ? texts.settingsContents.accessibility.readAloud.hideReadAlong
                    : texts.settingsContents.accessibility.readAloud.showReadAlong
                }
                onPress={toggleReadAlong}
              />
            </View>

            <PlayerControl
              iconName="volume-off"
              label={texts.settingsContents.accessibility.readAloud.disableQuickToggle}
              onPress={disableReadAloud}
            />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const createStyles = (colors: ThemeColorPalette): Record<string, TextStyle | ViewStyle> => ({
  activeWord: {
    borderBottomColor: colors.primary,
    borderBottomWidth: normalize(4),
    color: colors.text,
    paddingBottom: normalize(1)
  },

  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: FLOATING_BUTTON_SIZE / 2,
    flex: 1,
    overflow: 'hidden'
  },

  controlsContent: {
    flex: 1
  },

  expandedContainer: {
    borderColor: colors.text,
    borderWidth: normalize(1.5)
  },

  shadowContainer: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: FLOATING_BUTTON_SIZE / 2,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 14
      },
      android: {
        elevation: 10
      }
    })
  },

  controlTouchTarget: {
    alignItems: 'center',
    height: CONTROL_TOUCH_SIZE,
    justifyContent: 'center',
    width: CONTROL_TOUCH_SIZE
  },

  controlVisual: {
    alignItems: 'center',
    backgroundColor: colors.text,
    borderRadius: CONTROL_VISUAL_SIZE / 2,
    height: CONTROL_VISUAL_SIZE,
    justifyContent: 'center',
    width: CONTROL_VISUAL_SIZE
  },

  controlVisualDisabled: {
    backgroundColor: colors.gray60
  },

  controlVisualPressed: {
    backgroundColor: colors.primary
  },

  controlsRow: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    height: COMPACT_PLAYER_HEIGHT,
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: normalize(8),
    position: 'absolute',
    right: 0
  },

  floatingButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },

  floatingButtonPressed: {
    backgroundColor: colors.gray20
  },

  floatingContainer: {
    borderRadius: FLOATING_BUTTON_SIZE / 2
  },

  leftControls: {
    alignItems: 'center',
    flexDirection: 'row'
  },

  readAlongRow: {
    alignItems: 'center',
    height: COMPACT_PLAYER_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: normalize(20)
  },

  readAlongWords: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center'
  },

  readAlongWord: {
    color: colors.textMuted,
    fontSize: normalize(14),
    fontWeight: '400',
    lineHeight: normalize(24),
    marginHorizontal: normalize(2),
    paddingBottom: normalize(1)
  },

  speedText: {
    color: colors.background,
    fontSize: normalize(11),
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: normalize(14)
  }
});
