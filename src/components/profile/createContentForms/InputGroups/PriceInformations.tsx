import React from 'react';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../../config';
import { PriceInformationFormValue } from '../../../../helpers';
import { RegularText } from '../../../Text';
import { Wrapper } from '../../../Wrapper';
import { Input } from '../../../form';

type PriceInformationsProps = {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  fields: Array<{ id: string }>;
  remove: (index: number) => void;
};

export const createDefaultPriceInformation = (): PriceInformationFormValue => ({
  description: '',
  amount: ''
});

export const PriceInformations = ({ control, errors, fields, remove }: PriceInformationsProps) => {
  return (
    <>
      {fields.map((linkField, index) => (
        <Wrapper noPaddingTop key={linkField.id}>
          <View style={styles.linkGroupHeader}>
            <RegularText>{texts.profile.forms.priceInformation.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.priceInformation.deleteButtonAccessibility}
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

          <Input
            name={`priceInformations.${index}.description`}
            label={texts.profile.forms.priceInformation.description}
            placeholder={texts.profile.forms.priceInformation.descriptionPlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`priceInformations.${index}.amount`}
            label={texts.profile.forms.priceInformation.amount}
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
