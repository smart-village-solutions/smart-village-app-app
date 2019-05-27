import styled from 'styled-components';

import { colors, normalize } from '../config';

export const Wrapper = styled.View`
  background-color: ${colors.lightestText};
  flex: 1;
  padding: ${normalize(14)}px;
`;

export const WrapperRow = styled.View`
  flex: 1;
  flex-direction: row;
`;
