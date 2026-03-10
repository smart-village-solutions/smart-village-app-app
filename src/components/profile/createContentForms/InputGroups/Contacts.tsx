import React from 'react';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../../config';
import { RegularText } from '../../../Text';
import { Wrapper } from '../../../Wrapper';
import { Input } from '../../../form';

export type ContactFormValue = {
  description: string;
  email: string;
  fax: string;
  name: string;
  phone: string;
  surname: string;
  url: string;
  urlText: string;
};

type ContactsProps = {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  fields: Array<{ id: string }>;
  remove: (index: number) => void;
};

export const createDefaultContact = (): ContactFormValue => ({
  description: '',
  email: '',
  fax: '',
  name: '',
  phone: '',
  surname: '',
  url: '',
  urlText: ''
});

export const Contacts = ({ control, errors, fields, remove }: ContactsProps) => {
  return (
    <>
      {fields.map((linkField, index) => (
        <Wrapper noPaddingTop key={linkField.id}>
          <View style={styles.linkGroupHeader}>
            <RegularText>{texts.profile.forms.contacts.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.contacts.deleteButtonAccessibility}
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

          <Input
            name={`contacts.${index}.name`}
            label={texts.profile.forms.contacts.name}
            placeholder={texts.profile.forms.contacts.namePlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`contacts.${index}.surname`}
            label={texts.profile.forms.contacts.surname}
            placeholder={texts.profile.forms.contacts.surnamePlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`contacts.${index}.email`}
            label={texts.profile.forms.contacts.email}
            placeholder={texts.profile.forms.contacts.emailPlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`contacts.${index}.phone`}
            label={texts.profile.forms.contacts.phone}
            placeholder={texts.profile.forms.contacts.phonePlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`contacts.${index}.fax`}
            label={texts.profile.forms.contacts.fax}
            placeholder={texts.profile.forms.contacts.faxPlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`contacts.${index}.url`}
            label={texts.profile.forms.contacts.url}
            placeholder={texts.profile.forms.contacts.urlPlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Input
            name={`contacts.${index}.urlText`}
            label={texts.profile.forms.contacts.urlText}
            placeholder={texts.profile.forms.contacts.urlTextPlaceholder}
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
