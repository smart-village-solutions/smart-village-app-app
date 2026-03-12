import React from 'react';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../../config';
import { RegularText } from '../../../Text';
import { Wrapper, WrapperVertical } from '../../../Wrapper';
import { Input } from '../../../form';

export type ContactFormValue = {
  description: string;
  email: string;
  fax: string;
  firstname: string;
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
  firstname: '',
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
            <RegularText small>{texts.profile.forms.contacts.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.contacts.deleteButtonAccessibility}
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

          <WrapperVertical>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.forms.contacts.firstname}
              name={`contacts.${index}.firstname`}
              placeholder={texts.profile.forms.contacts.firstnamePlaceholder}
              validate
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.forms.contacts.surname}
              name={`contacts.${index}.surname`}
              placeholder={texts.profile.forms.contacts.surnamePlaceholder}
              validate
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Input
              autoCapitalize="none"
              control={control}
              keyboardType="email-address"
              label={texts.profile.forms.contacts.email}
              name={`contacts.${index}.email`}
              placeholder={texts.profile.forms.contacts.emailPlaceholder}
              validate
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Input
              autoCapitalize="none"
              control={control}
              keyboardType="phone-pad"
              label={texts.profile.forms.contacts.phone}
              name={`contacts.${index}.phone`}
              placeholder={texts.profile.forms.contacts.phonePlaceholder}
              validate
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Input
              autoCapitalize="none"
              control={control}
              keyboardType="phone-pad"
              label={texts.profile.forms.contacts.fax}
              name={`contacts.${index}.fax`}
              placeholder={texts.profile.forms.contacts.faxPlaceholder}
              validate
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Input
              autoCapitalize="none"
              control={control}
              keyboardType="url"
              label={texts.profile.forms.contacts.url}
              name={`contacts.${index}.url`}
              placeholder={texts.profile.forms.contacts.urlPlaceholder}
              validate
            />
          </WrapperVertical>

          <Input
            autoCapitalize="none"
            control={control}
            label={texts.profile.forms.contacts.urlText}
            name={`contacts.${index}.urlText`}
            placeholder={texts.profile.forms.contacts.urlTextPlaceholder}
            validate
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
