import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { updateFilters } from '../../helpers';
import { DropdownProps, FilterProps } from '../../types';
import { DropdownSelect } from '../DropdownSelect';
import { colors, normalize } from '../../config';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: DropdownProps[];
  filters: FilterProps;
  isOverlayFilter: boolean;
  label?: string;
  multipleSelect?: boolean;
  name: keyof FilterProps;
  placeholder?: string;
  searchPlaceholder?: string;
  setFilters: React.Dispatch<FilterProps>;
  showSearch?: boolean;
};

export const DropdownFilter = ({
  containerStyle,
  data,
  filters,
  isOverlayFilter,
  label,
  multipleSelect,
  name,
  placeholder,
  searchPlaceholder,
  setFilters,
  showSearch
}: Props) => {
  const initiallySelectedItem = {
    id: 0,
    index: 0,
    value: placeholder || '',
    selected: filters[name] ? false : true
  };
  const [dropdownData, setDropdownData] = useState<DropdownProps[]>([
    initiallySelectedItem,
    ...data
  ]);

  useEffect(() => {
    if (multipleSelect) {
      const selectedItems = dropdownData
        ?.filter(
          (item: { selected: boolean; value: string; id: string | number }) =>
            item.selected && item.value && parseInt(item?.id?.toString()) !== 0
        )
        ?.map((item) => item.id || item.value);

      setFilters(
        updateFilters({
          currentFilters: filters,
          name,
          removeFromFilter: dropdownData[0].selected,
          value: selectedItems
        })
      );
    } else {
      const selectedItem = dropdownData?.find((item: DropdownProps) => item.selected && item.value);

      setFilters(
        updateFilters({
          currentFilters: filters,
          name,
          removeFromFilter: dropdownData[0].selected,
          value: selectedItem?.filterValue || selectedItem?.value || ''
        })
      );
    }
  }, [dropdownData]);

  // added to make the placeholder data appear in the dropdown after resetting the filter
  useEffect(() => {
    if (!filters[name]?.length && !dropdownData[0].selected) {
      setDropdownData([initiallySelectedItem, ...data]);
    }
  }, [filters]);

  return (
    <>
      <View style={(styles.container, containerStyle)}>
        <DropdownSelect
          data={dropdownData}
          isOverlayFilter={isOverlayFilter}
          label={label}
          labelWrapperStyle={styles.labelWrapper}
          multipleSelect={multipleSelect}
          placeholder={placeholder}
          searchInputStyle={styles.searchInput}
          searchPlaceholder={searchPlaceholder}
          setData={setDropdownData}
          showSearch={showSearch}
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
  },
  searchInput: {
    borderColor: colors.borderRgba,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    justifyContent: 'space-between',
    lineHeight: normalize(22),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});
