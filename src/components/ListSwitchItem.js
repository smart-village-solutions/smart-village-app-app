import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { normalize } from '../config';
import { lightColors } from '../config/colors';

import { WrapperRow } from './Wrapper';

export const ListSwitchItem = styled.View`
  padding-top: ${normalize(22)}px;
  padding-bottom: ${normalize(12)}px;
`;

export const ListSwitchItemBorder = styled.View`
  border-bottom-width: ${normalize(2)};
  border-bottom-color: ${(props) => props.theme?.primary || lightColors.primary};
  margin-top: ${normalize(4)}px;
`;

export const ListSwitchWrapper = styled(WrapperRow)`
  border-bottom-width: ${StyleSheet.hairlineWidth};
  border-bottom-color: ${(props) => props.theme?.shadow || lightColors.shadow};
`;
