import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox as RNECheckbox } from 'react-native-elements';

import { colors, Icon, normalize, texts } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';

export const Radiobutton = ({
  containerStyle,
  disabled = false,
  onPress,
  selected = false,
  title
}) => (
  <RNECheckbox
    accessibilityLabel={`${
      selected
        ? texts.accessibilityLabels.checkbox.active
        : texts.accessibilityLabels.checkbox.inactive
    } (${title})`}
    checked={selected}
    checkedIcon={<Icon.RadioButtonFilled size={22} style={styles.rightContentContainer} />}
    containerStyle={[styles.containerStyle, containerStyle]}
    disabled={disabled}
    onPress={onPress}
    size={normalize(24)}
    textStyle={[
      styles.textStyle,
      selected && styles.textStyleSelected,
      disabled && styles.textStyleDisabled
    ]}
    title={title}
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
  containerStyle: PropTypes.object,
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  selected: PropTypes.bool,
  title: PropTypes.string
};
