import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Text as RNText } from 'react-native';
import styled, { css } from 'styled-components/native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, normalize } from '../config';

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

export const Text = ({ children, style, italic, ...props }) => {
  const { isBoldTextEnabled } = useContext(AccessibilityContext);

  /* eslint-disable react-native/no-inline-styles */
  return (
    <RNText
      {...props}
      style={[
        ...style,
        isBoldTextEnabled && { fontFamily: 'bold' },
        italic && { fontFamily: 'bold-italic' }
      ]}
    >
      {typeof children === 'string' ? parseText(children) : children}
    </RNText>
  );
  /* eslint-enable react-native/no-inline-styles */
};

Text.propTypes = {
  children: PropTypes.node,
  style: PropTypes.array,
  italic: PropTypes.bool
};

export const RegularText = styled(Text)`
  color: ${colors.darkText};
  font-family: regular;
  font-size: ${normalize(14)};
  line-height: ${normalize(20)};

  ${(props) =>
    props.italic &&
    css`
      font-family: italic;
    `};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(12)};
      line-height: ${normalize(16)};
    `};

  ${(props) =>
    props.smallest &&
    css`
      font-size: ${normalize(11)};
      line-height: ${normalize(13)};
    `};

  ${(props) =>
    props.big &&
    css`
      font-size: ${normalize(16)};
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
      color: ${colors.primary};
      text-decoration-color: ${colors.primary};
    `};

  ${(props) =>
    props.secondary &&
    css`
      color: ${colors.secondary};
      text-decoration-color: ${colors.secondary};
    `};

  ${(props) =>
    props.lighter &&
    css`
      color: ${colors.gray60};
      text-decoration-color: ${colors.gray60};
    `};

  ${(props) =>
    props.lightest &&
    css`
      color: ${colors.lightestText};
      text-decoration-color: ${colors.lightestText};
    `};

  ${(props) =>
    props.placeholder &&
    css`
      color: ${colors.placeholder};
      text-decoration-color: ${colors.placeholder};
    `};

  ${(props) =>
    props.darker &&
    css`
      color: ${colors.darkerPrimary};
      text-decoration-color: ${colors.darkerPrimary};
    `};

  ${(props) =>
    props.error &&
    css`
      color: ${colors.error};
      text-decoration-color: ${colors.error};
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
  font-size: ${normalize(18)};
  line-height: ${normalize(23)};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(16)};
      line-height: ${normalize(21)};
    `};

  ${(props) =>
    props.smaller &&
    css`
      font-size: ${normalize(14)};
      line-height: ${normalize(16)};
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
      font-size: ${normalize(21)};
      line-height: ${normalize(27)};
    `};

  ${(props) =>
    props.italic &&
    css`
      font-family: condbold-italic;
    `};
`;
