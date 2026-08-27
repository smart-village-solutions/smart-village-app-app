import moment from 'moment';
import React from 'react';
import { Control, Controller, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, normalize, texts } from '../../../../config';
import { OpeningHourFormValue } from '../../../../helpers';
import { useTheme } from '../../../../hooks/useTheme';
import { Radiobutton } from '../../../Radiobutton';
import { RegularText } from '../../../Text';
import { Wrapper, WrapperVertical } from '../../../Wrapper';
import { DateTimeInput, DropdownInput, Input } from '../../../form';
import { DropdownInputProps } from '../../../form/DropdownInput';

type OpeningHoursProps = {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  fields: Array<{ id: string }>;
  remove: (index: number) => void;
};

export const weekdays = [
  { value: texts.noticeboard.weekday.monday, index: 0 },
  { value: texts.noticeboard.weekday.tuesday, index: 1 },
  { value: texts.noticeboard.weekday.wednesday, index: 2 },
  { value: texts.noticeboard.weekday.thursday, index: 3 },
  { value: texts.noticeboard.weekday.friday, index: 4 },
  { value: texts.noticeboard.weekday.saturday, index: 5 },
  { value: texts.noticeboard.weekday.sunday, index: 6 }
] as unknown as DropdownInputProps['data'];

export const createDefaultOpeningHour = (): OpeningHourFormValue => ({
  description: '',
  endDate: moment().toDate(),
  endTime: null,
  isOpen: true,
  startDate: moment().toDate(),
  startTime: null,
  weekday: -1
});

export const OpeningHours = ({ control, errors, fields, remove }: OpeningHoursProps) => {
  const { colors } = useTheme();

  return (
    <>
      {fields.map((openingHourField, index) => (
        <Wrapper noPaddingTop key={openingHourField.id}>
          <View style={styles.openingHourGroupHeader}>
            <RegularText small>{texts.profile.forms.openingHourGroup.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.openingHourGroup.deleteButtonAccessibility}
              accessibilityRole="button"
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

          <WrapperVertical noPaddingTop>
            <Controller
              name={`openingHours.${index}.isOpen`}
              render={({ field: { onChange, value } }) => {
                const isOpen = value ?? true;

                return (
                  <View>
                    <Radiobutton
                      onPress={() => onChange(true)}
                      selected={!!isOpen}
                      title={texts.profile.forms.openingHourGroup.open}
                    />
                    <Radiobutton
                      onPress={() => onChange(false)}
                      selected={!isOpen}
                      title={texts.profile.forms.openingHourGroup.closed}
                    />
                  </View>
                );
              }}
              control={control}
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Controller
              name={`openingHours.${index}.startDate`}
              render={({ field: { name, onChange, value } }) => (
                <DateTimeInput
                  {...{
                    boldLabel: true,
                    control,
                    errors,
                    label: texts.profile.forms.openingHourGroup.startDate,
                    mode: 'date',
                    name,
                    onChange,
                    placeholder: texts.profile.forms.openingHourGroup.startDate,
                    value
                  }}
                />
              )}
              control={control}
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Controller
              name={`openingHours.${index}.startTime`}
              render={({ field: { name, onChange, value } }) => (
                <DateTimeInput
                  {...{
                    boldLabel: true,
                    control,
                    errors,
                    label: texts.profile.forms.openingHourGroup.startTime,
                    mode: 'time',
                    name,
                    onChange,
                    placeholder: texts.profile.forms.openingHourGroup.startTime,
                    value
                  }}
                />
              )}
              control={control}
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Controller
              name={`openingHours.${index}.endDate`}
              render={({ field: { name, onChange, value } }) => (
                <DateTimeInput
                  {...{
                    boldLabel: true,
                    control,
                    errors,
                    label: texts.profile.forms.openingHourGroup.endDate,
                    mode: 'date',
                    name,
                    onChange,
                    placeholder: texts.profile.forms.openingHourGroup.endDate,
                    value
                  }}
                />
              )}
              control={control}
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Controller
              name={`openingHours.${index}.endTime`}
              render={({ field: { name, onChange, value } }) => (
                <DateTimeInput
                  {...{
                    boldLabel: true,
                    control,
                    errors,
                    label: texts.profile.forms.openingHourGroup.endTime,
                    mode: 'time',
                    name,
                    onChange,
                    placeholder: texts.profile.forms.openingHourGroup.endTime,
                    value
                  }}
                />
              )}
              control={control}
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Input
              name={`openingHours.${index}.description`}
              label={texts.profile.forms.openingHourGroup.description}
              placeholder={texts.profile.forms.openingHourGroup.descriptionPlaceholder}
              autoCapitalize="none"
              validate
              control={control}
            />
          </WrapperVertical>

          <WrapperVertical noPaddingTop>
            <Controller
              name={`openingHours.${index}.weekday`}
              render={({ field: { name, onChange, value } }) => (
                <DropdownInput
                  {...{
                    boldLabel: true,
                    control,
                    data: weekdays,
                    errors,
                    label: texts.profile.forms.openingHourGroup.day,
                    name,
                    onChange,
                    placeholder: texts.profile.forms.openingHourGroup.day,
                    showSearch: false,
                    value,
                    valueKey: 'index'
                  }}
                />
              )}
              control={control}
            />
          </WrapperVertical>
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
  openingHourGroupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
