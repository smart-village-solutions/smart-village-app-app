import styled, { css } from 'styled-components/native';

import { colors, normalize } from '../config';

export const RegularText = styled.Text`
  color: ${colors.darkText};
  flex: 1;
  font-family: titillium-web-regular;
  font-size: ${normalize(16)};
`;

export const BoldText = styled(RegularText)`
  font-family: titillium-web-bold;
`;

export const PriceText = styled(RegularText)`
  color: ${colors.lightestText};
  font-size: ${normalize(14)};

  ${(props) =>
    props.bold &&
    css`
      font-family: titillium-web-bold;
    `};
`;
