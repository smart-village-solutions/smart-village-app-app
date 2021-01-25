import React from 'react';

import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperRow } from '../Wrapper';

type Props = {
  fullText?: boolean;
  left: string;
  lineThrough?: boolean;
  onPress?: () => void;
  right?: string;
  selectable?: boolean;
};

export const LineEntry = ({ fullText, left, lineThrough, onPress, right, selectable }: Props) => {
  if (!right?.length) {
    return null;
  }

  const innerComponent = (
    <WrapperRow>
      <BoldText>{left}</BoldText>
      <RegularText
        numberOfLines={fullText ? undefined : 1}
        lineThrough={lineThrough}
        primary={!!onPress}
        selectable={selectable}
      >
        {right}
      </RegularText>
    </WrapperRow>
  );

  return onPress ? <Touchable onPress={onPress}>{innerComponent}</Touchable> : innerComponent;
};
