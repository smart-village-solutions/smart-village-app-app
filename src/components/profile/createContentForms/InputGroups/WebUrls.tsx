import React from 'react';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../../config';
import { RegularText } from '../../../Text';
import { Wrapper } from '../../../Wrapper';
import { Input } from '../../../form';

export type WebUrlFormValue = {
  description: string;
  url: string;
};

type WebUrlsProps = {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  fields: Array<{ id: string }>;
  remove: (index: number) => void;
};

export const createDefaultWebUrl = (): WebUrlFormValue => ({
  description: '',
  url: ''
});

export const WebUrls = ({ control, errors, fields, remove }: WebUrlsProps) => {
  return (
    <>
      {fields.map((linkField, index) => (
        <Wrapper noPaddingTop key={linkField.id}>
          <View style={styles.linkGroupHeader}>
            <RegularText>{texts.profile.forms.linkGroup.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.linkGroup.deleteButtonAccessibility}
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

          <Input
            name={`webUrls.${index}.description`}
            label={texts.profile.forms.linkGroup.description}
            placeholder={texts.profile.forms.linkGroup.descriptionPlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`webUrls.${index}.url`}
            label={texts.profile.forms.linkGroup.url}
            autoCapitalize="none"
            validate
            control={control}
          />
        </Wrapper>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    padding: normalize(8)
  },
  linkGroupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
