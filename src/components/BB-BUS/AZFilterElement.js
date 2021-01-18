import styled, { css } from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { colors, normalize } from '../../config';

export const AZFilterElement = styled.View`
  align-items: center;
  border-color: ${colors.shadowRgba};
  border-radius: ${normalize(20)}px;
  border-width: ${StyleSheet.hairlineWidth};
  height: ${normalize(40)}px;
  justify-content: center;
  margin-bottom: ${normalize(8)}px;
  margin-left: ${normalize(8)}px;
  margin-right: ${normalize(8)}px;
  width: ${normalize(40)}px;

  ${(props) =>
    props.selected &&
    css`
      background-color: ${colors.shadowRgba};
    `};

  ${(props) =>
    props.first &&
    css`
      margin-left: ${normalize(14)}px;
    `};

  ${(props) =>
    props.last &&
    css`
      margin-right: ${normalize(14)}px;
    `};
`;
