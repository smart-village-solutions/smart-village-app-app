import styled, { css } from 'styled-components/native';

import { normalize } from '../config';
import { lightColors } from '../config/colors';

import { Text } from './Text';

export const Label = styled(Text)`
  color: ${(props) => props.theme?.text || lightColors.text};
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
