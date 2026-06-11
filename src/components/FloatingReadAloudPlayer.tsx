import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, device, Icon, normalize, texts } from '../config';
import { DetailSpeechItem } from '../helpers/accessibility/detailSpeechParser';
import { useDetailSpeech } from '../hooks';
import { useReadAloudAvailability } from '../ReadAloudAvailabilityProvider';

import { RegularText } from './Text';

type Props = {
  items: DetailSpeechItem[];
};

const CONTROL_SIZE = normalize(40);
const FLOATING_BUTTON_SIZE = normalize(56);
const PLAYER_WIDTH = Math.min(device.width - normalize(95), normalize(390));
const EXPANDED_PLAYER_WIDTH = device.width - normalize(32);
const EXPANDED_PLAYER_OVERLAP = FLOATING_BUTTON_SIZE;
const EXPANDED_CONTROLS_INSET = FLOATING_BUTTON_SIZE + normalize(8);
const SMALL_PLAYER_HEIGHT = normalize(56);
const EXPANDED_PLAYER_HEIGHT = Math.min(device.height * 0.52, normalize(360));
const TEXT_SCROLL_END_PADDING = normalize(16);
const PLAYER_BOTTOM_SPACING = {
  collapsed: SMALL_PLAYER_HEIGHT + normalize(40),
  expanded: EXPANDED_PLAYER_HEIGHT + normalize(40)
};

const SPEED_OPTIONS = [
  { label: texts.settingsContents.accessibility.readAloud.speedSlow, value: 0.8 },
  { label: texts.settingsContents.accessibility.readAloud.speedNormal, value: 1.0 },
  { label: texts.settingsContents.accessibility.readAloud.speedFast, value: 1.2 }
];

