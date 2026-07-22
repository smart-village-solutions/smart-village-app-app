import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ListItem, Slider } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../../config';
import { ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS, normalizeTextScaleLevel } from '../../helpers';
import { useAccessibilityPreferences } from '../../hooks';
import { ThemeMode } from '../../types/Theme';
import { SettingsToggle } from '../SettingsToggle';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';

import { ThemeModeSelector } from './ThemeModeSelector';

type Props = {
  hideIntro?: boolean;
  withResetButton?: boolean;
  withScrollView?: boolean;
};

type Definition = {
  description?: string;
  featureKey: keyof ReturnType<typeof useAccessibilityPreferences>['features'];
  key: Exclude<
    keyof ReturnType<typeof useAccessibilityPreferences>['preferences'],
    'textScaleLevel'
  >;
  title: string;
};

const SETTINGS_DEFINITIONS: Definition[] = [
  {
    key: 'boldTextEnabled',
    featureKey: 'boldText',
    title: texts.settingsContents.accessibility.boldText.title,
    description: texts.settingsContents.accessibility.boldText.description
  },
  {
    key: 'isGrayscaleEnabled',
    featureKey: 'isGrayscaleEnabled',
    title: texts.settingsContents.accessibility.isGrayscaleEnabled.title,
    description: texts.settingsContents.accessibility.isGrayscaleEnabled.description
  },
  {
    key: 'highContrastEnabled',
    featureKey: 'highContrast',
    title: texts.settingsContents.accessibility.highContrast.title,
    description: texts.settingsContents.accessibility.highContrast.description
  },
  {
    key: 'reduceMotionEnabled',
    featureKey: 'reduceMotion',
    title: texts.settingsContents.accessibility.reduceMotion.title,
    description: texts.settingsContents.accessibility.reduceMotion.description
  },
  {
    key: 'reduceTransparencyEnabled',
    featureKey: 'reduceTransparency',
    title: texts.settingsContents.accessibility.reduceTransparency.title,
    description: texts.settingsContents.accessibility.reduceTransparency.description
  },
  {
    key: 'readAloudEnabled',
    featureKey: 'readAloud',
    title: texts.settingsContents.accessibility.readAloud.title,
    description: texts.settingsContents.accessibility.readAloud.description
  }
];

type ThemeControlProps = {
  enabled: boolean;
  onChange: (mode: ThemeMode) => void;
  value: ThemeMode;
};

const ThemeControl = ({ enabled, onChange, value }: ThemeControlProps) => {
  if (!enabled) return null;

  return (
    <WrapperHorizontal>
      <ThemeModeSelector onChange={onChange} value={value} />
    </WrapperHorizontal>
  );
};

const hasEnabledControls = (
  showTextScaleControl: boolean,
  showThemeControl: boolean,
  availableSettingsCount: number
) => showTextScaleControl || showThemeControl || availableSettingsCount > 0;

