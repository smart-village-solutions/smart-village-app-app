import React from 'react';
import styled from 'styled-components';
import { Text } from 'react-native';

import { device, colors, normalize } from '../../config';
import { WrapperRow } from '../../components';

const DayTimeBox = styled.Text`
  flex: 1;
  flex-direction: column;
`;
const time = '10.00';
export const OpeningTime = () => (
  <WrapperRow style={{ padding: normalize(14) }}>
    {!!time && <DayTimeBox>Mo {time}</DayTimeBox>}
    {!!time && <DayTimeBox>Di {time}</DayTimeBox>}
    {!!time && <DayTimeBox>Mi {time}</DayTimeBox>}
    {!!time && <DayTimeBox>Do {time}</DayTimeBox>}
    {!!time && <DayTimeBox>Fr {time}</DayTimeBox>}
    {!!time && <DayTimeBox>Sa {time}</DayTimeBox>}
    {!!time && <DayTimeBox>So {time}</DayTimeBox>}
  </WrapperRow>
);
