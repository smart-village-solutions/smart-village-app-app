import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';

import { colors, normalize } from '../config';

import { WrapperRow } from './Wrapper';

export const ListSwitchItem = styled.View`
  padding-top: ${normalize(22)}px;
  padding-bottom: ${normalize(12)}px;
`;

export const ListSwitchItemBorder = styled.View`
  border-bottom-width: ${normalize(2)};
  border-bottom-color: ${colors.primary};
  margin-top: ${normalize(4)}px;
`;

export const ListSwitchWrapper = styled(WrapperRow)`
  border-bottom-width: ${StyleSheet.hairlineWidth};
  border-bottom-color: ${colors.shadow};
`;
