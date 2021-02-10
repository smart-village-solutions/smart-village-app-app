import styled from 'styled-components/native';

import { colors, normalize } from '../../config';
import { Text } from '../Text';

export const Label = styled(Text)`
  color: ${colors.darkText};
  font-family: titillium-web-regular;
  font-size: ${normalize(14)};
  line-height: ${normalize(28)};
`;
