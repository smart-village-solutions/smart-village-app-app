import React from 'react';
import { View } from 'react-native';
import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

type Props = {
  description: string;
  end: number;
  event: string;
  start: number;
};

export const WeatherAlert = ({ description, end, event, start }: Props) => {
  return (
    <View>
      <Wrapper>
        <BoldText>{event}</BoldText>
        <RegularText>
          Zwischen {momentFormat(start * 1000, 'DD.MM.YYYY HH:mm', 'x')} Uhr und{' '}
          {momentFormat(end * 1000, 'DD.MM.YYYY HH:mm', 'x')} Uhr.
        </RegularText>
        <RegularText>{description}</RegularText>
      </Wrapper>
    </View>
  );
};
