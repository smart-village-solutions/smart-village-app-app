import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, normalize, texts } from '../../config';
import { Button } from '../Button';
import { RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  canStart: boolean;
  currentItemIndex: number;
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
  canStart,
  currentItemIndex,
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

  return (
    <WrapperHorizontal>
      <View style={styles.container}>
        <WrapperVertical noPaddingBottom noPaddingTop>
          <RegularText small>{texts.settingsContents.accessibility.readAloud.title}</RegularText>
          <RegularText small style={styles.progressText}>
            {progress}
          </RegularText>
        </WrapperVertical>

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
                  accessibilityRole="button"
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
    </WrapperHorizontal>
  );
};

const styles = StyleSheet.create({
  buttonsRow: {
    marginTop: normalize(4)
  },
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.gray40,
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    marginTop: normalize(8),
    marginBottom: normalize(12),
    padding: normalize(12)
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
