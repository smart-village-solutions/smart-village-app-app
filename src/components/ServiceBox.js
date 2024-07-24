import styled, { css } from 'styled-components/native';

import { normalize } from '../config';

const flexBasis = (props) => {
  const { orientation, bigTile, numberOfTiles: tilesConfig = {} } = props;
  const { landscape = 5, portrait = 3 } = tilesConfig;
  const numberOfTiles = orientation === 'landscape' ? landscape : portrait;
  const tileFactor = bigTile ? (orientation === 'landscape' ? 1.2 : 0.7) : 1;

  return 100 / (numberOfTiles + 0.3 * tileFactor);
};

export const ServiceBox = styled.View`
  margin: ${normalize(16)}px 0;

  ${(props) =>
    css`
      flex-basis: ${flexBasis(props)}%;
    `};

  ${(props) =>
    props.bigTile &&
    css`
      margin: 0 0 ${normalize(8)}px 0;
    `};
`;
