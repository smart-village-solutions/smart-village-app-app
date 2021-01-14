import PropTypes from 'prop-types';
import React from 'react';
import { Text as RNText } from 'react-native';
import styled, { css } from 'styled-components/native';

import { colors, normalize } from '../config';

// example: S&#322;ubice -> Słubice
function parseNumericCharacterReferences(text) {
  if (!text) return;

  const pattern = /&#\d+;/gm;

  return text.replace(pattern, (match) =>
    String.fromCharCode(parseInt(match.substr(2, match.length - 3)))
  );
}

export const Text = ({ children, ...props }) => {
  return (
    <RNText {...props}>
      {typeof children === 'string' ? parseNumericCharacterReferences(children) : children}
    </RNText>
  );
};

export const RegularText = styled(Text)`
  color: ${colors.darkText};
  font-family: titillium-web-regular;
  font-size: ${normalize(16)};
  line-height: ${normalize(22)};

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
    `};

  ${(props) =>
    props.big &&
    css`
      font-size: ${normalize(20)};
      line-height: ${normalize(26)};
    `};

  ${(props) =>
    props.primary &&
    css`
      color: ${colors.primary};
    `};

  ${(props) =>
    props.lighter &&
    css`
      color: ${colors.lighterText};
    `};

  ${(props) =>
    props.lightest &&
    css`
      color: ${colors.lightestText};
    `};

  ${(props) =>
    props.placeholder &&
    css`
      color: ${colors.placeholder};
    `};

  ${(props) =>
    props.darker &&
    css`
      color: ${colors.darkerPrimary};
    `};

  ${(props) =>
    props.center &&
    css`
      text-align: center;
    `};

  ${(props) =>
    props.lineThrough &&
    css`
      text-decoration: line-through;
    `};
`;

export const BoldText = styled(RegularText)`
  font-family: titillium-web-bold;
`;

Text.propTypes = {
  children: PropTypes.node
};
