import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Overlay } from 'react-native-elements';

import { AccessibilityContext } from '../AccessibilityProvider';
import { consts, normalize, texts } from '../config';
import { useTheme } from '../hooks/useTheme';

import { BoldText } from './Text';
import { Touchable } from './Touchable';

type TModal = {
  children: React.ReactNode;
  closeButton?: React.ReactNode;
  height?: string;
  isBackdropPress: boolean;
  isListView: boolean;
  isVisible: boolean;
  modalHiddenButtonName?: string;
  onModalVisible: () => void;
  overlayStyle?: object;
};

export const Modal = ({
  children,
  closeButton,
  height = 'auto',
  isBackdropPress,
  isListView,
  isVisible,
  modalHiddenButtonName = texts.settingsTitles.arListLayouts.hide,
  onModalVisible,
  overlayStyle
}: TModal) => {
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Overlay
      animationType={isReduceMotionEnabled ? 'none' : 'fade'}
      isVisible={isVisible}
      onBackdropPress={isBackdropPress ? onModalVisible : undefined}
      overlayStyle={[!isListView && styles.overlay, styles.overlayWidth, { height }, overlayStyle]}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <View accessibilityViewIsModal importantForAccessibility="yes">
        {children}

        {closeButton || (
          <Touchable
            accessibilityLabel={consts.a11yLabel.closeIcon}
            accessibilityRole="button"
            onPress={onModalVisible}
          >
            <BoldText center underline primary>
              {modalHiddenButtonName}
            </BoldText>
          </Touchable>
        )}
      </View>
    </Overlay>
  );
};

/* Dynamic theme styles cannot be resolved by react-native/no-unused-styles. */
/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    overlay: {
      backgroundColor: colors.surface,
      borderRadius: normalize(8),
      padding: normalize(30)
    },
    overlayWidth: {
      width: '80%'
    }
  });
/* eslint-enable react-native/no-unused-styles */
