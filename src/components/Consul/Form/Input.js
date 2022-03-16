import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Input as RNEInput, normalize } from 'react-native-elements';
import { useController } from 'react-hook-form';

import { colors, consts, device, Icon } from '../../../config';
import { Label } from '../../Label';

const { a11yLabel } = consts;

/* eslint-disable complexity */
export const Input = ({ control, name, label, rules, multiline, rightIcon, row, ...props }) => {
  const {
    field: { onBlur, onChange, value },
    fieldState: { error }
  } = useController({
    control,
    name,
    rules
  });
  const inputRef = useRef(null);

  useEffect(() => {
    if (device.platform === 'android') {
      inputRef?.current?.setNativeProps({
        style: {
          fontFamily: 'regular',
          fontSize: normalize(16)
        }
      });
    }
  }, []);

  return (
    <RNEInput
      ref={inputRef}
      label={<Label>{label}</Label>}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      errorMessage={error && error.message}
      scrollEnabled={multiline && false}
      rightIcon={
        rightIcon ||
        (!error && value ? (
          <Icon.Ok color={colors.primary} size={normalize(20)} />
        ) : (
          error && <Icon.Close color={colors.error} size={normalize(20)} />
        ))
      }
      onBlur={onBlur}
      containerStyle={[styles.container, row && styles.row]}
      inputContainerStyle={[
        styles.inputContainer,
        !error && value && styles.inputContainerSuccess,
        error && styles.inputContainerError
      ]}
      rightIconContainerStyle={styles.rightIconContainer}
      inputStyle={[styles.input, multiline && device.platform === 'ios' && styles.multiline]}
      disabledInputStyle={styles.inputDisabled}
      accessibilityLabel={`${a11yLabel[name]} ${a11yLabel.textInput}: ${value}`}
      {...props}
    />
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0
  },
  row: {
    width: '47%'
  },
  inputContainer: {
    borderBottomWidth: normalize(1),
    borderColor: colors.borderRgba,
    borderLeftWidth: normalize(1),
    borderRightWidth: normalize(1),
    borderTopWidth: normalize(1),
    borderRadius: 0
  },
  inputContainerSuccess: {
    borderColor: colors.primary
  },
  inputContainerError: {
    borderColor: colors.error
  },
  rightIconContainer: {
    marginRight: 0,
    marginVertical: 0,
    paddingRight: normalize(12)
  },
  input: {
    paddingLeft: normalize(12),
    paddingRight: normalize(6),
    paddingVertical: device.platform === 'ios' ? normalize(10) : normalize(8)
  },
  multiline: {
    paddingTop: normalize(12)
  },
  inputDisabled: {
    color: colors.placeholder
  }
});

Input.propTypes = {
  control: PropTypes.object.isRequired,
  rules: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  multiline: PropTypes.bool,
  rightIcon: PropTypes.object,
  label: PropTypes.string,
  row: PropTypes.bool
};

Input.defaultProps = {
  row: false,
  multiline: false
};
