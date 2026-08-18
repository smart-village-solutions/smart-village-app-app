import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import styled, { css } from 'styled-components/native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { normalize } from '../config';
import { lightColors } from '../config/colors';
import { useTheme } from '../hooks/useTheme';

// example: S&#322;ubice -> Słubice
function parseNumericCharacterReferences(text) {
  if (!text) return;

  const pattern = /&#\d+;/gm;

  return text.replace(pattern, (match) =>
    String.fromCharCode(parseInt(match.substr(2, match.length - 3)))
  );
}

function insertWhiteSpaceAfterDashes(text) {
  if (!text) return;

  return text.replace('-', '-' + String.fromCharCode(8203));
}

function parseText(text) {
  if (!text) return;

  let result = parseNumericCharacterReferences(text);

  result = insertWhiteSpaceAfterDashes(result);

  return result;
}

const scaleTypography = (style, scale = 1) => {
  if (!style || scale === 1) return style;

  const scaledStyle = { ...style };
  if (typeof style.fontSize === 'number') {
    scaledStyle.fontSize = style.fontSize * scale;
  }
  if (typeof style.lineHeight === 'number') {
    scaledStyle.lineHeight = style.lineHeight * scale;
  }

  return scaledStyle;
};

const updateColorForHighContrast = (style, isHighContrastEnabled, colors) => {
  if (!style || !isHighContrastEnabled) return style;
  if (!style.color) return style;

  if (
    style.color === colors.placeholder ||
    style.color === colors.gray60 ||
    style.color === colors.gray40
  ) {
    return {
      ...style,
      color: colors.darkText,
      textDecorationColor: colors.darkText
    };
  }

  return style;
};

export const Text = ({ children, style, italic, ignoreTextScale = false, ...props }) => {
  const {
    isBoldTextEnabled,
    isHighContrastEnabled,
    textScaleMultiplier = 1
  } = useContext(AccessibilityContext);
  const { colors } = useTheme();
  const flattenedStyle = StyleSheet.flatten(style || {});
  const baseStyle = scaleTypography(flattenedStyle, ignoreTextScale ? 1 : textScaleMultiplier);
  const adjustedStyle = updateColorForHighContrast(baseStyle, isHighContrastEnabled, colors);

  /* eslint-disable react-native/no-inline-styles */
  return (
    <RNText
      {...props}
      style={[
        adjustedStyle,
        isBoldTextEnabled && { fontFamily: 'bold' },
        italic && { fontFamily: 'bold-italic' }
      ]}
    >
      {typeof children === 'string' ? parseText(children) : children}
    </RNText>
  );
  /* eslint-enable react-native/no-inline-styles */
};

const themeColor = (props, token) => props.theme?.[token] || lightColors[token];

Text.propTypes = {
  children: PropTypes.node,
  ignoreTextScale: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.object]),
  italic: PropTypes.bool
};

export const RegularText = styled(Text)`
  color: ${(props) => themeColor(props, 'text')};
  font-family: regular;
  font-size: ${normalize(16)};
  line-height: ${normalize(22)};

  ${(props) =>
    props.italic &&
    css`
      font-family: italic;
    `};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(14)};
      line-height: ${normalize(18)};
    `};

  ${(props) =>
    props.smallest &&
    css`
      font-size: ${normalize(12)};
      line-height: ${normalize(14)};
    `};

  ${(props) =>
    props.big &&
    css`
      font-size: ${normalize(18)};
      line-height: ${normalize(24)};
    `};

  ${(props) =>
    props.lineThrough &&
    css`
      text-decoration: line-through;
    `};

  ${(props) =>
    props.underline &&
    css`
      text-decoration: underline;
    `};

  ${(props) =>
    props.primary &&
    css`
      color: ${themeColor(props, 'primary')};
      text-decoration-color: ${themeColor(props, 'primary')};
    `};

  ${(props) =>
    props.secondary &&
    css`
      color: ${themeColor(props, 'secondary')};
      text-decoration-color: ${themeColor(props, 'secondary')};
    `};

  ${(props) =>
    props.lighter &&
    css`
      color: ${themeColor(props, 'textMuted')};
      text-decoration-color: ${themeColor(props, 'textMuted')};
    `};

  ${(props) =>
    props.lightest &&
    css`
      color: ${themeColor(props, 'onPrimary')};
      text-decoration-color: ${themeColor(props, 'onPrimary')};
    `};

  ${(props) =>
    props.placeholder &&
    css`
      color: ${themeColor(props, 'placeholder')};
      text-decoration-color: ${themeColor(props, 'placeholder')};
    `};

  ${(props) =>
    props.darker &&
    css`
      color: ${themeColor(props, 'darkerPrimary')};
      text-decoration-color: ${themeColor(props, 'darkerPrimary')};
    `};

  ${(props) =>
    props.error &&
    css`
      color: ${themeColor(props, 'error')};
      text-decoration-color: ${themeColor(props, 'error')};
    `};

  ${(props) =>
    props.blue &&
    css`
      color: ${themeColor(props, 'blue')};
      text-decoration-color: ${themeColor(props, 'blue')};
    `};

  ${(props) =>
    props.center &&
    css`
      text-align: center;
    `};

  ${(props) =>
    props.right &&
    css`
      text-align: right;
    `};

  ${(props) =>
    props.uppercase &&
    css`
      text-transform: uppercase;
    `};
`;

export const BoldText = styled(RegularText)`
  font-family: bold;

  ${(props) =>
    props.italic &&
    css`
      font-family: bold-italic;
    `};
`;

export const HeadlineText = styled(RegularText)`
  font-family: condbold;
  font-size: ${normalize(19)};
  line-height: ${normalize(25)};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(17)};
      line-height: ${normalize(23)};
    `};

  ${(props) =>
    props.smaller &&
    css`
      font-size: ${normalize(15)};
      line-height: ${normalize(19)};
    `};

  ${(props) =>
    props.smallest &&
    css`
      font-size: ${normalize(13)};
      line-height: ${normalize(15)};
    `};

  ${(props) =>
    props.big &&
    css`
      font-size: ${normalize(21)};
      line-height: ${normalize(27)};
    `};

  ${(props) =>
    props.biggest &&
    css`
      font-size: ${normalize(24)};
      line-height: ${normalize(30)};
    `};

  ${(props) =>
    props.italic &&
    css`
      font-family: condbold-italic;
    `};
`;
