import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox as RNECheckbox } from 'react-native-elements';

import { Icon, normalize, texts } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';
import { useTheme } from '../hooks/useTheme';

export const Radiobutton = ({
  containerStyle,
  disabled = false,
  onPress,
  selected = false,
  title
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <RNECheckbox
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${
        selected
          ? texts.accessibilityLabels.checkbox.active
          : texts.accessibilityLabels.checkbox.inactive
      } (${title})`}
      checked={selected}
      checkedIcon={
        <Icon.RadioButtonFilled
          color={colors.primary}
          size={22}
          style={styles.rightContentContainer}
        />
      }
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
        <Icon.RadioButtonEmpty size={22} color={colors.text} style={styles.rightContentContainer} />
      }
    />
  );
};

/* Dynamic theme styles cannot be resolved by react-native/no-unused-styles. */
/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors) =>
  StyleSheet.create({
    containerStyle: {
      backgroundColor: colors.surface,
      borderColor: colors.onPrimary,
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
      color: colors.text,
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
/* eslint-enable react-native/no-unused-styles */

Radiobutton.propTypes = {
  containerStyle: PropTypes.object,
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  selected: PropTypes.bool,
  title: PropTypes.string
};
