import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox as RNECheckbox, normalize } from 'react-native-elements';

import { colors, device } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';
import { Icon } from './Icon';

export const Radiobutton = ({ title, disabled, selected, onPress, containerStyle }) => (
  <RNECheckbox
    title={title}
    checked={selected}
    onPress={onPress}
    size={normalize(24)}
    containerStyle={[styles.containerStyle, containerStyle]}
    textStyle={[
      styles.textStyle,
      selected && styles.textStyleSelected,
      disabled && styles.textStyleDisabled
    ]}
    checkedIcon={
      <Icon
        name={device.platform === 'ios' ? 'ios-radio-button-on' : 'md-radio-button-on'}
        size={22}
        iconColor={colors.primary}
        style={styles.rightContentContainer}
      />
    }
    uncheckedIcon={
      <Icon
        name={device.platform === 'ios' ? 'ios-radio-button-off' : 'md-radio-button-off'}
        size={22}
        iconColor={colors.darkText}
        style={styles.rightContentContainer}
      />
    }
  />
);

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: colors.lightestText,
    borderColor: colors.lightestText,
    borderRadius: 0,
    borderWidth: 0,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
    paddingVertical: normalize(7)
  },
  textStyle: {
    ...baseFontStyle,
    fontWeight: '400',
    marginLeft: normalize(7),
    marginRight: 'auto'
  },
  textStyleSelected: {
    color: colors.primary
  },
  textStyleDisabled: {
    color: colors.shadow
  }
});

Radiobutton.propTypes = {
  title: PropTypes.string,
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  onPress: PropTypes.func,
  containerStyle: PropTypes.object
};

Radiobutton.defaultProps = {
  disabled: false,
  selected: false
};
