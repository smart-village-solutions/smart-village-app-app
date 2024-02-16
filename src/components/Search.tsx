import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { Icon, colors, normalize } from '../config';

import { WrapperRow } from './Wrapper';
import { Input } from './form';

type TSearch = {
  buttonStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  placeholder: string;
  setQueryVariables: (data: any) => void;
};

export const Search = ({
  buttonStyle,
  containerStyle,
  inputContainerStyle,
  placeholder = 'Suche...',
  setQueryVariables
}: TSearch) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      search: ''
    }
  });

  const onSearch = async ({ search }: { search: string }) => {
    setQueryVariables((prev) => ({ ...prev, search }));
  };

  return (
    <WrapperRow>
      <Input
        containerStyle={[styles.container, containerStyle]}
        control={control}
        inputContainerStyle={[styles.inputContainer, inputContainerStyle]}
        name="search"
        placeholder={placeholder}
      />
      <TouchableOpacity onPress={handleSubmit(onSearch)} style={[styles.searchButton, buttonStyle]}>
        <Icon.Lupe color={colors.surface} size={normalize(16)} />
      </TouchableOpacity>
    </WrapperRow>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: normalize(42),
    marginRight: normalize(8)
  },
  inputContainer: {},
  searchButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(3),
    height: normalize(42),
    justifyContent: 'center',
    width: normalize(42)
  }
});
