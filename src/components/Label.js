import styled, { css } from 'styled-components/native';

import { colors, normalize } from '../config';

import { Text } from './Text';

export const Label = styled(Text)`
  color: ${colors.darkText};
  font-family: regular;
  font-size: ${normalize(14)};
  line-height: ${normalize(28)};

  ${(props) =>
    props.bold &&
    css`
      font-family: bold;
    `};
`;
