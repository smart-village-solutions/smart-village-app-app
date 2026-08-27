import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { normalize, texts } from '../../config';
import { DropdownSelect } from '../DropdownSelect';
import { useThemeStyles } from '../../hooks/useThemeStyles';

import { Input } from './Input';

type DropdownEntry = {
  id: number;
  value: string;
  selected?: boolean;
  index?: number;
  name?: string;
  contentcontainer_id?: number;
  guid?: string;
  display_name?: string;
  gender?: string;
  isPlaceholder?: boolean;
};

export type DropdownInputProps = {
  boldLabel?: boolean;
  errors: Record<string, unknown>;
  required?: boolean;
  data: DropdownEntry[];
  multipleSelect?: boolean;
  value: number | string | Array<number | string>;
  valueKey: 'contentcontainer_id' | 'gender' | 'guid' | 'id' | 'index' | 'name';
  onChange: (...event: unknown[]) => void;
  name: string;
  label: string;
  placeholder: string;
  control: Control<FieldValues>;
  showSearch?: boolean;
};

export const DropdownInput = ({
  boldLabel = false,
  errors,
  required = false,
  data,
  multipleSelect = false,
  value,
  valueKey = 'id',
  onChange,
  name,
  label,
  placeholder,
  control,
  showSearch = true
}: DropdownInputProps) => {
  const styles = useThemeStyles(createStyles);
  const isPlaceholderValue = (inputValue: unknown) => inputValue === '' || inputValue === -1;

  const hasSelectedValue = (inputValue: unknown) => {
    if (Array.isArray(inputValue)) {
      return inputValue.length > 0;
    }

    if (isPlaceholderValue(inputValue)) {
      return false;
    }

    return inputValue === 0 || inputValue === '0' || !!inputValue;
  };

  const validateRequiredValue = (inputValue: unknown) => {
    if (!required) {
      return true;
    }

    return hasSelectedValue(inputValue);
  };

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const getEntryValue = useCallback(
    (entry: DropdownEntry) => entry[valueKey] as string | number | undefined,
    [valueKey]
  );
  const buildDropdownData = useCallback(
    (inputValue: number | string | Array<number | string>, inputData: DropdownEntry[]) => [
      {
        id: -1,
        index: 0,
        isPlaceholder: true,
        value: placeholder || '',
        selected: !hasSelectedValue(inputValue)
      },
      ...inputData.map((item) =>
        multipleSelect
          ? {
              ...item,
              selected: (Array.isArray(inputValue) ? inputValue : []).includes(
                getEntryValue(item) ?? ''
              )
            }
          : { ...item, selected: getEntryValue(item) == inputValue }
      )
    ],
    [getEntryValue, multipleSelect, placeholder]
  );

  const areValuesEqual = useCallback(
    (
      left: number | string | Array<number | string>,
      right: number | string | Array<number | string>
    ) => {
      if (Array.isArray(left) && Array.isArray(right)) {
        if (left.length !== right.length) {
          return false;
        }

        return left.every((entry, index) => entry === right[index]);
      }

      return left === right;
    },
    []
  );
  const areDropdownEntriesEqual = useCallback(
    (left: DropdownEntry[], right: DropdownEntry[]) => {
      if (left.length !== right.length) {
        return false;
      }

      return left.every((entry, index) => {
        const comparedEntry = right[index];

        return (
          entry.id === comparedEntry.id &&
          entry.value === comparedEntry.value &&
          entry.selected === comparedEntry.selected &&
          entry.isPlaceholder === comparedEntry.isPlaceholder
        );
      });
    },
    []
  );

  const [dropdownData, setDropdownData] = useState(buildDropdownData(value, data));

  const getSelectedMultipleValues = useCallback(
    () =>
      dropdownData
        ?.filter((entry) => entry.selected && !entry.isPlaceholder)
        .map((entry) => getEntryValue(entry))
        .filter((entry): entry is string | number => entry !== undefined) ?? [],
    [dropdownData, getEntryValue]
  );

  const getSelectedValue = useCallback(() => {
    const selectedData = dropdownData?.find((entry) => entry.selected);

    if (!selectedData || selectedData.isPlaceholder) {
      return '';
    }

    return getEntryValue(selectedData) ?? '';
  }, [dropdownData, getEntryValue]);

  useEffect(() => {
    const nextDropdownData = buildDropdownData(value, data);
    setDropdownData((currentDropdownData) =>
      areDropdownEntriesEqual(currentDropdownData, nextDropdownData)
        ? currentDropdownData
        : nextDropdownData
    );
  }, [areDropdownEntriesEqual, buildDropdownData, data, value]);

  useEffect(() => {
    if (multipleSelect) {
      const selectedMultipleValues = getSelectedMultipleValues();

      if (Array.isArray(value) && areValuesEqual(value, selectedMultipleValues)) {
        return;
      }

      onChangeRef.current(selectedMultipleValues);
    } else {
      const selectedValue = getSelectedValue();

      if (!Array.isArray(value) && areValuesEqual(value, selectedValue ?? '')) {
        return;
      }

      onChangeRef.current(selectedValue ?? '');
    }
  }, [areValuesEqual, getSelectedMultipleValues, getSelectedValue, multipleSelect, value]);

  return (
    <>
      <DropdownSelect
        data={dropdownData}
        multipleSelect={multipleSelect}
        setData={setDropdownData}
        boldLabel={boldLabel}
        label={label}
        labelWrapperStyle={styles.labelWrapper}
        placeholder={placeholder}
        showSearch={showSearch}
        searchInputStyle={styles.searchInput}
        searchPlaceholder={texts.volunteer.search}
        errorMessage={errors[name] && `${label} muss ausgewählt werden`}
      />
      <Input
        name={name}
        hidden
        validate
        rules={{ validate: validateRequiredValue }}
        errorMessage={errors[name] && `${label} muss ausgewählt werden`}
        control={control}
      />
    </>
  );
};

const createStyles = (colors) => ({
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
