import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, normalize } from '../../config';
import { updateFilters } from '../../helpers';
import { DropdownProps, FilterProps } from '../../types';
import { DropdownSelect } from '../DropdownSelect';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: DropdownProps[];
  filters: FilterProps;
  isOverlayFilter?: boolean;
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
  isOverlayFilter = false,
  label,
  multipleSelect,
  name,
  placeholder,
  searchPlaceholder,
  setFilters,
  showSearch
}: Props) => {
  const hasSelectedItem = data.some((item) => item.selected);
  const initiallySelectedItem =
    multipleSelect || !hasSelectedItem
      ? {
          id: 0,
          index: 0,
          value: placeholder || '',
          selected: multipleSelect ? !hasSelectedItem : !filters[name]
        }
      : undefined;
  const multipleFilterValues = Array.isArray(filters[name])
    ? (filters[name] as Array<string | number>)
    : [];

  const [dropdownData, setDropdownData] = useState<DropdownProps[]>([
    ...(initiallySelectedItem ? [initiallySelectedItem] : []),
    ...data.map((item) => ({
      ...item,
      selected: multipleSelect
        ? multipleFilterValues.includes(item.filterValue || item.id || item.value)
        : item.filterValue === filters[name] || item.value === filters[name]
    }))
  ]);
  const isFirstDropdownDataEffect = useRef(true);

  useEffect(() => {
    if (isFirstDropdownDataEffect.current) {
      isFirstDropdownDataEffect.current = false;

      if (multipleSelect) return;
    }

    if (multipleSelect) {
      const selectedItems = dropdownData
        ?.filter(
          (item: DropdownProps) =>
            item.selected && item.value && parseInt(item?.id?.toString()) !== 0
        )
        ?.map((item) => item.filterValue || item.id || item.value) as string[] | number[];

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

  return (
    <>
      <View style={[styles.container, containerStyle]}>
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
