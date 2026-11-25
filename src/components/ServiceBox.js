import styled, { css } from 'styled-components/native';

import { normalize } from '../config';

const flexBasis = (props) => {
  const { bigTile, columns = 3, gridWidth, gridGap = 0, hasTileStyle, orientation } = props;
  const safeColumns = Math.max(1, columns);

  if (gridWidth !== undefined && (bigTile || hasTileStyle)) {
    return `${Math.max(0, (gridWidth - gridGap * (safeColumns - 1)) / safeColumns)}px`;
  }

  if (bigTile) return `${100 / safeColumns}%`;

  const tileFactor = hasTileStyle ? (orientation === 'landscape' ? 1 : 0.09) : 1;

  // For normal tiles, use percentage-based flex layout
  return `${100 / (safeColumns + tileFactor)}%`;
};

export const ServiceBox = styled.View`
  margin: ${normalize(16)}px 0;
  aspect-ratio: 1;
  overflow: hidden;

  ${(props) =>
    props.gridWidth !== undefined && (props.bigTile || props.hasTileStyle)
      ? css`
          width: ${flexBasis(props)};
        `
      : css`
          flex-basis: ${flexBasis(props)};
        `};

  ${(props) =>
    props.gridWidth !== undefined &&
    css`
      flex-shrink: 1;
    `};

  ${(props) =>
    (props.bigTile || props.hasTileStyle) &&
    css`
      margin: 0 0 ${props.gridGap ?? normalize(1)}px 0;
    `};
`;
