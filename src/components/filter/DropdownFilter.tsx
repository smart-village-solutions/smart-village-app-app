import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { updateFilters } from '../../helpers';
import { DropdownProps, FilterProps } from '../../types';
import { DropdownSelect } from '../DropdownSelect';

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
  const [dropdownData, setDropdownData] = useState<DropdownProps[]>(() => {
    if (data[0]?.value === '- Alle -') {
      return [...data];
    }

    return [initiallySelectedItem, ...data];
  });

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
      <View style={(styles.container, containerStyle)}>
        <DropdownSelect
          data={dropdownData}
          label={label}
          labelWrapperStyle={styles.labelWrapper}
          placeholder={placeholder}
          setData={setDropdownData}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  labelWrapper: {
    paddingLeft: 0,
    paddingRight: 0
  }
});
