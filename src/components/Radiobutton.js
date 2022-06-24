import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox as RNECheckbox, normalize } from 'react-native-elements';

import { colors, Icon } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';

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
    checkedIcon={<Icon.RadioButtonFilled size={22} style={styles.rightContentContainer} />}
    uncheckedIcon={
      <Icon.RadioButtonEmpty
        size={22}
        color={colors.darkText}
        style={styles.rightContentContainer}
      />
    }
  />
);

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: colors.surface,
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
