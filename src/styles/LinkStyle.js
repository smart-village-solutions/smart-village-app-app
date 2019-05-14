import styled, { css } from 'styled-components/native';
import { colors } from '../config';

export const LinkStyle = styled.Text`
  color: ${colors.secondary};
  font-weight: bold;
`;

// LinkStyle = {{ flex: 1, flexDirection: 'row' }} must have positionig because of the icon

// TODO: add a Icon style maybe like ListItems you can use styled-components
