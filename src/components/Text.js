import styled, { css } from 'styled-components/native';

import { colors, normalize } from '../config';

export const RegularText = styled.Text`
  color: ${colors.darkText};
  font-family: titillium-web-regular;
  font-size: ${normalize(16)};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(14)};
    `};
`;

export const BoldText = styled(RegularText)`
  font-family: titillium-web-bold;
`;

export const LightestText = styled(RegularText)`
  color: ${colors.lightestText};

  ${(props) =>
    props.bold &&
    css`
      font-family: titillium-web-bold;
    `};
`;

export const PriceText = styled(LightestText)`
  font-size: ${normalize(14)};

  ${(props) =>
    props.bold &&
    css`
      font-family: titillium-web-bold;
    `};
`;
