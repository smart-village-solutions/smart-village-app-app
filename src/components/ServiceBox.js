import styled, { css } from 'styled-components/native';

import { normalize } from '../config';

const flexBasis = (props) => {
  const { orientation, numberOfTiles: { landscape = 5, portrait = 3 } = {}, hasTileStyle } = props;
  const numberOfTiles = orientation === 'landscape' ? landscape : portrait;
  const tileFactor = hasTileStyle ? (orientation === 'landscape' ? 1 : 0.09) : 1;

  // For normal tiles, use percentage-based flex layout
  return 100 / (numberOfTiles + tileFactor);
};

export const ServiceBox = styled.View`
  margin: ${normalize(16)}px 0;

  ${(props) =>
    !props.bigTile &&
    css`
      flex-basis: ${flexBasis(props)}%;
    `};

  ${(props) =>
    (props.bigTile || props.hasTileStyle) &&
    css`
      margin: 0 0 ${normalize(1)}px 0;
    `};
`;
