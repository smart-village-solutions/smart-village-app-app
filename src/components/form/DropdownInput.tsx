import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { colors, normalize, texts } from '../../config';
import { DropdownSelect } from '../DropdownSelect';

import { Input } from './Input';

export type DropdownInputProps = {
  errors: any;
  required?: boolean;
  data: [
    {
      id: number;
      name: string;
      selected?: boolean;
      contentcontainer_id?: number;
      guid?: string;
      display_name?: string;
    }
  ];
  multipleSelect?: boolean;
  value: number | number[];
  valueKey: 'contentcontainer_id' | 'guid';
  onChange: (...event: any[]) => void;
  name: string;
  label: string;
  placeholder: string;
  control: any;
  showSearch?: boolean;
};

export const DropdownInput = ({
  errors,
  required = false,
  data,
  multipleSelect = false,
  value,
  valueKey,
  onChange,
  name,
  label,
  control,
  showSearch = true
}: DropdownInputProps) => {
  const [dropdownData, setDropdownData] = useState(
    data.map((item) =>
      multipleSelect
        ? { ...item, selected: (value as number[]).includes(item.id) }
        : { ...item, selected: item.id == value }
    )
  );

  useEffect(() => {
    if (multipleSelect) {
      const selectedMultipleData = dropdownData?.filter((entry) => entry.selected);
      const selectedMultipleValues = selectedMultipleData?.map((entry) => entry?.[valueKey]);

      onChange(selectedMultipleValues ?? []);
    } else {
      const selectedData = dropdownData?.find((entry) => entry.selected);
      const selectedValue = selectedData?.[valueKey];

      onChange(selectedValue ?? '');
    }
  }, [dropdownData]);

  return (
    <>
      <DropdownSelect
        data={dropdownData}
        multipleSelect={multipleSelect}
        setData={setDropdownData}
        label={label}
        labelWrapperStyle={styles.labelWrapper}
        showSearch={showSearch}
        searchInputStyle={styles.searchInput}
        searchPlaceholder={texts.volunteer.search}
      />
      <Input
        name={name}
        hidden
        validate
        rules={{ required }}
        errorMessage={errors[name] && `${label} muss ausgewählt werden`}
        control={control}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
