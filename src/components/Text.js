import styled, { css } from 'styled-components/native';

import { colors, normalize } from '../config';

export const RegularText = styled.Text`
  color: ${colors.darkText};
  font-family: titillium-web-regular;
  font-size: ${normalize(16)};
  line-height: ${normalize(22)};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(14)};
    `};

  ${(props) =>
    props.link &&
    css`
      color: ${colors.primary};
    `};
`;

export const BoldText = styled(RegularText)`
  font-family: titillium-web-bold;

  ${(props) =>
    props.light &&
    css`
      color: ${colors.lightestText};
    `};
`;

export const LightestText = styled(RegularText)`
  color: ${colors.lightestText};

  ${(props) =>
    props.bold &&
    css`
      font-family: titillium-web-bold;
    `};
`;
