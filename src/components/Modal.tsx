import React from 'react';
import { StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';

import { normalize, texts } from '../config';

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
  return (
    <Overlay
      animationType="fade"
      isVisible={isVisible}
      onBackdropPress={isBackdropPress ? onModalVisible : undefined}
      overlayStyle={[!isListView && styles.overlay, styles.overlayWidth, { height }, overlayStyle]}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <>
        {children}

        {closeButton || (
          <Touchable onPress={onModalVisible}>
            <BoldText center underline primary>
              {modalHiddenButtonName}
            </BoldText>
          </Touchable>
        )}
      </>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: normalize(8),
    padding: normalize(30)
  },
  overlayWidth: {
    width: '80%'
  }
});
