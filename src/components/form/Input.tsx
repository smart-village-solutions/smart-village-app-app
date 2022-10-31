import React, { useEffect, useRef } from 'react';
import { useController, UseControllerOptions } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Input as RNEInput, InputProps } from 'react-native-elements';

import { colors, consts, device, Icon, normalize } from '../../config';
import { Label } from '../Label';

const { a11yLabel } = consts;

type Props = InputProps &
  UseControllerOptions & {
    validate?: boolean;
    hidden?: boolean;
    row?: boolean;
    chat?: boolean;
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
  chat = false,
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

  if (chat) {
    return (
      <RNEInput
        ref={inputRef}
        value={field.value}
        onChangeText={field.onChange}
        multiline={multiline}
        {...furtherProps}
        containerStyle={[styles.container, styles.chatContainer]}
        inputContainerStyle={[styles.inputContainer, styles.chatInputContainer]}
        inputStyle={[
          styles.input,
          styles.chatInput,
          multiline && device.platform === 'ios' && styles.chatMultiline
        ]}
        accessibilityLabel={`${a11yLabel[name]} ${a11yLabel.textInput}: ${field.value}`}
      />
    );
  }

  const isValid = !disabled && validate && !!field.value && !errorMessage;

  return (
    <RNEInput
      ref={inputRef}
      label={<Label>{label}</Label>}
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
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
      containerStyle={[
        styles.container,
        row && styles.row,
        hidden && isValid && styles.containerHidden
      ]}
      inputContainerStyle={[
        styles.inputContainer,
        disabled && styles.inputContainerDisabled,
        hidden && styles.inputContainerHidden,
        isValid && styles.inputContainerSuccess,
        !isValid && !!errorMessage && styles.inputContainerError
      ]}
      rightIconContainerStyle={styles.rightIconContainer}
      inputStyle={[
        styles.input,
        multiline && device.platform === 'ios' && styles.multiline,
        !isValid && !!errorMessage && styles.inputError
      ]}
      errorStyle={styles.inputError}
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
  containerHidden: {
    height: 0
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
    borderColor: colors.gray60
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
    color: colors.darkText,
    paddingLeft: normalize(12),
    paddingRight: normalize(6),
    paddingVertical: device.platform === 'ios' ? normalize(10) : normalize(8),
    fontFamily: 'regular'
  },
  multiline: {
    paddingTop: normalize(12)
  },
  inputError: {
    color: colors.error
  },
  inputDisabled: {
    color: colors.placeholder
  },
  chatContainer: {
    width: '90%'
  },
  chatMultiline: {
    paddingTop: normalize(8)
  },
  chatInput: {
    fontSize: normalize(12),
    paddingVertical: device.platform === 'ios' ? normalize(6) : normalize(4)
  }
});
