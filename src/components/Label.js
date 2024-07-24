import styled, { css } from 'styled-components/native';

import { colors, normalize } from '../config';

import { Text } from './Text';

export const Label = styled(Text)`
  color: ${colors.darkText};
  font-family: regular;
  font-size: ${normalize(12)};
  line-height: ${normalize(16)};
  margin-bottom: ${normalize(8)};

  ${(props) =>
    props.bold &&
    css`
      font-family: bold;
    `};
`;
