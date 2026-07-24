import React, { useContext } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Divider, Overlay } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, consts, Icon, normalize, texts } from '../config';
import { useAccessibilityPreferences } from '../hooks';

import { AppWideGrayscaleFilter } from './AppWideGrayscaleFilter';
import { AccessibilitySettings } from './settings';
import { RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export const AccessibilitySettingsModal = ({ isVisible, onClose }: Props) => {
  const {
    isBoldTextEnabled,
    isGrayscaleEnabled,
    isHighContrastEnabled,
    isReduceMotionEnabled,
    isReduceTransparencyEnabled
  } = useContext(AccessibilityContext);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { resetPreferences } = useAccessibilityPreferences();
  const verticalInsetSpacing = normalize(16);
  const overlayMaxHeight = Math.max(
    normalize(240),
    windowHeight - insets.top - insets.bottom - verticalInsetSpacing * 2
  );

  return (
    <Overlay
      animationType={isReduceMotionEnabled ? 'none' : 'fade'}
      backdropStyle={isReduceTransparencyEnabled ? styles.backdropReducedTransparency : undefined}
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={[
        styles.overlay,
        (isHighContrastEnabled || isReduceTransparencyEnabled) && styles.overlayAccessibleBorder,
        { maxHeight: overlayMaxHeight }
      ]}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <AppWideGrayscaleFilter
        fillContainer={false}
        isGrayscaleEnabled={isGrayscaleEnabled}
        style={styles.grayscaleSurface}
      >
        <View accessibilityViewIsModal importantForAccessibility="yes" style={styles.container}>
          <Wrapper noPaddingTop>
            <View style={styles.headerRow}>
              <View style={styles.headerSpacer} />
              <RegularText
                center
                style={[styles.headerTitle, isBoldTextEnabled && styles.headerTitleBold]}
              >
                {texts.accessibilityModal.title}
              </RegularText>
              <TouchableOpacity
                accessibilityLabel={consts.a11yLabel.closeIcon}
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Icon.Close color={colors.darkText} size={normalize(20)} />
              </TouchableOpacity>
            </View>

            <Wrapper noPaddingTop>
              <WrapperHorizontal>
                <RegularText center small testID="accessibility-modal-description">
                  {texts.accessibilityModal.description}
                </RegularText>
              </WrapperHorizontal>
            </Wrapper>
            <Divider
              style={[(isHighContrastEnabled || isReduceTransparencyEnabled) && styles.divider]}
            />
          </Wrapper>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <AccessibilitySettings hideIntro withResetButton={false} withScrollView={false} />
          </ScrollView>

          <Wrapper noPaddingBottom>
            <Divider
              style={[(isHighContrastEnabled || isReduceTransparencyEnabled) && styles.divider]}
            />
          </Wrapper>
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
        </View>
      </AppWideGrayscaleFilter>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(32),
    marginRight: normalize(-8),
    width: normalize(32)
  },
  container: {
    borderRadius: normalize(8),
    maxHeight: '100%',
    overflow: 'hidden',
    width: '100%'
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0
  },
  contentContainer: {
    paddingBottom: normalize(8)
  },
  divider: {
    backgroundColor: colors.gray40,
    height: normalize(1)
  },
  grayscaleSurface: {
    backgroundColor: colors.surface
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: normalize(48)
  },
  headerSpacer: {
    height: normalize(32),
    width: normalize(32)
  },
  headerTitle: {
    color: colors.darkText,
    flex: 1,
    fontFamily: 'condbold',
    fontSize: normalize(18),
    lineHeight: normalize(23)
  },
  headerTitleBold: {
    fontFamily: 'bold'
  },
  overlay: {
    backgroundColor: colors.surface,
    borderRadius: normalize(8),
    padding: 0,
    width: '95%'
  },
  overlayAccessibleBorder: {
    borderColor: colors.darkText,
    borderWidth: normalize(1)
  },
  resetLink: {
    minHeight: normalize(32),
    justifyContent: 'center'
  },
  backdropReducedTransparency: {
    backgroundColor: colors.darkText
  }
});
