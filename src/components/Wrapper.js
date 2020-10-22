import PropTypes from 'prop-types';
import React, { memo } from 'react';
import styled from 'styled-components/native';

import { consts, normalize } from '../config';

export const Wrapper = styled.View`
  padding: ${normalize(14)}px;
`;

export const WrapperHorizontal = styled.View`
  padding-left: ${normalize(14)}px;
  padding-right: ${normalize(14)}px;
`;

export const WrapperLandscape = styled.View`
  flex: 1;
  padding-left: 15%;
  padding-right: 15%;
`;

export const WrapperRow = styled.View`
  flex-direction: row;
`;

export const WrapperWrap = styled(WrapperRow)`
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
`;

export const InfoBox = styled(WrapperRow)`
  margin-bottom: ${normalize(5)}px;
`;

export const WrapperWithOrientation = memo(({ orientation, dimensions, children }) => {
  const needLandscapeWrapper =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  if (needLandscapeWrapper) {
    return <WrapperLandscape>{children}</WrapperLandscape>;
  }

  return children;
});

WrapperWithOrientation.displayName = 'WrapperWithOrientation';

WrapperWithOrientation.propTypes = {
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
};
