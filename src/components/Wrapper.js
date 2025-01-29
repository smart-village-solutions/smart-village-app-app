import styled, { css } from 'styled-components/native';

import { normalize } from '../config';

export const Wrapper = styled.View`
  padding: ${normalize(16)}px;

  ${(props) =>
    props.itemsCenter &&
    css`
      align-items: center;
    `};

  ${(props) =>
    props.small &&
    css`
      padding: ${normalize(7)}px;
    `};

  ${(props) =>
    props.shrink &&
    css`
      flex-shrink: 1;
    `};

  ${(props) =>
    props.noPaddingBottom &&
    css`
      padding-bottom: 0px;
    `};

  ${(props) =>
    props.noPaddingTop &&
    css`
      padding-top: 0px;
    `};
`;

export const WrapperHorizontal = styled.View`
  padding-left: ${normalize(16)}px;
  padding-right: ${normalize(16)}px;

  ${(props) =>
    props.itemsCenter &&
    css`
      align-items: center;
    `};

  ${(props) =>
    props.big &&
    css`
      padding-left: ${normalize(17)}px;
      padding-right: ${normalize(17)}px;
    `};
`;

export const WrapperVertical = styled.View`
  padding-bottom: ${normalize(16)}px;
  padding-top: ${normalize(16)}px;

  ${(props) =>
    props.itemsCenter &&
    css`
      align-items: center;
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
    props.itemsCenter &&
    css`
      align-items: center;
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

  ${(props) =>
    props.centerVertical &&
    css`
      align-items: center;
    `};
`;

export const WrapperWrap = styled(WrapperRow)`
  flex-wrap: wrap;
  width: 100%;
`;

export const InfoBox = styled(WrapperRow)`
  margin-bottom: ${normalize(5)}px;
  margin-top: ${normalize(5)}px;
`;
