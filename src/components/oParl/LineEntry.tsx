import React from 'react';
import { StyleSheet, View } from 'react-native';
import { normalize } from '../../config';

import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperRow, WrapperWrap } from '../Wrapper';

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

  const SelectedWrapper = fullText ? WrapperWrap : WrapperRow;

  const innerComponent = (
    <SelectedWrapper style={styles.marginTop}>
      <BoldText>{left}</BoldText>
      <View style={styles.shrink}>
        <RegularText
          numberOfLines={fullText ? undefined : 1}
          lineThrough={lineThrough}
          primary={!!onPress}
          selectable={selectable}
        >
          {right}
        </RegularText>
      </View>
    </SelectedWrapper>
  );

  return onPress ? <Touchable onPress={onPress}>{innerComponent}</Touchable> : innerComponent;
};

const styles = StyleSheet.create({
  shrink: {
    flexShrink: 1
  },
  marginTop: {
    marginTop: normalize(12)
  }
});
