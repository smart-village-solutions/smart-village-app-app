import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, consts, Icon, normalize, texts } from '../config';

import { AccessibilitySettings } from './settings';
import { HeadlineText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export const AccessibilitySettingsModal = ({ isVisible, onClose }: Props) => {
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);

  return (
    <Overlay
      animationType={isReduceMotionEnabled ? 'none' : 'fade'}
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <View accessibilityViewIsModal importantForAccessibility="yes" style={styles.container}>
        <TouchableOpacity
          accessibilityLabel={consts.a11yLabel.closeIcon}
          accessibilityRole="button"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Icon.Close color={colors.lighterPrimary} size={normalize(16)} />
        </TouchableOpacity>

        <Wrapper style={styles.headerWrapper}>
          <WrapperHorizontal>
            <HeadlineText center>{texts.accessibilityModal.title}</HeadlineText>
          </WrapperHorizontal>
        </Wrapper>

        <Wrapper noPaddingTop>
          <WrapperHorizontal>
            <RegularText center small>
              {texts.accessibilityModal.description}
            </RegularText>
          </WrapperHorizontal>
        </Wrapper>

        <AccessibilitySettings hideIntro withResetButton />
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.darkText,
    borderRadius: normalize(16),
    height: normalize(32),
    justifyContent: 'center',
    opacity: 0.64,
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(32),
    zIndex: 1
  },
  container: {
    borderRadius: normalize(8),
    maxHeight: '92%',
    width: '100%'
  },
  headerWrapper: {
    paddingBottom: normalize(8)
  },
  overlay: {
    borderRadius: normalize(8),
    maxHeight: '92%',
    padding: 0,
    width: '95%'
  }
});
