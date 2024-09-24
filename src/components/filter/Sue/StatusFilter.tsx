import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { updateFilters } from '../../../helpers';
import { Label } from '../../Label';
import { SueStatus } from '../../SUE';
import { WrapperRow } from '../../Wrapper';
import { FilterProps, StatusProps } from '../../../types';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: StatusProps[];
  filters: FilterProps;
  label?: string;
  name: keyof FilterProps;
  setFilters: React.Dispatch<FilterProps>;
};

export const StatusFilter = ({ containerStyle, data, filters, label, name, setFilters }: Props) => (
  <View style={(styles.container, containerStyle)}>
    <Label>{label}</Label>
    <WrapperRow spaceBetween>
      {data?.map((item: StatusProps, index: number) => (
        <TouchableOpacity
          onPress={() =>
            setFilters(
              updateFilters({
                currentFilters: filters,
                name,
                removeFromFilter: filters[name] === item.codesForFilter,
                value: item.codesForFilter
              })
            )
          }
          key={`${item.status}-${index}`}
        >
          <SueStatus
            disabled={filters[name] !== item.codesForFilter}
            iconName={item.iconName}
            isFilter
            small
            status={item.status}
          />
        </TouchableOpacity>
      ))}
    </WrapperRow>
  </View>
);

const styles = StyleSheet.create({
  container: {}
});
