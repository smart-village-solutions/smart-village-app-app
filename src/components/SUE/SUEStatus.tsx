import React from 'react';
import { ViewStyle } from 'react-native';

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

export const SUEStatus = ({
  backgroundColors,
  containerStyle,
  status,
  textColors
}: {
  backgroundColors: string;
  containerStyle: ViewStyle;
  status: string;
  textColors: string;
}) => {
  const backgroundColor = backgroundColors?.[status] || defaultBackgroundColors(status);
  const textColor = textColors?.[status] || defaultTextColors(status);

  const containerStyles = {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    backgroundColor,
    borderRadius: normalize(40),
    justifyContent: 'center',
    margin: normalize(10),
    ...containerStyle
  };

  const textStyle = {
    color: textColor
  };

  return (
    <Wrapper style={containerStyles}>
      <RegularText style={textStyle} small>
        {status}
      </RegularText>
    </Wrapper>
  );
};
