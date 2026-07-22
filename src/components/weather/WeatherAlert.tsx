import React from 'react';
import { View } from 'react-native';

import { normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';

type Props = {
  description: string;
  end: number;
  event: string;
  start: number;
};

export const WeatherAlert = ({ description, end, event, start }: Props) => {
  const styles = useThemeStyles(createStyles);
  const from = momentFormat(start * 1000, 'DD.MM.YYYY HH:mm', 'x');
  const to = momentFormat(end * 1000, 'DD.MM.YYYY HH:mm', 'x');

  return (
    <Wrapper>
      <BoldText>{event}</BoldText>
      <RegularText>{texts.weather.alertsText(from, to)}</RegularText>
      {!!description && <RegularText>{description}</RegularText>}
      <View style={styles.separator} />
    </Wrapper>
  );
};

const createStyles = (colors) => ({
  separator: {
    backgroundColor: colors.gray60,
    height: normalize(1),
    marginTop: normalize(14)
  }
});
