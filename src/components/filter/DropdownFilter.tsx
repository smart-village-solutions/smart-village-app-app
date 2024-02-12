import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { normalize } from '../../config';
import { DropdownSelect } from '../DropdownSelect';
import { Label } from '../Label';
import { filterObject, updateFilter } from '../../helpers';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: {
    id: number;
    index: number;
    selected: boolean;
    value: string;
  }[];
  filter: { [key: string]: string | undefined };
  label?: string;
  name: string;
  placeholder?: string;
  setFilter: (variables: { [key: string]: string | undefined }) => void;
};

export const DropdownFilter = ({
  containerStyle,
  data,
  filter,
  label,
  name,
  placeholder,
  setFilter
}: Props) => {
  const [dropdownData, setDropdownData] = useState([
    { id: 0, value: placeholder, selected: true },
    ...data
  ]);

  useEffect(() => {
    setFilter(
      updateFilter({
        condition: dropdownData[0].selected,
        currentFilter: filter,
        name,
        value: dropdownData?.find(
          (entry: { selected: string; value: string }) => entry.selected && entry.value
        )?.value
      })
    );
  }, [dropdownData]);

  // added to make the placeholder data appear in the dropdown after resetting the filter
  useEffect(() => {
    if (!filter[name] && !dropdownData[0].selected) {
      setDropdownData([{ id: 0, value: placeholder, selected: true }, ...data]);
    }
  }, [filter]);

  return (
    <>
      {!!label && <Label style={styles.label}>{label}</Label>}
      <View style={(styles.container, containerStyle)}>
        <DropdownSelect data={dropdownData} setData={setDropdownData} placeholder={placeholder} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    marginBottom: normalize(-10)
  }
});
