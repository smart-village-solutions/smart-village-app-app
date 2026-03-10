import moment from 'moment';
import React from 'react';
import { Control, Controller, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../../config';
import { Checkbox } from '../../../Checkbox';
import { RegularText } from '../../../Text';
import { Wrapper } from '../../../Wrapper';
import { DateTimeInput, DropdownInput, Input } from '../../../form';
import { DropdownInputProps } from '../../../form/DropdownInput';

export type OpeningHourFormValue = {
  description: string;
  endDate: Date;
  endTime: Date;
  isOpen: boolean;
  startDate: Date;
  startTime: Date;
  weekday: string;
};

type OpeningHoursProps = {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  fields: Array<{ id: string }>;
  remove: (index: number) => void;
};

const weekdays = [
  { value: texts.noticeboard.weekday.monday },
  { value: texts.noticeboard.weekday.tuesday },
  { value: texts.noticeboard.weekday.wednesday },
  { value: texts.noticeboard.weekday.thursday },
  { value: texts.noticeboard.weekday.friday },
  { value: texts.noticeboard.weekday.saturday },
  { value: texts.noticeboard.weekday.sunday }
] as unknown as DropdownInputProps['data'];

export const createDefaultOpeningHour = (): OpeningHourFormValue => ({
  description: '',
  endDate: moment().toDate(),
  endTime: moment().toDate(),
  isOpen: false,
  startDate: moment().toDate(),
  startTime: moment().toDate(),
  weekday: ''
});

export const OpeningHours = ({ control, errors, fields, remove }: OpeningHoursProps) => {
  return (
    <>
      {fields.map((openingHourField, index) => (
        <Wrapper noPaddingTop key={openingHourField.id}>
          <View style={styles.openingHourGroupHeader}>
            <RegularText>{texts.profile.forms.openingHourGroup.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.openingHourGroup.deleteButtonAccessibility}
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

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
                  required: true,
                  value
                }}
              />
            )}
            control={control}
          />

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
                  required: true,
                  value
                }}
              />
            )}
            control={control}
          />

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
                  required: true,
                  value
                }}
              />
            )}
            control={control}
          />

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
                  required: true,
                  value
                }}
              />
            )}
            control={control}
          />

          <Input
            name={`openingHours.${index}.description`}
            label={texts.profile.forms.openingHourGroup.description}
            placeholder={texts.profile.forms.openingHourGroup.descriptionPlaceholder}
            autoCapitalize="none"
            validate
            control={control}
          />

          <Controller
            name={`openingHours.${index}.weekday`}
            render={({ field: { name, onChange, value } }) => (
              <DropdownInput
                {...{
                  control,
                  data: weekdays,
                  errors,
                  label: texts.profile.forms.openingHourGroup.day,
                  name,
                  onChange,
                  placeholder: texts.profile.forms.openingHourGroup.day,
                  required: true,
                  showSearch: false,
                  value,
                  valueKey: 'value'
                }}
              />
            )}
            control={control}
          />

          <Controller
            name={`openingHours.${index}.isOpen`}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                checked={!!value}
                checkedIcon={<Icon.SquareCheckFilled />}
                containerStyle={styles.checkboxContainerStyle}
                navigate={() => undefined}
                onPress={() => onChange(!value)}
                title={texts.profile.forms.openingHourGroup.isOpen}
                uncheckedIcon={<Icon.Square color={colors.placeholder} />}
              />
            )}
            control={control}
          />
        </Wrapper>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  deleteButton: {
    padding: normalize(8)
  },
  openingHourGroupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
