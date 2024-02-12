import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Label } from '../../Label';
import { SueStatus } from '../../SUE';
import { WrapperRow } from '../../Wrapper';
import { filterObject, updateFilter } from '../../../helpers';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: {
    status: string;
    matchingStatuses: string[];
    iconName: string;
  }[];
  filter: { [key: string]: string };
  label?: string;
  name: string;
  setFilter: (variables: { [key: string]: string | undefined }) => void;
};

export const StatusFilter = ({ containerStyle, data, filter, label, name, setFilter }: Props) => (
  <View style={(styles.container, containerStyle)}>
    <Label>{label}</Label>
    <WrapperRow spaceBetween>
      {data?.map(
        (item: { status: string; matchingStatuses: string[]; iconName: string }, index: number) => (
          <TouchableOpacity
            onPress={() =>
              setFilter(
                updateFilter({
                  condition: filter[name] === item.status,
                  currentFilter: filter,
                  name,
                  value: item.status
                })
              )
            }
            key={index}
          >
            <SueStatus
              disabled={filter[name] !== item.status}
              iconName={item.iconName}
              small
              status={item.status}
            />
          </TouchableOpacity>
        )
      )}
    </WrapperRow>
  </View>
);

const styles = StyleSheet.create({
  container: {}
});
