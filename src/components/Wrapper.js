import styled from 'styled-components';

import { normalize } from '../config';

export const Wrapper = styled.View`
  flex: 1;
  padding: ${normalize(14)}px;
`;

export const WrapperRow = styled.View`
  flex: 1;
  flex-direction: row;
`;

export const WrapperWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
`;
