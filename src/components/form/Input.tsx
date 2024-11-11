import React, { forwardRef, useContext, useEffect, useRef } from 'react';
import { useController, UseControllerOptions } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { InputProps, Input as RNEInput } from 'react-native-elements';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { colors, consts, device, Icon, normalize } from '../../config';
import { Label } from '../Label';

const { a11yLabel } = consts;

type Props = InputProps &
  UseControllerOptions & {
    validate?: boolean;
    hidden?: boolean;
    row?: boolean;
    chat?: boolean;
    boldLabel?: boolean;
  };

/* eslint-disable complexity */
export const Input = forwardRef(
  (
    {
      control,
      name,
      rules,
      label,
      boldLabel = true,
      validate = false,
      disabled = false,
      hidden = false,
      errorMessage,
      row = false,
      multiline = false,
      rightIcon,
      chat = false,
      inputContainerStyle,
      inputStyle,
      containerStyle,
      accessibilityLabel,
      ...furtherProps
    }: Props,
    ref
  ) => {
    const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);

    const { field } = useController({
      control,
      name,
      rules
    });
    const inputRef = ref || useRef(null);
    const [isActive, setIsActive] = React.useState(false);

    useEffect(() => {
      // NOTE: need to set the font family for android explicitly on android, because password
      // placeholder font family appears wrong otherwise
      // => https://github.com/facebook/react-native/issues/30123
      if (device.platform === 'android') {
        inputRef?.current?.setNativeProps({
          style: {
            fontFamily: 'regular',
            fontSize: normalize(14),
            lineHeight: normalize(20)
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
          inputContainerStyle={[styles.inputContainer, multiline && styles.inputContainerMultiline]}
          inputStyle={[
            styles.input,
            styles.chatInput,
            multiline && device.platform === 'ios' && styles.chatMultiline
          ]}
          accessibilityLabel={
            accessibilityLabel ||
            `${a11yLabel[name] ? a11yLabel[name] : ''} ${a11yLabel.textInput}: ${field.value}`
          }
        />
      );
    }

    const isValid = !disabled && validate && !!field.value && !errorMessage;

    return (
      <RNEInput
        ref={inputRef}
        label={label && <Label bold={boldLabel}>{label}</Label>}
        value={field.value}
        onChangeText={field.onChange}
        onBlur={() => {
          field.onBlur();
          setIsActive(false);
        }}
        onFocus={() => {
          setIsActive(true);
        }}
        disabled={disabled}
        disableFullscreenUI
        multiline={multiline}
        {...furtherProps}
        errorMessage={!isValid ? errorMessage : ''}
        scrollEnabled={multiline}
        rightIcon={
          rightIcon ||
          (isValid ? (
            <Icon.Ok color={colors.primary} />
          ) : !isValid && !!errorMessage ? (
            <Icon.AlertHexagonFilled color={colors.error} size={normalize(16)} />
          ) : undefined)
        }
        containerStyle={[
          styles.container,
          row && styles.row,
          hidden && !errorMessage && styles.containerHidden,
          containerStyle
        ]}
        inputContainerStyle={[
          styles.inputContainer,
          disabled && styles.inputContainerDisabled,
          hidden && styles.inputContainerHidden,
          multiline && styles.inputContainerMultiline,
          isActive && styles.inputContainerSuccess,
          isValid && styles.inputContainerSuccess,
          !isValid && !!errorMessage && styles.inputContainerError,
          isReduceTransparencyEnabled && styles.inputAccessibilityBorderContrast,
          inputContainerStyle
        ]}
        rightIconContainerStyle={styles.rightIconContainer}
        inputStyle={[
          styles.input,
          multiline && device.platform === 'ios' && styles.multiline,
          !isValid && !!errorMessage && styles.inputError,
          inputStyle
        ]}
        errorStyle={[styles.inputError, !errorMessage && styles.inputErrorHeight]}
        placeholderTextColor={colors.placeholder}
        disabledInputStyle={styles.inputDisabled}
        accessibilityLabel={
          accessibilityLabel ||
          `${a11yLabel[name] ? a11yLabel[name] : ''} ${a11yLabel.textInput}: ${field.value}`
        }
      />
    );
  }
);
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
  inputAccessibilityBorderContrast: {
    borderColor: colors.darkText
  },
  inputContainer: {
    borderBottomWidth: normalize(1),
    borderColor: colors.gray40,
    borderLeftWidth: normalize(1),
    borderRadius: normalize(8),
    borderRightWidth: normalize(1),
    borderTopWidth: normalize(1),
    height: normalize(42)
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
  inputContainerMultiline: {
    height: 'auto'
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
    fontFamily: 'regular',
    fontSize: normalize(14),
    lineHeight: normalize(20)
  },
  multiline: {
    paddingTop: normalize(12)
  },
  inputError: {
    color: colors.error,
    fontSize: normalize(12),
    lineHeight: normalize(16)
  },
  inputErrorHeight: {
    height: 0
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
