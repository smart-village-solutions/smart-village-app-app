import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { colors, normalize } from '../../config';

export const IndexFilterElement = styled.View`
  padding-top: ${normalize(22)}px;
  padding-bottom: ${normalize(12)}px;
`;

export const IndexFilterElementBorder = styled.View`
  border-bottom-width: ${normalize(2)};
  border-bottom-color: ${colors.primary};
  margin-top: ${normalize(4)}px;
`;

export const IndexFilterWrapper = styled.View`
  border-bottom-width: ${StyleSheet.hairlineWidth};
  border-bottom-color: ${colors.shadow};
`;
