import React, { useCallback, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { normalize } from '../../config';
import { updateFilters } from '../../helpers';
import { DropdownProps, FilterProps } from '../../types';
import { DropdownSelect } from '../DropdownSelect';
import { useThemeStyles } from '../../hooks/useThemeStyles';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: DropdownProps[];
  filters: FilterProps;
  inlineDropdown?: boolean;
  isOverlayFilter?: boolean;
  label?: string;
  multipleSelect?: boolean;
  name: keyof FilterProps;
  placeholder?: string;
  requireSelection?: boolean;
  searchPlaceholder?: string;
  setFilters: React.Dispatch<FilterProps>;
  showSearch?: boolean;
};

export const DropdownFilter = ({
  containerStyle,
  data,
  filters,
  inlineDropdown,
  isOverlayFilter = false,
  label,
  multipleSelect,
  name,
  placeholder,
  requireSelection,
  searchPlaceholder,
  setFilters,
  showSearch
}: Props) => {
  const styles = useThemeStyles(createStyles);
  const hasFilterValue = (value: FilterProps[keyof FilterProps]) =>
    Array.isArray(value) ? !!value.length : !!value;

  const dropdownData = useMemo(() => {
    const shouldShowPlaceholder = multipleSelect || !data.some((item) => item.selected);
    const initiallySelectedItem = shouldShowPlaceholder
      ? {
          id: 0,
          index: 0,
          value: placeholder || '',
          selected: !hasFilterValue(filters[name])
        }
      : undefined;

    return [
      ...(initiallySelectedItem ? [initiallySelectedItem] : []),
      ...data.map((item) => ({
        ...item,
        selected: multipleSelect
          ? Array.isArray(filters[name]) &&
            filters[name]?.includes(item.filterValue ?? item.id ?? item.value)
          : item.filterValue === filters[name] || item.value === filters[name]
      }))
    ];
  }, [data, filters, multipleSelect, name, placeholder]);

  const handleDropdownDataChange = useCallback(
    (updatedDropdownData: DropdownProps[]) => {
      const firstItemSelected = !!updatedDropdownData[0]?.selected;

      if (multipleSelect) {
        const selectedItems = updatedDropdownData
          ?.filter(
            (item: DropdownProps) =>
              item.selected && item.value && parseInt(item?.id?.toString()) !== 0
          )
          ?.map((item) => item.filterValue ?? item.id ?? item.value);

        setFilters(
          updateFilters({
            currentFilters: filters,
            name,
            removeFromFilter: firstItemSelected,
            value: selectedItems
          })
        );
      } else {
        const selectedItem = updatedDropdownData?.find(
          (item: DropdownProps) => item.selected && item.value
        );

        setFilters(
          updateFilters({
            currentFilters: filters,
            name,
            removeFromFilter: firstItemSelected,
            value: selectedItem?.filterValue || selectedItem?.value || ''
          })
        );
      }
    },
    [filters, multipleSelect, name, setFilters]
  );

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        <DropdownSelect
          data={dropdownData}
          isOverlayFilter={isOverlayFilter}
          inlineDropdown={inlineDropdown}
          label={label}
          labelWrapperStyle={styles.labelWrapper}
          multipleSelect={multipleSelect}
          placeholder={placeholder}
          requireSelection={requireSelection}
          searchInputStyle={styles.searchInput}
          searchPlaceholder={searchPlaceholder}
          setData={handleDropdownDataChange}
          showSearch={showSearch}
        />
      </View>
    </>
  );
};

const createStyles = (colors) => ({
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
