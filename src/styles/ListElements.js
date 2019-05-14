import styled, { css } from 'styled-components/native';
import { colors, texts } from '../config';

export const ListTitle = styled.Text`
  color: ${colors.darkText};
  font-weight: bold;
`;

export const ListSubtitle = styled(ListTitle)`
  color: ${colors.lighterText};
  font-weight: 100;
`;
export const Divider = styled.View`
  border-bottom-color: ${colors.secondary};
  border-bottom-width: 3px;
`;

// TODO: add a Icon style
