import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Input as RNEInput, normalize, InputProps } from 'react-native-elements';
import { useController, UseControllerProps } from 'react-hook-form';

import { colors, consts, device, Icon } from '../../config';
import { Label } from '../Label';

const { a11yLabel } = consts;

type Props = InputProps &
  UseControllerProps & {
    validate?: boolean;
    hidden?: boolean;
    row?: boolean;
  };

/* eslint-disable complexity */
/* there are a lot of conditions */
export const Input = ({
  control,
  name,
  rules,
  label,
  validate = false,
  disabled = false,
  hidden = false,
  errorMessage,
  row = false,
  multiline = false,
  rightIcon,
  ...furtherProps
}: Props) => {
  const { field } = useController({
    control,
    name,
    rules
  });
  const inputRef = useRef(null);

  useEffect(() => {
    // NOTE: need to set the font family for android explicitly on android, because password
    // placeholder font family appears wrong otherwise
    // => https://github.com/facebook/react-native/issues/30123
    if (device.platform === 'android') {
      inputRef?.current?.setNativeProps({
        style: {
          fontFamily: 'regular',
          fontSize: normalize(16)
        }
      });
    }
  }, []);

  const isValid = !disabled && validate && !!field.value && !errorMessage;

  return (
    <RNEInput
      ref={inputRef}
      label={<Label>{label}</Label>}
      value={field.value}
      onChangeText={field.onChange}
      disabled={disabled}
      multiline={multiline}
      {...furtherProps}
      errorMessage={!isValid ? errorMessage : ''}
      scrollEnabled={multiline && false}
      rightIcon={
        rightIcon ||
        (isValid ? (
          <Icon.Ok color={colors.primary} size={normalize(24)} />
        ) : (
          !isValid && !!errorMessage && <Icon.Close color={colors.error} size={normalize(24)} />
        ))
      }
      containerStyle={[styles.container, row && styles.row]}
      inputContainerStyle={[
        styles.inputContainer,
        disabled && styles.inputContainerDisabled,
        hidden && styles.inputContainerHidden,
        isValid && styles.inputContainerSuccess,
        !isValid && !!errorMessage && styles.inputContainerError
      ]}
      rightIconContainerStyle={styles.rightIconContainer}
      inputStyle={[styles.input, multiline && device.platform === 'ios' && styles.multiline]}
      placeholderTextColor={colors.placeholder}
      disabledInputStyle={styles.inputDisabled}
      accessibilityLabel={`${a11yLabel[name]} ${a11yLabel.textInput}: ${field.value}`}
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
    borderColor: colors.gray40,
    borderLeftWidth: normalize(1),
    borderRightWidth: normalize(1),
    borderTopWidth: normalize(1)
  },
  inputContainerDisabled: {
    backgroundColor: colors.gray20,
    borderColor: colors.lighterText
  },
  inputContainerHidden: {
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    display: 'none'
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
    paddingVertical: device.platform === 'ios' ? normalize(10) : normalize(8),
    fontFamily: 'regular'
  },
  multiline: {
    paddingTop: normalize(12)
  },
  inputDisabled: {
    color: colors.placeholder
  }
});
