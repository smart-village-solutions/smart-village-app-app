import React from 'react';

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
  const from = momentFormat(start * 1000, 'DD.MM.YYYY HH:mm', 'x');
  const to = momentFormat(end * 1000, 'DD.MM.YYYY HH:mm', 'x');

  return (
    <Wrapper>
      <BoldText>{event}</BoldText>
      <RegularText>{`Zwischen ${from} Uhr und ${to} Uhr.`}</RegularText>
      <RegularText>{description}</RegularText>
    </Wrapper>
  );
};
