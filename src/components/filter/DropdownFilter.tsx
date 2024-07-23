import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { normalize } from '../../config';
import { updateFilters } from '../../helpers';
import { DropdownSelect } from '../DropdownSelect';
import { Label } from '../Label';

import { DropdownProps, FilterProps } from './Filter';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: DropdownProps[];
  filters: FilterProps;
  label?: string;
  name: keyof FilterProps;
  placeholder?: string;
  setFilters: React.Dispatch<FilterProps>;
};

export const DropdownFilter = ({
  containerStyle,
  data,
  filters,
  label,
  name,
  placeholder,
  setFilters
}: Props) => {
  const initiallySelectedItem = { id: 0, index: 0, value: placeholder || '', selected: true };
  const [dropdownData, setDropdownData] = useState<DropdownProps[]>([
    initiallySelectedItem,
    ...data
  ]);

  useEffect(() => {
    const selectedItem = dropdownData?.find(
      (item: { selected: string; value: string }) => item.selected && item.value
    );

    setFilters(
      updateFilters({
        currentFilters: filters,
        name,
        removeFromFilter: dropdownData[0].selected,
        value: selectedItem?.filterValue || selectedItem?.value || ''
      })
    );
  }, [dropdownData]);

  // added to make the placeholder data appear in the dropdown after resetting the filter
  useEffect(() => {
    if (!filters[name] && !dropdownData[0].selected) {
      setDropdownData([initiallySelectedItem, ...data]);
    }
  }, [filters]);

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
