import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Label } from '../../Label';
import { SueStatus } from '../../SUE';
import { WrapperRow } from '../../Wrapper';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  control: any;
  data: {
    status: string;
    matchingStatuses: string[];
    iconName: string;
  }[];
  name: string;
  label?: string;
};

export const StatusFilter = ({ containerStyle, control, data, name, label }: Props) => {
  return (
    <View style={(styles.container, containerStyle)}>
      <Controller
        name={name}
        render={({ field: { onChange, value } }) => (
          <>
            <Label>{label}</Label>
            <WrapperRow spaceBetween>
              {data?.map(
                (
                  item: { status: string; matchingStatuses: string[]; iconName: string },
                  index: number
                ) => (
                  <TouchableOpacity onPress={() => onChange(item.status)} key={index}>
                    <SueStatus
                      disabled={value !== item.status}
                      iconName={item.iconName}
                      small
                      status={item.status}
                    />
                  </TouchableOpacity>
                )
              )}
            </WrapperRow>
          </>
        )}
        control={control}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});
