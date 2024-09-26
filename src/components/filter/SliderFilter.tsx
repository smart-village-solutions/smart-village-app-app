import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Slider } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { Label } from '../Label';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

type Props = {
  label?: string;
  onValueChange: (value: number) => void;
  thumbStyle?: ViewStyle;
  value: number;
};

export const SliderFilter = ({ label, onValueChange, thumbStyle, value, ...props }: Props) => {
  return (
    <>
      {!!label && <Label>{label}</Label>}
      <WrapperRow spaceBetween style={styles.alignItemsCenter}>
        <Slider
          maximumValue={100}
          onValueChange={onValueChange}
          step={10}
          thumbStyle={[styles.thumbStyle, thumbStyle]}
          thumbTouchSize={{ width: normalize(20), height: normalize(20) }}
          value={value}
          style={styles.slider}
          {...props}
        />
        <View style={styles.textContainer}>
          <RegularText>{value}</RegularText>
        </View>
      </WrapperRow>
    </>
  );
};

const styles = StyleSheet.create({
  alignItemsCenter: {
    alignItems: 'center'
  },
  slider: {
    flex: 1
  },
  textContainer: {
    borderRadius: normalize(5),
    borderWidth: normalize(1),
    marginLeft: normalize(10),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(10)
  },
  thumbStyle: {
    backgroundColor: colors.primary,
    width: normalize(20),
    height: normalize(20)
  }
});
