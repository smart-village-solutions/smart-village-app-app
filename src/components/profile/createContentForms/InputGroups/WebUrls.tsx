import React from 'react';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, normalize, texts } from '../../../../config';
import { WebUrlFormValue } from '../../../../helpers';
import { useTheme } from '../../../../hooks/useTheme';
import { RegularText } from '../../../Text';
import { Wrapper, WrapperVertical } from '../../../Wrapper';
import { Input } from '../../../form';

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
  const { colors } = useTheme();

  return (
    <>
      {fields.map((linkField, index) => (
        <Wrapper noPaddingTop key={linkField.id}>
          <View style={styles.linkGroupHeader}>
            <RegularText small>{texts.profile.forms.linkGroup.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.linkGroup.deleteButtonAccessibility}
              accessibilityRole="button"
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

          <WrapperVertical>
            <Input
              name={`webUrls.${index}.url`}
              label={texts.profile.forms.linkGroup.url}
              placeholder={texts.profile.forms.linkGroup.urlPlaceholder}
              autoCapitalize="none"
              validate
              control={control}
            />
          </WrapperVertical>

          <Input
            name={`webUrls.${index}.description`}
            label={texts.profile.forms.linkGroup.description}
            placeholder={texts.profile.forms.linkGroup.descriptionPlaceholder}
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: normalize(44),
    minWidth: normalize(44)
  },
  linkGroupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
