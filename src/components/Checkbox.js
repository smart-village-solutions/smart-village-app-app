import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox as RNECheckbox, normalize } from 'react-native-elements';

import { colors, device } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';
import { Icon } from './Icon';

export const Checkbox = ({ title, disabled, checked, onPress }) => (
  <RNECheckbox
    title={title}
    checked={checked}
    onPress={onPress}
    size={normalize(24)}
    containerStyle={styles.containerStyle}
    textStyle={[
      styles.textStyle,
      checked && styles.textStyleChecked,
      disabled && styles.textStyleDisabled
    ]}
    checkedIcon={
      <Icon
        name={
          device.platform === 'ios' ? 'ios-checkmark-circle-sharp' : 'md-checkmark-circle-sharp'
        }
        size={22}
        iconColor={colors.primary}
        style={styles.rightContentContainer}
      />
    }
    uncheckedIcon={
      <Icon
        name={device.platform === 'ios' ? 'ios-remove-circle-outline' : 'md-remove-circle-outline'}
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
  textStyleChecked: {
    color: colors.primary
  },
  textStyleDisabled: {
    color: colors.shadow
  }
});

Checkbox.propTypes = {
  title: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onPress: PropTypes.func
};

Checkbox.defaultProps = {
  disabled: false,
  checked: false
};
