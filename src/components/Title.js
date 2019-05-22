import styled, { css } from 'styled-components/native';
import { colors } from '../config';

export const Title = styled.Text`
  color: ${colors.primary};
  font-weight: bold;
  font-size: 20;
  padding: 10px;
  text-transform: uppercase;
`;

//experimentig with the shadow ,
//it seams that titles on homepage are inside of a box witch has a shadow
// I need to recrate the effect of having a shadow from the line
export const TitleContainer = styled.View``;

// fake shadow for now as workaround with border bottom
export const TitleShadow = styled.View`
  border-bottom-width: 2px;
  border-bottom-color: gray;
  border-style: solid;
  opacity: 0.2;
`;