export const AccessibilitySettings = ({
  hideIntro = false,
  withResetButton = true,
  withScrollView = true
}: Props) => {
  const {
    features,
    isHighContrastEnabled,
    preferences,
    resetPreferences,
    setPreference,
    setTextScaleLevel,
    setThemeMode,
    themeMode
  } = useAccessibilityPreferences();

  const availableSettings = SETTINGS_DEFINITIONS.filter((setting) => features[setting.featureKey]);
  const textScaleLevel = normalizeTextScaleLevel(preferences.textScaleLevel);
  const textScaleLevelLabels = useMemo(
    () => [
      texts.settingsContents.accessibility.textSize.levelSmallest,
      texts.settingsContents.accessibility.textSize.levelSmall,
      texts.settingsContents.accessibility.textSize.levelDefault,
      texts.settingsContents.accessibility.textSize.levelLarge,
      texts.settingsContents.accessibility.textSize.levelLarger,
      texts.settingsContents.accessibility.textSize.levelLargest,
      texts.settingsContents.accessibility.textSize.levelMaximum
    ],
    []
  );
  const canDecreaseTextScale = textScaleLevel > 0;
  const canIncreaseTextScale = textScaleLevel < ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS.length - 1;
  const showTextScaleControl = features.textScaling;
  const showThemeControl = features.theming;
  const hasControls = hasEnabledControls(
    showTextScaleControl,
    showThemeControl,
    availableSettings.length
  );

  const content = (
    <>
      {!hideIntro && (
        <WrapperHorizontal>
          <WrapperVertical>
            <RegularText>{texts.settingsContents.accessibility.intro}</RegularText>
          </WrapperVertical>
        </WrapperHorizontal>
      )}

      <ThemeControl enabled={showThemeControl} onChange={setThemeMode} value={themeMode} />

      {showTextScaleControl && (
        <WrapperHorizontal>
          <ListItem
            accessibilityLabel={`${texts.settingsContents.accessibility.textSize.title} ${consts.a11yLabel.button}`}
            bottomDivider={!availableSettings.length}
            containerStyle={styles.listItem}
          >
            <ListItem.Content>
              <BoldText small>{texts.settingsContents.accessibility.textSize.title}</BoldText>
              <RegularText small>
                {texts.settingsContents.accessibility.textSize.description}
              </RegularText>

              <WrapperVertical noPaddingBottom noPaddingTop>
                <View style={styles.textScaleRow}>
                  <Touchable
                    accessibilityLabel={texts.accessibilityLabels.actions.decreaseTextSize}
                    accessibilityState={{ disabled: !canDecreaseTextScale }}
                    disabled={!canDecreaseTextScale}
                    onPress={() => setTextScaleLevel(textScaleLevel - 1)}
                    style={[
                      styles.textScaleButton,
                      isHighContrastEnabled && styles.textScaleButtonHighContrast,
                      !canDecreaseTextScale && styles.textScaleButtonDisabled
                    ]}
                  >
                    <RegularText ignoreTextScale>
                      {texts.settingsContents.accessibility.textSize.decreaseLabel}
                    </RegularText>
                  </Touchable>

                  <View style={styles.sliderContainer}>
                    <Slider
                      accessibilityLabel={texts.settingsContents.accessibility.textSize.sliderLabel}
                      maximumTrackTintColor={colors.gray40}
                      maximumValue={ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS.length - 1}
                      minimumTrackTintColor={colors.primary}
                      minimumValue={0}
                      onSlidingComplete={(value) => setTextScaleLevel(value)}
                      step={1}
                      style={styles.slider}
                      thumbStyle={styles.sliderThumb}
                      thumbTouchSize={{ height: normalize(44), width: normalize(44) }}
                      value={textScaleLevel}
                    />
                  </View>

                  <Touchable
                    accessibilityLabel={texts.accessibilityLabels.actions.increaseTextSize}
                    accessibilityState={{ disabled: !canIncreaseTextScale }}
                    disabled={!canIncreaseTextScale}
                    onPress={() => setTextScaleLevel(textScaleLevel + 1)}
                    style={[
                      styles.textScaleButton,
                      isHighContrastEnabled && styles.textScaleButtonHighContrast,
                      !canIncreaseTextScale && styles.textScaleButtonDisabled
                    ]}
                  >
                    <RegularText big ignoreTextScale>
                      {texts.settingsContents.accessibility.textSize.increaseLabel}
                    </RegularText>
                  </Touchable>
                </View>

                <RegularText small>
                  {texts.settingsContents.accessibility.textSize.currentValue.replace(
                    '{{value}}',
                    textScaleLevelLabels[textScaleLevel]
                  )}
                </RegularText>
              </WrapperVertical>
            </ListItem.Content>
          </ListItem>
        </WrapperHorizontal>
      )}

      {availableSettings.map((setting) => (
        <WrapperHorizontal key={setting.key}>
          <SettingsToggle
            needsConnection={false}
            item={{
              description: setting.description,
              onActivate: () => setPreference(setting.key, true),
              onDeactivate: () => setPreference(setting.key, false),
              title: setting.title,
              value: preferences[setting.key]
            }}
          />
        </WrapperHorizontal>
      ))}

      {withResetButton && hasControls && (
        <Wrapper itemsCenter>
          <TouchableOpacity
            accessibilityLabel={`${texts.settingsContents.accessibility.reset} ${consts.a11yLabel.button}`}
            accessibilityRole="button"
            onPress={resetPreferences}
            style={styles.resetLink}
          >
            <RegularText primary underline>
              {texts.settingsContents.accessibility.reset}
            </RegularText>
          </TouchableOpacity>
        </Wrapper>
      )}
    </>
  );

  if (!withScrollView) {
    return content;
  }

  return <ScrollView>{content}</ScrollView>;
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: normalize(10)
  },
  resetLink: {
    minHeight: normalize(32),
    justifyContent: 'center'
  },
  slider: {
    marginHorizontal: 0,
    width: '100%'
  },
  sliderContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    marginHorizontal: normalize(12)
  },
  sliderThumb: {
    backgroundColor: colors.primary,
    height: normalize(20),
    width: normalize(20)
  },
  textScaleButton: {
    alignItems: 'center',
    borderColor: colors.gray40,
    borderRadius: normalize(18),
    borderWidth: normalize(1),
    justifyContent: 'center',
    minHeight: normalize(36),
    minWidth: normalize(72),
    paddingHorizontal: normalize(8)
  },
  textScaleButtonHighContrast: {
    borderColor: colors.darkText
  },
  textScaleButtonDisabled: {
    opacity: 0.5
  },
  textScaleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: normalize(8),
    marginTop: normalize(8),
    width: '100%'
  }
});
