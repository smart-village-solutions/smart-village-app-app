import React from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

import { device, colors, normalize } from '../../config';
import { WrapperRow } from '../../components';

const DayTimeBox = styled.Text`
  flex: 1;
  flex-direction: column;
`;
const openingHours = [
  {
    weekday: 'Lorem',
    timeFrom: 11,
    timeTo: 18
  },
  {
    weekday: 'aliqua',
    timeFrom: 11,
    timeTo: 18
  },
  {
    weekday: 'dolore',
    timeFrom: 11,
    timeTo: 18
  },
  {
    weekday: 'minim',
    timeFrom: 11,
    timeTo: 18
  }
];

export const OpeningTime = () => (
  <View style={{ flex: 1, flexDrection: 'row', padding: normalize(14) }}>
    <WrapperRow>
      {openingHours.map((item, index) => {
        const { weekday, timeFrom, timeTo } = item;
        return (
          <DayTimeBox key={index}>
            {!!weekday && <Text>{weekday}</Text>}
            {!!timeFrom && <Text>{timeFrom}</Text>}
            {!!timeTo && <Text>{timeTo}</Text>}
          </DayTimeBox>
        );
      })}
    </WrapperRow>
  </View>
);
