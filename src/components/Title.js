import styled, { css } from 'styled-components/native';
import { colors } from '../config';

export const Title = styled.Text`
  color: ${colors.primary};
  font-weight: bold;
  font-size: 20;
  padding: 10px;
  text-transform: uppercase;
`;
export const TitleContainer = styled.View`
  box-shadow: 0 6px 6px black;
`;

//experimentig with the shadow ,
//it seams that titles on homepage are inside of a box witch has a shadow
// I need to recrate the effect of having a shadow from the line
