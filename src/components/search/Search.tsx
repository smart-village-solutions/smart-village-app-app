import React from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { Icon, colors, consts, normalize, texts } from '../../config';
import { WrapperRow } from '../Wrapper';
import { Input } from '../form';

const { a11yLabel } = consts;

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
    Keyboard.dismiss();

    setQueryVariables((prev) => ({ ...prev, search }));
  };

  return (
    <WrapperRow>
      <Input
        clearButtonMode="while-editing"
        containerStyle={[styles.container, containerStyle]}
        control={control}
        inputContainerStyle={[styles.inputContainer, inputContainerStyle]}
        name="search"
        onSubmitEditing={handleSubmit(onSearch)}
        placeholder={placeholder}
      />
      <TouchableOpacity
        accessibilityLabel={`${texts.components.search} ${a11yLabel.button}`}
        onPress={handleSubmit(onSearch)}
        style={[styles.searchButton, buttonStyle]}
      >
        <Icon.Lupe color={colors.surface} size={normalize(24)} />
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
  inputContainer: {
    height: normalize(52)
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(3),
    height: normalize(52),
    justifyContent: 'center',
    width: normalize(52)
  }
});
