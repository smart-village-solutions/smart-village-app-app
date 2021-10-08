import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import styled, { css } from 'styled-components/native';

import { consts, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

export const Wrapper = styled.View`
  padding: ${normalize(14)}px;

  ${(props) =>
    props.shrink &&
    css`
      flex-shrink: 1;
    `};
`;

export const WrapperHorizontal = styled.View`
  padding-left: ${normalize(14)}px;
  padding-right: ${normalize(14)}px;

  ${(props) =>
    props.big &&
    css`
      padding-left: ${normalize(17)}px;
      padding-right: ${normalize(17)}px;
    `};
`;

export const WrapperVertical = styled.View`
  padding-bottom: ${normalize(14)}px;
  padding-top: ${normalize(14)}px;
`;

export const WrapperLandscape = styled.View`
  padding-left: 15%;
  padding-right: 15%;

  ${(props) =>
    !props.noFlex &&
    css`
      flex: 1;
    `};
`;

export const WrapperRow = styled.View`
  flex-direction: row;

  ${(props) =>
    props.center &&
    css`
      justify-content: center;
    `};

  ${(props) =>
    props.shrink &&
    css`
      flex-shrink: 1;
    `};

  ${(props) =>
    props.spaceAround &&
    css`
      justify-content: space-around;
    `};

  ${(props) =>
    props.spaceBetween &&
    css`
      justify-content: space-between;
    `};
`;

export const WrapperWrap = styled(WrapperRow)`
  flex-wrap: wrap;
  width: 100%;
`;

export const InfoBox = styled(WrapperRow)`
  margin-bottom: ${normalize(5)}px;
`;

export const WrapperWithOrientation = ({ noFlex, children }) => {
  const { orientation, dimensions } = useContext(OrientationContext);

  const needLandscapeWrapper =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  if (needLandscapeWrapper) {
    return <WrapperLandscape noFlex={noFlex}>{children}</WrapperLandscape>;
  }

  return children;
};

WrapperWithOrientation.displayName = 'WrapperWithOrientation';

WrapperWithOrientation.propTypes = {
  noFlex: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
};

WrapperWithOrientation.defaultProps = {
  noFlex: false
};
