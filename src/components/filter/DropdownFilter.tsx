import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { DropdownSelect } from '../DropdownSelect';
import { Label } from '../Label';

import { Input } from './../form';
import { normalize } from '../../config';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  control: any;
  data: {
    selected: boolean;
    value: string;
  }[];
  displayKey?: string;
  errors: any;
  label?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  valueKey: string;
};

export const DropdownFilter = ({
  containerStyle,
  control,
  data,
  displayKey = 'value',
  errors,
  label,
  name,
  placeholder,
  required,
  valueKey = 'value'
}: Props) => {
  const dropdownEntries = [{ selected: true, [displayKey]: placeholder }, ...data];

  const [dropdownData, setDropdownData] = useState(
    dropdownEntries.map((item) => ({ ...item, value: item[displayKey] }))
  );

  return (
    <>
      <Label style={{ marginBottom: normalize(-10) }}>{label}</Label>
      <View style={(styles.container, containerStyle)}>
        <Controller
          name={name}
          render={({ field: { name, onChange } }) => {
            useEffect(() => {
              onChange(
                dropdownData?.find((entry) => (entry.selected ? entry[valueKey] : undefined))?.[
                  valueKey
                ]
              );
            }, [dropdownData]);

            return (
              <>
                <DropdownSelect data={dropdownData} setData={setDropdownData} />
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
  container: {}
});
