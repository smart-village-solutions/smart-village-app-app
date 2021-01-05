import React from 'react';
import { View } from 'react-native';
import { BoldText, RegularText } from '../Text';
import { Title, TitleContainer } from '../Title';
import { Wrapper } from '../Wrapper';

type Props = {
  description: string;
  end: number;
  event: string;
  start: number;
};

export const WeatherAlert = ({ description, end, event, start }: Props) => {
  // TODO: proper date format

  return (
    <View>
      <TitleContainer>
        <Title>Wetterwarnungen</Title>
      </TitleContainer>
      <Wrapper>
        <BoldText>{event}</BoldText>
        <RegularText>
          Zwischen {start} und {end}
        </RegularText>
        <RegularText>{description}</RegularText>
      </Wrapper>
    </View>
  );
};
