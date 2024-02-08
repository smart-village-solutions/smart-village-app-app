import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { normalize } from '../../config';
import { DropdownSelect } from '../DropdownSelect';
import { Label } from '../Label';

import { Input } from './../form';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  control: any;
  data: {
    id: number;
    index: number;
    selected: boolean;
    value: string;
  }[];
  errors: any;
  label?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
};

export const DropdownFilter = ({
  containerStyle,
  control,
  data,
  errors,
  label,
  name,
  placeholder,
  required
}: Props) => {
  const [dropdownData, setDropdownData] = useState([
    { id: 0, value: placeholder, selected: true },
    ...data
  ]);

  return (
    <>
      {!!label && <Label style={styles.label}>{label}</Label>}
      <View style={(styles.container, containerStyle)}>
        <Controller
          name={name}
          render={({ field: { name, onChange, value } }) => {
            useEffect(() => {
              onChange(
                dropdownData?.find(
                  (entry) =>
                    entry.value !== placeholder && (entry.selected ? entry.value : undefined)
                )?.value
              );
            }, [dropdownData]);

            // added to make the placeholder data appear in the dropdown after resetting the filter
            useEffect(() => {
              if (!value) {
                setDropdownData([{ id: 0, value: placeholder, selected: true }, ...data]);
              }
            }, [value]);
            return (
              <>
                <DropdownSelect
                  data={dropdownData}
                  setData={setDropdownData}
                  placeholder={placeholder}
                />
                <Input
                  name={name}
                  validate
                  hidden
                  rules={{ required }}
                  errorMessage={errors[name] && `${name} muss ausgewählt werden`}
                  control={control}
                />
              </>
            );
          }}
          control={control}
        />
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
