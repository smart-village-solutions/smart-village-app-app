import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';

import { colors, normalize, texts } from '../config';

import { BoldText } from './Text';
import { Touchable } from './Touchable';

export const Modal = ({ children, isBackdropPress, onPress, isVisible }) => {
  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={isBackdropPress ? onPress : undefined}
      windowBackgroundColor={colors.overlayRgba}
      overlayStyle={styles.overlay}
      width="80%"
      height="auto"
      borderRadius={8}
      supportedOrientations={['portrait', 'landscape']}
    >
      {children}

      <Touchable style={styles.touchableStyle} onPress={onPress}>
        <BoldText underline primary>
          {texts.settingsTitles.arListLayouts.cancel}
        </BoldText>
      </Touchable>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    padding: normalize(30),
    alignItems: 'center'
  },
  touchableStyle: {
    marginTop: 10
  }
});

Modal.propTypes = {
  children: PropTypes.object.isRequired,
  isBackdropPress: PropTypes.bool.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired
};
