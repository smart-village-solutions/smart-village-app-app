import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { normalize } from '../../config';

enum StatusTypes {
  InBearbeitung = 'In Bearbeitung',
  Offen = 'Offen',
  Unbearbeitet = 'Unbearbeitet'
}

const defaultBackgroundColors = (status: string) => {
  switch (status) {
    case StatusTypes.InBearbeitung:
      return '#FECDCA';
    case StatusTypes.Offen:
      return '#FEF0C7';
    case StatusTypes.Unbearbeitet:
      return '#D1FADF';
    default:
      return 'rgb(0, 0, 0)';
  }
};

const defaultTextColors = (status: string) => {
  switch (status) {
    case StatusTypes.InBearbeitung:
      return '#B42318';
    case StatusTypes.Offen:
      return '#B54708';
    case StatusTypes.Unbearbeitet:
      return '#027A48';
    default:
      return 'rgb(0, 0, 0)';
  }
};

export const SueStatus = ({
  backgroundColors,
  containerStyle,
  status,
  textColors
}: {
  backgroundColors?: StatusTypes;
  containerStyle?: ViewStyle;
  status: string;
  textColors?: StatusTypes;
}) => {
  const backgroundColor = backgroundColors?.[status] || defaultBackgroundColors(status);
  const textColor = textColors?.[status] || defaultTextColors(status);

  return (
    <Wrapper style={[styles.container, !!containerStyle && containerStyle, { backgroundColor }]}>
      <RegularText style={{ color: textColor }} small>
        {status}
      </RegularText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    borderRadius: normalize(40),
    justifyContent: 'center',
    margin: normalize(10)
  }
});