// eslint-disable-next-line complexity
export const FloatingReadAloudPlayer = ({ items }: Props) => {
  const { isHighContrastEnabled } = useContext(AccessibilityContext);
  const { setPlayerBottomSpacing } = useReadAloudAvailability();
  const [isExpanded, setIsExpanded] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [textContentHeight, setTextContentHeight] = useState(0);
  const [textViewportHeight, setTextViewportHeight] = useState(0);
  const [previewContentWidth, setPreviewContentWidth] = useState(0);
  const [previewViewportWidth, setPreviewViewportWidth] = useState(0);
  const [heightAnimation] = useState(() => new Animated.Value(SMALL_PLAYER_HEIGHT));
  const scrollViewRef = useRef<ScrollView>(null);
  const previewScrollViewRef = useRef<ScrollView>(null);

  const {
    activeItemId,
    activeWordRange,
    canStart,
    currentItemIndex,
    currentItemText,
    isPaused,
    isSpeaking,
    pause,
    resume,
    start,
    stop
  } = useDetailSpeech(items, true, speechRate);

  const itemOffsets = useMemo(() => {
    return items.reduce<{ offset: number; values: number[] }>(
      (acc, item, index) => ({
        offset: acc.offset + item.text.length + (index < items.length - 1 ? 2 : 0),
        values: [...acc.values, acc.offset]
      }),
      { offset: 0, values: [] }
    ).values;
  }, [items]);

  const allText = useMemo(() => items.map((item) => item.text).join('\n\n'), [items]);
  const activeGlobalWordRange = useMemo(() => {
    if (!activeWordRange) return null;

    return {
      length: activeWordRange.length,
      start: (itemOffsets[currentItemIndex] || 0) + activeWordRange.start
    };
  }, [activeWordRange, currentItemIndex, itemOffsets]);

  useEffect(() => {
    Animated.timing(heightAnimation, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
      toValue: isExpanded ? EXPANDED_PLAYER_HEIGHT : SMALL_PLAYER_HEIGHT,
      useNativeDriver: false
    }).start();

    setPlayerBottomSpacing(
      isExpanded ? PLAYER_BOTTOM_SPACING.expanded : PLAYER_BOTTOM_SPACING.collapsed
    );

    return () => setPlayerBottomSpacing(0);
  }, [heightAnimation, isExpanded, setPlayerBottomSpacing]);

  useEffect(() => {
    if (!isExpanded || !activeGlobalWordRange || !allText.length) return;
    if (textContentHeight <= textViewportHeight) return;

    const activeWordEnd = activeGlobalWordRange.start + activeGlobalWordRange.length;
    const readProgress = Math.min(activeWordEnd / allText.length, 1);
    const visibleTextRatio = Math.min(textViewportHeight / textContentHeight, 1);
    const scrollStartProgress = Math.min(0.18, Math.max(0.06, visibleTextRatio * 0.45));
    const adjustedProgress =
      readProgress <= scrollStartProgress
        ? 0
        : (readProgress - scrollStartProgress) / (1 - scrollStartProgress);
    const maxScrollY = Math.max(textContentHeight - textViewportHeight, 0);

    scrollViewRef.current?.scrollTo({
      animated: true,
      y: Math.max(0, maxScrollY * adjustedProgress)
    });
  }, [activeGlobalWordRange, allText.length, isExpanded, textContentHeight, textViewportHeight]);

  useEffect(() => {
    if (!isSpeaking || !activeWordRange || !currentItemText.length) {
      previewScrollViewRef.current?.scrollTo({ animated: true, x: 0 });
      return;
    }

    if (previewContentWidth <= previewViewportWidth) return;

    const activeWordEnd = Math.min(
      activeWordRange.start + activeWordRange.length,
      currentItemText.length
    );
    const readProgress = activeWordEnd / currentItemText.length;
    const maxScrollX = Math.max(previewContentWidth - previewViewportWidth, 0);
    const targetScrollX = readProgress * previewContentWidth - previewViewportWidth + normalize(20);

    previewScrollViewRef.current?.scrollTo({
      animated: true,
      x: Math.min(Math.max(0, targetScrollX), maxScrollX)
    });
  }, [
    activeWordRange,
    currentItemText.length,
    isSpeaking,
    previewContentWidth,
    previewViewportWidth
  ]);

  const primaryAction = useCallback(() => {
    if (isSpeaking) return pause();
    if (isPaused) return resume();
    return start();
  }, [isPaused, isSpeaking, pause, resume, start]);

  const primaryLabel = isSpeaking
    ? texts.settingsContents.accessibility.readAloud.pause
    : isPaused
    ? texts.settingsContents.accessibility.readAloud.resume
    : texts.settingsContents.accessibility.readAloud.start;

  const shouldHighlightActiveWord =
    isHighContrastEnabled &&
    isSpeaking &&
    !!activeItemId &&
    !!activeGlobalWordRange &&
    activeGlobalWordRange.length > 0 &&
    activeGlobalWordRange.start >= 0;
  const shouldHighlightPreviewWord =
    isHighContrastEnabled &&
    isSpeaking &&
    !!activeItemId &&
    !!activeWordRange &&
    activeWordRange.length > 0 &&
    activeWordRange.start >= 0;

  const renderedPreviewText = useMemo(() => {
    const previewText = currentItemText || texts.settingsContents.accessibility.readAloud.title;

    if (!currentItemText.length || !shouldHighlightPreviewWord || !activeWordRange) {
      return (
        <RegularText numberOfLines={1} small style={styles.previewText}>
          {previewText}
        </RegularText>
      );
    }

    const safeStart = Math.min(activeWordRange.start, currentItemText.length);
    const safeEnd = Math.min(safeStart + activeWordRange.length, currentItemText.length);

    return (
      <RegularText numberOfLines={1} small style={styles.previewText}>
        {currentItemText.slice(0, safeStart)}
        <RegularText small style={styles.activeWord}>
          {currentItemText.slice(safeStart, safeEnd)}
        </RegularText>
        {currentItemText.slice(safeEnd)}
      </RegularText>
    );
  }, [activeWordRange, currentItemText, shouldHighlightPreviewWord]);

  const renderedFullText = useMemo(() => {
    if (!allText.length) return null;

    if (!shouldHighlightActiveWord || !activeGlobalWordRange) {
      return <RegularText small>{allText}</RegularText>;
    }

    const safeStart = Math.min(activeGlobalWordRange.start, allText.length);
    const safeEnd = Math.min(safeStart + activeGlobalWordRange.length, allText.length);

    return (
      <RegularText small>
        {allText.slice(0, safeStart)}
        <RegularText small style={styles.activeWord}>
          {allText.slice(safeStart, safeEnd)}
        </RegularText>
        {allText.slice(safeEnd)}
      </RegularText>
    );
  }, [activeGlobalWordRange, allText, shouldHighlightActiveWord]);

  if (!canStart) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        isExpanded && styles.expandedContainer,
        { height: heightAnimation }
      ]}
    >
      {isExpanded && (
        <View style={styles.expandedBody}>
          <Pressable
            accessibilityLabel={texts.settingsContents.accessibility.readAloud.collapsePlayer}
            accessibilityRole="button"
            onPress={() => setIsExpanded(false)}
            style={styles.collapseButton}
          >
            <Icon.NamedIcon color={colors.darkText} name="chevron-down" size={normalize(22)} />
          </Pressable>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.textScrollContent}
            onContentSizeChange={(_, height) => setTextContentHeight(height)}
            onLayout={(event) => setTextViewportHeight(event.nativeEvent.layout.height)}
            showsVerticalScrollIndicator
            style={styles.textScrollView}
          >
            {renderedFullText}
          </ScrollView>
        </View>
      )}

      <View style={[styles.controlsRow, isExpanded && styles.expandedControlsRow]}>
        <View style={styles.leftControls}>
          <Pressable
            accessibilityLabel={primaryLabel}
            accessibilityRole="button"
            onPress={primaryAction}
            style={[styles.iconButton, styles.primaryButton]}
          >
            <Icon.NamedIcon
              color={colors.lightestText}
              name={isSpeaking ? 'player-pause-filled' : 'player-play-filled'}
              size={normalize(22)}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={texts.settingsContents.accessibility.readAloud.stop}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isSpeaking && !isPaused }}
            disabled={!isSpeaking && !isPaused}
            onPress={stop}
            style={[
              styles.iconButton,
              styles.stopButton,
              !isSpeaking && !isPaused && styles.disabledButton
            ]}
          >
            <Icon.NamedIcon
              color={colors.darkText}
              name="player-stop-filled"
              size={normalize(20)}
            />
          </Pressable>
        </View>

        {isExpanded ? (
          <View style={styles.speedOptions}>
            {SPEED_OPTIONS.map((option) => {
              const isSelected = Math.abs(speechRate - option.value) < 0.001;

              return (
                <Pressable
                  accessibilityLabel={`${option.label} ${texts.settingsContents.accessibility.readAloud.speedTitle}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={option.value}
                  onPress={() => setSpeechRate(option.value)}
                  style={[styles.speedChip, isSelected && styles.speedChipSelected]}
                >
                  <RegularText
                    ignoreTextScale
                    small
                    style={[styles.speedChipText, isSelected && styles.speedChipTextSelected]}
                  >
                    {option.label}
                  </RegularText>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Pressable
            accessibilityLabel={texts.settingsContents.accessibility.readAloud.expandPlayer}
            accessibilityRole="button"
            onPress={() => setIsExpanded(true)}
            style={styles.currentTextPreview}
          >
            <ScrollView
              ref={previewScrollViewRef}
              contentContainerStyle={styles.previewScrollContent}
              horizontal
              onContentSizeChange={(width) => setPreviewContentWidth(width)}
              onLayout={(event) => setPreviewViewportWidth(event.nativeEvent.layout.width)}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              style={styles.previewScrollView}
            >
              {renderedPreviewText}
            </ScrollView>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  activeWord: {
    backgroundColor: colors.darkText,
    color: colors.lightestText
  },
  collapseButton: {
    alignItems: 'center',
    height: CONTROL_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: CONTROL_SIZE,
    zIndex: 1
  },
  container: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
    borderColor: colors.gray40,
    borderRadius: normalize(8),
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: normalize(8),
    overflow: 'hidden',
    padding: normalize(8),
    width: PLAYER_WIDTH,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.28,
        shadowRadius: 8
      },
      android: {
        elevation: 8
      }
    })
  },
  controlsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: CONTROL_SIZE
  },
  currentTextPreview: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: CONTROL_SIZE,
    minWidth: 0,
    paddingHorizontal: normalize(10)
  },
  disabledButton: {
    opacity: 0.45
  },
  expandedBody: {
    flex: 1,
    paddingBottom: normalize(10)
  },
  expandedContainer: {
    marginRight: -EXPANDED_PLAYER_OVERLAP,
    width: EXPANDED_PLAYER_WIDTH
  },
  expandedControlsRow: {
    paddingRight: EXPANDED_CONTROLS_INSET
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: CONTROL_SIZE / 2,
    height: CONTROL_SIZE,
    justifyContent: 'center',
    width: CONTROL_SIZE
  },
  leftControls: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  previewText: {
    color: colors.darkText
  },
  previewScrollContent: {
    alignItems: 'center'
  },
  previewScrollView: {
    flex: 1
  },
  primaryButton: {
    backgroundColor: colors.primary,
    marginRight: normalize(8)
  },
  speedChip: {
    alignItems: 'center',
    borderColor: colors.gray40,
    borderRadius: normalize(14),
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    marginLeft: normalize(6),
    minWidth: 0,
    paddingHorizontal: normalize(4),
    paddingVertical: normalize(6)
  },
  speedChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  speedChipText: {
    color: colors.darkText
  },
  speedChipTextSelected: {
    color: colors.lightestText
  },
  speedOptions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
    paddingLeft: normalize(4)
  },
  stopButton: {
    backgroundColor: colors.gray40
  },
  textScrollContent: {
    paddingBottom: TEXT_SCROLL_END_PADDING,
    paddingRight: normalize(30)
  },
  textScrollView: {
    flex: 1
  }
});
