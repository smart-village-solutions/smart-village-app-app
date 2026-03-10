import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type {
  EnrichedTextInputInstance,
  EnrichedTextInputProps,
  OnChangeSelectionEvent,
  OnChangeStateEvent
} from 'react-native-enriched';
import { EnrichedTextInput } from 'react-native-enriched';

import { colors, consts, Icon, normalize } from '../../config';
import { Label } from '../Label';

const { URL_REGEX } = consts;

type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'list'
  | 'list-numbers'
  | 'blockquote'
  | 'link';

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
    } & Pick<EnrichedTextInputProps, 'onChangeSelection' | 'placeholder'>,
    ref: React.Ref<EnrichedTextInputInstance>
  ) => {
    // Separate ref for EnrichedTextInput (used when richText={true})
    const richTextRef = useRef<EnrichedTextInputInstance>(null);
    const [isActive, setIsActive] = useState(false);
    const [richTextState, setRichTextState] = useState<OnChangeStateEvent | null>(null);
    const [selectionState, setSelectionState] = useState<OnChangeSelectionEvent | null>(null);

    useImperativeHandle(ref, () => richTextRef.current as EnrichedTextInputInstance, []);

    const handleSetLink = () => {
      // Selected text is used as both link label and URL input.
      if (!selectionState) return;

      const selectedText = selectionState.text.trim();
      if (!selectedText) return;

      const isAbsoluteUrl = URL_REGEX.test(selectedText);
      const url = isAbsoluteUrl ? selectedText : `https://${selectedText}`;

      richTextRef.current?.setLink(selectionState.start, selectionState.end, selectedText, url);
    };

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
        case 'link':
          handleSetLink();
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
        }
      ],
      [
        {
          iconName: 'blockquote',
          action: 'blockquote',
          isActive: richTextState?.blockQuote.isActive
        },
        {
          iconName: 'link',
          action: 'link',
          isActive: richTextState?.link.isActive
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
            // HTML value is pushed to the form field on every change
            onChangeHtml={(e) =>
              (field.onChange as ((value: string) => void) | undefined)?.(e.nativeEvent.value)
            }
            onChangeSelection={(e) => {
              setSelectionState(e.nativeEvent);
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
        {!!errorMessage && <Text style={styles.inputError}>{errorMessage}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
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
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(6)
  },
  toolbarButtonActive: {
    backgroundColor: colors.primary
  }
});
