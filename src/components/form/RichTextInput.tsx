import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { AccessibilityState, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type {
  EnrichedTextInputInstance,
  EnrichedTextInputProps,
  OnChangeStateEvent
} from 'react-native-enriched';
import { EnrichedTextInput } from 'react-native-enriched';

import { consts, Icon, normalize } from '../../config';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { Label } from '../Label';

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const normalizeInitialHtml = (value: string) =>
  value
    .replace(/<\s*strong(\s|>)/gi, '<b$1')
    .replace(/<\s*\/\s*strong\s*>/gi, '</b>')
    .replace(/<\s*em(\s|>)/gi, '<i$1')
    .replace(/<\s*\/\s*em\s*>/gi, '</i>')
    .replace(/<\s*\/\s*p\s*>\s*<\s*p(\s|>)/gi, '</p><p><br></p><p$1');

const denormalizeSubmittedHtml = (value: string) =>
  value.replace(
    /<\s*\/\s*p\s*>\s*<\s*p\s*>\s*<\s*br\s*\/?\s*>\s*<\s*\/\s*p\s*>\s*<\s*p(\s|>)/gi,
    '</p><p$1'
  );

const getInitialRichTextValue = (value: string) => {
  if (!value) {
    return value;
  }

  const trimmedValue = value.trim();
  const normalizedValue = normalizeInitialHtml(value);

  if (trimmedValue.startsWith('<html>') && trimmedValue.endsWith('</html>')) {
    return normalizeInitialHtml(value);
  }

  return looksLikeHtml(trimmedValue) ? `<html>${normalizedValue}</html>` : value;
};

type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'list'
  | 'list-numbers'
  | 'blockquote';

const TOOLBAR_ACTION_LABELS: Record<ToolbarAction, string> = {
  blockquote: consts.a11yLabel?.formatting?.blockquote ?? 'Block quote',
  bold: consts.a11yLabel?.formatting?.bold ?? 'Bold',
  italic: consts.a11yLabel?.formatting?.italic ?? 'Italic',
  list: consts.a11yLabel?.formatting?.unorderedList ?? 'Unordered list',
  'list-numbers': consts.a11yLabel?.formatting?.orderedList ?? 'Ordered list',
  strikethrough: consts.a11yLabel?.formatting?.lineThrough ?? 'Strikethrough',
  underline: consts.a11yLabel?.formatting?.underline ?? 'Underline'
};

export const RichTextInput = forwardRef(
  (
    {
      boldLabel = true,
      containerStyle,
      disabled = false,
      errorMessage,
      field,
      inputContainerStyle,
      isReduceTransparencyEnabled,
      label,
      onChangeSelection,
      placeholder,
      ...furtherProps
    }: {
      boldLabel?: boolean;
      containerStyle?: StyleProp<ViewStyle>;
      disabled?: boolean;
      errorMessage?: string;
      field: {
        onChange: (value: string) => void;
        onBlur: () => void;
        value: string;
      };
      inputContainerStyle?: StyleProp<ViewStyle>;
      isReduceTransparencyEnabled?: boolean;
      label?: string;
      accessibilityLabel?: string;
      accessibilityState?: AccessibilityState;
    } & Pick<EnrichedTextInputProps, 'onChangeSelection' | 'placeholder'>,
    ref: React.Ref<EnrichedTextInputInstance>
  ) => {
    const { colors } = useTheme();
    const styles = useThemeStyles(createStyles);
    // Separate ref for EnrichedTextInput (used when richText={true})
    const richTextRef = useRef<EnrichedTextInputInstance>(null);
    const [isActive, setIsActive] = useState(false);
    const [richTextState, setRichTextState] = useState<OnChangeStateEvent | null>(null);
    const [initialValue, setInitialValue] = useState(() => getInitialRichTextValue(field.value));
    const lastEditorValueRef = useRef(field.value);

    useImperativeHandle(ref, () => richTextRef.current as EnrichedTextInputInstance, []);

    useEffect(() => {
      if (field.value === lastEditorValueRef.current) {
        return;
      }

      const nextInitialValue = getInitialRichTextValue(field.value);
      lastEditorValueRef.current = field.value;

      if (isActive) {
        return;
      }

      setInitialValue(nextInitialValue);
      richTextRef.current?.setValue(nextInitialValue);
    }, [field.value, isActive]);

    const handleToolbarAction = (action: ToolbarAction) => {
      const editor = richTextRef.current;
      if (!editor) return;

      switch (action) {
        case 'bold':
          editor.toggleBold();
          return;
        case 'italic':
          editor.toggleItalic();
          return;
        case 'underline':
          editor.toggleUnderline();
          return;
        case 'strikethrough':
          editor.toggleStrikeThrough();
          return;
        case 'list':
          editor.toggleUnorderedList();
          return;
        case 'list-numbers':
          editor.toggleOrderedList();
          return;
        case 'blockquote':
          editor.toggleBlockQuote();
          return;
      }
    };

    // Toolbar button config grouped by function:
    // Group 1 – inline styles | Group 2 – lists | Group 3 – block styles
    type ToolbarBtn = {
      iconName: string;
      action: ToolbarAction;
      isActive: boolean | undefined;
    };
    const toolbarGroups: ToolbarBtn[][] = [
      [
        {
          iconName: 'bold',
          action: 'bold',
          isActive: richTextState?.bold.isActive
        },
        {
          iconName: 'italic',
          action: 'italic',
          isActive: richTextState?.italic.isActive
        },
        {
          iconName: 'underline',
          action: 'underline',
          isActive: richTextState?.underline.isActive
        },
        {
          iconName: 'strikethrough',
          action: 'strikethrough',
          isActive: richTextState?.strikeThrough.isActive
        }
      ],
      [
        {
          iconName: 'list',
          action: 'list',
          isActive: richTextState?.unorderedList.isActive
        },
        {
          iconName: 'list-numbers',
          action: 'list-numbers',
          isActive: richTextState?.orderedList.isActive
        },
        {
          iconName: 'blockquote',
          action: 'blockquote',
          isActive: richTextState?.blockQuote.isActive
        }
      ]
    ];

    // Toolbar is only visible while the input is focused
    const toolbar = isActive ? (
      <View style={styles.richTextToolbar}>
        {toolbarGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {/* Separator between groups */}
            {groupIndex > 0 && <View style={styles.toolbarSeparator} />}
            {group.map((btn, btnIndex) => (
              <TouchableOpacity
                accessibilityLabel={`${TOOLBAR_ACTION_LABELS[btn.action]} ${
                  consts.a11yLabel.button
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: !!btn.isActive }}
                key={btnIndex}
                onPress={() => handleToolbarAction(btn.action)}
                style={[styles.toolbarButton, btn.isActive && styles.toolbarButtonActive]}
              >
                <Icon.NamedIcon
                  color={btn.isActive ? colors.surface : colors.darkText}
                  name={btn.iconName}
                  size={normalize(18)}
                />
              </TouchableOpacity>
            ))}
          </React.Fragment>
        ))}
      </View>
    ) : null;

    return (
      <View style={containerStyle}>
        {label && <Label bold={boldLabel}>{label}</Label>}
        <View
          style={[
            styles.inputContainer,
            styles.inputContainerMultiline,
            isActive && styles.inputContainerSuccess,
            !!errorMessage && styles.inputContainerError,
            isReduceTransparencyEnabled && styles.inputAccessibilityBorderContrast,
            inputContainerStyle
          ]}
        >
          {/* Toolbar sits inside the input border, above the keyboard when focused */}
          {toolbar}
          <EnrichedTextInput
            ref={richTextRef}
            defaultValue={initialValue}
            // HTML value is pushed to the form field on every change
            onChangeHtml={(e) => {
              const nextValue = denormalizeSubmittedHtml(e.nativeEvent.value);

              lastEditorValueRef.current = nextValue;
              (field.onChange as ((value: string) => void) | undefined)?.(nextValue);
            }}
            onChangeSelection={(e) => {
              onChangeSelection?.(e);
            }}
            onChangeState={(e) => setRichTextState(e.nativeEvent)}
            onFocus={() => setIsActive(true)}
            onBlur={() => {
              // field.onBlur may require an arg depending on control mode; cast to accept none
              (field.onBlur as (() => void) | undefined)?.();
              setIsActive(false);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            editable={!disabled}
            style={styles.richTextInput}
            {...furtherProps}
          />
        </View>
        {!!errorMessage && (
          <Text
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={styles.inputError}
          >
            {errorMessage}
          </Text>
        )}
      </View>
    );
  }
);

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => ({
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
  inputContainerMultiline: {
    height: 'auto'
  },
  inputContainerSuccess: {
    borderColor: colors.primary
  },
  inputContainerError: {
    borderColor: colors.error
  },
  inputError: {
    color: colors.error,
    fontSize: normalize(14),
    lineHeight: normalize(20)
  },
  richTextInput: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(14),
    minHeight: normalize(120),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10)
  },
  richTextToolbar: {
    backgroundColor: colors.gray20,
    borderTopColor: colors.gray40,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: normalize(4),
    paddingVertical: normalize(4)
  },
  toolbarSeparator: {
    backgroundColor: colors.gray40,
    marginHorizontal: normalize(4),
    marginVertical: normalize(4),
    width: StyleSheet.hairlineWidth
  },
  toolbarButton: {
    alignItems: 'center',
    borderRadius: normalize(4),
    justifyContent: 'center',
    marginHorizontal: normalize(2),
    minHeight: normalize(44),
    minWidth: normalize(44)
  },
  toolbarButtonActive: {
    backgroundColor: colors.primary
  }
});
