import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Slider } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { Label } from '../Label';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

type Props = {
  index?: number;
  label?: string;
  maximumValue?: number;
  minimumValue?: number;
  onSlidingComplete?: (value: number) => void;
  step?: number;
  thumbStyle?: ViewStyle;
  values?: number[];
};

export const SliderFilter = ({
  index = 0,
  label,
  maximumValue = 100,
  minimumValue = 0,
  onSlidingComplete,
  step = 1,
  thumbStyle,
  values = [],
  ...props
}: Props) => {
  const minimumSliderValue: number = values?.length ? 0 : minimumValue;
  const maximumSliderValue: number = values?.length - 1 || maximumValue;

  const [sliderValue, setSliderValue] = useState({
    value: values[index] || minimumSliderValue,
    index
  });

  return (
    <>
      {!!label && <Label bold>{label}</Label>}
      <WrapperRow spaceBetween style={styles.alignItemsCenter}>
        <RegularText>{values?.length ? Math.min(...values) : minimumValue}</RegularText>
        <Slider
          onSlidingComplete={onSlidingComplete}
          maximumValue={maximumSliderValue}
          minimumValue={minimumSliderValue}
          onValueChange={(index) => {
            const value = values[index] || index;

            setSliderValue({ value, index });
          }}
          step={step}
          style={styles.slider}
          thumbStyle={[styles.thumbStyle, thumbStyle]}
          thumbTouchSize={{ width: normalize(20), height: normalize(20) }}
          value={sliderValue.index}
          {...props}
        />
        <RegularText>{values?.length ? Math.max(...values) : minimumValue}</RegularText>
        <View style={styles.textContainer}>
          <RegularText>{sliderValue.value}</RegularText>
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
    flex: 1,
    marginHorizontal: normalize(10)
  },
  textContainer: {
    alignItems: 'center',
    borderRadius: normalize(5),
    borderWidth: normalize(1),
    marginLeft: normalize(10),
    paddingVertical: normalize(10),
    width: normalize(60)
  },
  thumbStyle: {
    backgroundColor: colors.primary,
    width: normalize(20),
    height: normalize(20)
  }
});
