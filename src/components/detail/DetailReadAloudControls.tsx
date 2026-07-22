import React from 'react';
import { Pressable, View } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { consts, normalize, texts } from '../../config';
import { Button } from '../Button';
import { RegularText } from '../Text';
import { Wrapper, WrapperRow, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';

type Props = {
  activeItemId?: string;
  activeWordRange?: { length: number; start: number } | null;
  canStart: boolean;
  currentItemIndex: number;
  currentItemText: string;
  isPaused: boolean;
  isSpeaking: boolean;
  onPause: () => void | Promise<void>;
  onResume: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  totalItems: number;
};

export const DetailReadAloudControls = ({
  activeItemId,
  activeWordRange,
  canStart,
  currentItemIndex,
  currentItemText,
  isPaused,
  isSpeaking,
  onPause,
  onResume,
  onStart,
  onStop,
  onSpeechRateChange,
  speechRate,
  totalItems
}: Props) => {
  const styles = useThemeStyles(createStyles);
  const [showReadAlongText, setShowReadAlongText] = React.useState(false);
  const { isHighContrastEnabled } = React.useContext(AccessibilityContext);

  if (!canStart || totalItems < 1) return null;

  const primaryTitle = isSpeaking
    ? texts.settingsContents.accessibility.readAloud.pause
    : isPaused
    ? texts.settingsContents.accessibility.readAloud.resume
    : texts.settingsContents.accessibility.readAloud.start;

  const primaryAction = isSpeaking ? onPause : isPaused ? onResume : onStart;
  const progress = texts.settingsContents.accessibility.readAloud.progress
    .replace('{{current}}', String(Math.min(currentItemIndex + 1, totalItems)))
    .replace('{{total}}', String(totalItems));
  const speedOptions = [
    { label: texts.settingsContents.accessibility.readAloud.speedSlow, value: 0.8 },
    { label: texts.settingsContents.accessibility.readAloud.speedNormal, value: 1.0 },
    { label: texts.settingsContents.accessibility.readAloud.speedFast, value: 1.2 }
  ];
  const shouldHighlightActiveWord =
    isHighContrastEnabled &&
    isSpeaking &&
    !!activeItemId &&
    !!activeWordRange &&
    activeWordRange.length > 0 &&
    activeWordRange.start >= 0;
  const readAlongToggleTitle = showReadAlongText
    ? texts.settingsContents.accessibility.readAloud.hideReadAlong
    : texts.settingsContents.accessibility.readAloud.showReadAlong;

  const renderCurrentText = () => {
    if (!currentItemText?.length) return null;

    if (!shouldHighlightActiveWord || !activeWordRange) {
      return <RegularText small>{currentItemText}</RegularText>;
    }

    const safeStart = Math.min(activeWordRange.start, currentItemText.length);
    const safeEnd = Math.min(safeStart + activeWordRange.length, currentItemText.length);
    const before = currentItemText.slice(0, safeStart);
    const active = currentItemText.slice(safeStart, safeEnd);
    const after = currentItemText.slice(safeEnd);

    return (
      <RegularText small>
        {before}
        <RegularText small style={styles.activeWord}>
          {active}
        </RegularText>
        {after}
      </RegularText>
    );
  };

  return (
    <Wrapper noPaddingBottom>
      <View style={styles.container}>
        <WrapperVertical noPaddingBottom noPaddingTop>
          <RegularText small>{texts.settingsContents.accessibility.readAloud.title}</RegularText>
          <RegularText small style={styles.progressText}>
            {progress}
          </RegularText>
        </WrapperVertical>

        <Pressable
          accessibilityLabel={`${readAlongToggleTitle} ${consts.a11yLabel.button}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: showReadAlongText }}
          onPress={() => setShowReadAlongText((prev) => !prev)}
          style={styles.readAlongToggle}
        >
          <RegularText small style={styles.readAlongToggleText}>
            {readAlongToggleTitle}
          </RegularText>
        </Pressable>

        {showReadAlongText && !!currentItemText?.length && (
          <View style={styles.currentTextSection}>
            <RegularText small style={styles.currentTextTitle}>
              {texts.settingsContents.accessibility.readAloud.currentTextLabel}
            </RegularText>
            {renderCurrentText()}
          </View>
        )}

        <View style={styles.speedSection}>
          <RegularText small style={styles.speedTitle}>
            {texts.settingsContents.accessibility.readAloud.speedTitle}
          </RegularText>
          <WrapperRow style={styles.speedOptionsRow}>
            {speedOptions.map((option, index) => {
              const isSelected = Math.abs(speechRate - option.value) < 0.001;
              const isLast = index === speedOptions.length - 1;

              return (
                <Pressable
                  accessibilityLabel={`${option.label} ${consts.a11yLabel.button}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={option.value}
                  onPress={() => onSpeechRateChange(option.value)}
                  style={[
                    styles.speedChip,
                    !isLast && styles.speedChipSpacing,
                    isSelected && styles.speedChipSelected
                  ]}
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
          </WrapperRow>
        </View>

        <WrapperRow style={styles.buttonsRow}>
          <View style={styles.primaryButton}>
            <Button onPress={primaryAction} small title={primaryTitle} />
          </View>
          <View style={styles.secondaryButton}>
            <Button
              invert
              disabled={!isSpeaking && !isPaused}
              onPress={onStop}
              small
              title={texts.settingsContents.accessibility.readAloud.stop}
            />
          </View>
        </WrapperRow>
      </View>
    </Wrapper>
  );
};

const createStyles = (colors) => ({
  activeWord: {
    backgroundColor: colors.darkText,
    color: colors.lightestText
  },

  buttonsRow: {
    marginTop: normalize(4)
  },

  container: {
    backgroundColor: colors.surface,
    borderColor: colors.gray40,
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    padding: normalize(12)
  },

  currentTextSection: {
    marginBottom: normalize(8)
  },

  currentTextTitle: {
    color: colors.placeholder,
    marginBottom: normalize(4)
  },

  readAlongToggle: {
    alignSelf: 'flex-start',
    marginBottom: normalize(8)
  },

  readAlongToggleText: {
    color: colors.primary,
    textDecorationLine: 'underline'
  },

  primaryButton: {
    flex: 1,
    marginRight: normalize(8)
  },

  progressText: {
    color: colors.placeholder
  },

  speedChip: {
    alignItems: 'center',
    borderColor: colors.gray40,
    borderRadius: normalize(14),
    borderWidth: normalize(1),
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(6)
  },

  speedChipSpacing: {
    marginRight: normalize(8)
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

  speedOptionsRow: {
    marginTop: normalize(6),
    width: '100%'
  },

  speedSection: {
    marginBottom: normalize(8),
    marginTop: normalize(8)
  },

  speedTitle: {
    color: colors.placeholder
  },

  secondaryButton: {
    flex: 1
  }
});
