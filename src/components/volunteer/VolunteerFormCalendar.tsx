import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';
import { useMutation as useMainserverMutation } from 'react-apollo';
import { CheckBox } from 'react-native-elements';

import { colors, texts } from '../../config';
import { calendarNewMutation } from '../../queries/volunteer';
import { VolunteerCalendar } from '../../types';
import { Button } from '../Button';
import { Input } from '../form/Input';
import { DateTimeInput } from '../form/DateTimeInput';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';
import { CREATE_EVENT_RECORDS } from '../../queries/eventRecords';

export const VolunteerFormCalendar = ({ navigation }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<VolunteerCalendar>({
    defaultValues: {
      allDay: 1,
      isPublic: 0,
      topics: [1]
    }
  });
  const { mutate, isLoading, isError, isSuccess, data, reset } = useMutation(calendarNewMutation);
  const [createEvent] = useMainserverMutation(CREATE_EVENT_RECORDS);
  const onSubmit = (calendarNewData: VolunteerCalendar) => {
    mutate(calendarNewData);

    /**
     * TODO: create event on main-server
     *       - this needs correct logics with checks if mutation works or errors
     *       - a correct data provider needs to be used instead of the mobile-app account
     */
    //
    // createEvent({
    //   variables: {
    //     title: calendarNewData.title,
    //     categoryName: 'test',
    //     city: calendarNewData.location,
    //     description: calendarNewData.description,
    //     dateStart: calendarNewData.startDate,
    //     dateEnd: calendarNewData.endDate,
    //     timeStart: calendarNewData.startTime,
    //     timeEnd: calendarNewData.endTime
    //   }
    // });
  };

  if (isError || (!isLoading && data && !data.id)) {
    Alert.alert('Fehler beim Login', 'Bitte Eingaben überprüfen und erneut versuchen.');
    reset();
  } else if (isSuccess) {
    // refreshUser param causes the home screen to update and no longer show the welcome component
    // navigation.navigate(ScreenName.VolunteerHome, { refreshUser: new Date().valueOf() });

    navigation.goBack();
  }

  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="title"
          label={texts.volunteer.title}
          placeholder={texts.volunteer.title}
          validate
          rules={{ required: true }}
          errorMessage={errors.title && `${texts.volunteer.title} muss ausgefüllt werden`}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="startDate"
          render={({ field: { onChange, value } }) => (
            <DateTimeInput
              {...{
                mode: 'date',
                errors,
                required: true,
                value,
                onChange,
                name: 'startDate',
                label: texts.volunteer.startDate,
                placeholder: texts.volunteer.startDate,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="startTime"
          render={({ field: { onChange, value } }) => (
            <DateTimeInput
              {...{
                errors,
                value,
                onChange,
                name: 'startTime',
                label: texts.volunteer.startTime,
                placeholder: texts.volunteer.startTime,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="endDate"
          render={({ field: { onChange, value } }) => (
            <DateTimeInput
              {...{
                mode: 'date',
                errors,
                value,
                onChange,
                name: 'endDate',
                label: texts.volunteer.endDate,
                placeholder: texts.volunteer.endDate,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="endTime"
          render={({ field: { onChange, value } }) => (
            <DateTimeInput
              {...{
                errors,
                value,
                onChange,
                name: 'endTime',
                label: texts.volunteer.endTime,
                placeholder: texts.volunteer.endTime,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="allDay"
          defaultValue={1}
          render={({ field: { onChange, value } }) => (
            <CheckBox
              accessibilityRole="checkbox"
              checked={!!value}
              onPress={() => onChange(!value)}
              title="Ganztägig"
              uncheckedColor={colors.darkText}
              checkedColor={colors.primary}
              containerStyle={styles.checkboxContainerStyle}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="isPublic"
          defaultValue={0}
          render={({ field: { onChange, value } }) => (
            <CheckBox
              accessibilityRole="checkbox"
              checked={!!value}
              onPress={() => onChange(!value)}
              title="Öffentlich"
              uncheckedColor={colors.darkText}
              checkedColor={colors.primary}
              containerStyle={styles.checkboxContainerStyle}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="description"
          label={texts.volunteer.description}
          placeholder={texts.volunteer.description}
          multiline
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="location"
          label={texts.volunteer.location}
          placeholder={texts.volunteer.location}
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="topics"
          label={texts.volunteer.topics}
          placeholder={texts.volunteer.topics}
          defaultValue="test"
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.volunteer.save}
          disabled={isLoading}
        />
        <Touchable onPress={() => navigation.goBack()}>
          <BoldText center primary underline>
            {texts.volunteer.abort.toUpperCase()}
          </BoldText>
        </Touchable>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  },
  checkboxContainerStyle: {
    backgroundColor: colors.lightestText,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  }
});
