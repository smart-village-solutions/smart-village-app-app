import styled, { css } from 'styled-components/native';

import { device, normalize } from '../config';
import { lightColors } from '../config/colors';

import { Text } from './Text';

export const Title = styled(Text)`
  color: ${(props) => props.theme?.text || lightColors.text};
  font-family: condbold;
  font-size: ${normalize(20)};
  line-height: ${normalize(26)};

  ${(props) =>
    props.onPress &&
    css`
      color: ${(props) => props.theme?.text || lightColors.text};
    `};

  ${(props) =>
    props.uppercase &&
    css`
      text-transform: uppercase;
    `};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(18)};
      line-height: ${normalize(23)};
    `};

  ${(props) =>
    props.big &&
    css`
      font-size: ${normalize(24)};
      line-height: ${normalize(29)};
    `};

  ${(props) =>
    props.center &&
    css`
      text-align: center;
    `};
`;

// need to set a background color for shadow applying to the View instead of Text inside it
// thx to https://github.com/styled-components/styled-components/issues/709#issuecomment-377968412
export const TitleContainer = styled.View`
  background-color: ${(props) => props.theme?.background || lightColors.background};
  padding: ${normalize(8)}px ${normalize(16)}px;

  ${(props) =>
    !props.flat &&
    device.platform === 'ios' &&
    css`
      shadow-color: ${(props) => props.theme?.shadow || lightColors.shadow};
      shadow-offset: 0px 0px;
      shadow-opacity: 0.7;
      shadow-radius: 3px;
    `};

  ${(props) =>
    !props.flat &&
    device.platform === 'android' &&
    css`
      border-top-width: 2px;
      border-top-color: ${(props) => props.theme?.shadowRgba || lightColors.shadowRgba};
      border-style: solid;
      elevation: 2;
    `};
`;

// dummy bottom shadow container for iOS
export const TitleShadow = styled.View`
  background-color: ${(props) => props.theme?.background || lightColors.background};
  shadow-color: ${(props) => props.theme?.shadow || lightColors.shadow};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.7;
  shadow-radius: 3px;
`;
