import moment from 'moment';
import React from 'react';
import { Control, Controller, FieldErrors, FieldValues } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../../config';
import { OpeningHourFormValue } from '../../../../helpers';
import { Checkbox } from '../../../Checkbox';
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
  endTime: moment().toDate(),
  isOpen: true,
  startDate: moment().toDate(),
  startTime: moment().toDate(),
  weekday: -1
});

export const OpeningHours = ({ control, errors, fields, remove }: OpeningHoursProps) => {
  return (
    <>
      {fields.map((openingHourField, index) => (
        <Wrapper noPaddingTop key={openingHourField.id}>
          <View style={styles.openingHourGroupHeader}>
            <RegularText small>{texts.profile.forms.openingHourGroup.title}</RegularText>
            <TouchableOpacity
              accessibilityLabel={texts.profile.forms.openingHourGroup.deleteButtonAccessibility}
              onPress={() => remove(index)}
              style={styles.deleteButton}
            >
              <Icon.Trash color={colors.error} size={normalize(18)} />
            </TouchableOpacity>
          </View>

          <WrapperVertical>
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
