import styled, { css } from 'styled-components/native';

import { colors, device, normalize } from '../config';

import { Text } from './Text';

export const Title = styled(Text)`
  color: ${colors.primary};
  font-family: condbold;
  font-size: ${normalize(20)};
  line-height: ${normalize(26)};

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
  background-color: ${colors.surface};
  padding: ${normalize(8)}px ${normalize(16)}px;

  ${(props) =>
    !props.flat &&
    device.platform === 'ios' &&
    css`
      shadow-color: ${colors.shadow};
      shadow-offset: 0px 0px;
      shadow-opacity: 0.7;
      shadow-radius: 3px;
    `};

  ${(props) =>
    !props.flat &&
    device.platform === 'android' &&
    css`
      border-top-width: 2px;
      border-top-color: ${colors.shadowRgba};
      border-style: solid;
      elevation: 2;
    `};
`;

// dummy bottom shadow container for iOS
export const TitleShadow = styled.View`
  background-color: ${colors.surface};
  shadow-color: ${colors.shadow};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.7;
  shadow-radius: 3px;
`;
