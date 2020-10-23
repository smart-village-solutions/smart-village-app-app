import styled, { css } from 'styled-components/native';

import { consts, normalize } from '../config';

export const ServiceBox = styled.View`
  flex-basis: ${100 / 3.3}%;
  margin: ${normalize(14)}px 0;

  ${(props) =>
    props.dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH &&
    css`
      /*
        need to add slightly more than 5.3 like on landscape in order to re-render
        on orientation change. with the same values in this condition and for landscape,
        it seems that the styled component is memoized and a re-rendering does not take place.
      */
      flex-basis: ${100 / 5.301}%;
    `};

  ${(props) =>
    props.orientation === 'landscape' &&
    css`
      flex-basis: ${100 / 5.3}%;
    `};
`;
