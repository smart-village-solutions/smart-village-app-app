import styled, { css } from 'styled-components/native';

import { normalize } from '../config';

const flexBasis = (props) => {
  const { orientation, bigTile, numberOfTiles: tilesConfig = {} } = props;
  const { landscape = 5, portrait = 3 } = tilesConfig;
  const numberOfTiles = orientation === 'landscape' ? landscape : portrait;

  // For bigTile, use exact pixel-based calculation to match DraggableGrid
  // For normal tiles, use percentage-based flex layout
  return bigTile ? null : 100 / numberOfTiles;
};

export const ServiceBox = styled.View`
  margin: ${normalize(16)}px 0;

  ${(props) =>
    !props.bigTile &&
    css`
      flex-basis: ${flexBasis(props)}%;
    `};

  ${(props) =>
    props.bigTile &&
    css`
      margin: 0 0 ${normalize(1)}px 0;
    `};
`;
