import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import _sortBy from 'lodash/sortBy';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation as useMainserverMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useMutation, useQuery } from 'react-query';

import { colors, texts } from '../../config';
import { isOwner, jsonParser, volunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { CREATE_EVENT_RECORDS } from '../../queries/eventRecords';
import { calendarNew, calendarUpload, groups } from '../../queries/volunteer';
import { VolunteerCalendar, VolunteerGroup } from '../../types';
import { Button } from '../Button';
import { DocumentSelector, ImageSelector } from '../consul/selectors';
import { DateTimeInput } from '../form/DateTimeInput';
import { DropdownInput, DropdownInputProps } from '../form/DropdownInput';
import { Input } from '../form/Input';
import { LoadingSpinner } from '../LoadingSpinner';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

// eslint-disable-next-line complexity
export const VolunteerFormCalendar = ({
  navigation,
  scrollToTop,
  groupId
}: StackScreenProps<any> & { scrollToTop: () => void; groupId?: number }) => {
  const {
    control,
    formState: { errors, isValid },
    handleSubmit
  } = useForm<VolunteerCalendar>({
    mode: 'onBlur',
    defaultValues: {
      isPublic: 1,
      contentContainerId: groupId || 0,
      documents: '[]',
      images: '[]'
    }
  });
  const { data: dataGroups, isLoading: isLoadingGroups } = useQuery(
    QUERY_TYPES.VOLUNTEER.GROUPS,
    groups
  );
  const [groupDropdownData, setGroupDropdownData] = useState<DropdownInputProps['data'] | []>([]);
  const [isProcessingGroupDropdownData, setIsProcessingGroupDropdownData] = useState(true);

  const filterGroupDropDownData = useCallback(async () => {
    setIsProcessingGroupDropdownData(true);
    if (dataGroups?.results?.length) {
      const { currentUserId } = await volunteerUserData();
      // show only groups, where the user is owner, because otherwise edits are not allowed
      const filteredGroupDropDownData = dataGroups.results
        ?.filter((item: VolunteerGroup) => isOwner(currentUserId, item.owner))
        ?.map((item: VolunteerGroup) => ({ ...item, value: item.name }));

      filteredGroupDropDownData?.length &&
        setGroupDropdownData(
          _sortBy(filteredGroupDropDownData, 'name') as DropdownInputProps['data'] | []
        );
    }
    setIsProcessingGroupDropdownData(false);
  }, [dataGroups?.results]);

  useEffect(() => {
    filterGroupDropDownData();
  }, [filterGroupDropDownData]);

  const isFocused = useIsFocused();

  const { mutateAsync, isLoading, isError, isSuccess, data, reset } = useMutation(calendarNew);
  const [createEvent] = useMainserverMutation(CREATE_EVENT_RECORDS);
  const onSubmit = async (calendarNewData: VolunteerCalendar) => {
    mutateAsync(calendarNewData).then(async ({ id }) => {
      if (id) {
        const images = jsonParser(calendarNewData.images);
        const documents = jsonParser(calendarNewData.documents);
        const uris: { uri: StringConstructor; mimeType: StringConstructor }[] = [];

        if (images?.length) {
          images.forEach(({ uri = String, mimeType = String }) => {
            uris.push({ uri, mimeType });
          });
        }

        if (documents?.length) {
          documents.forEach(({ uri = String, mimeType = String }) => {
            uris.push({ uri, mimeType });
          });
        }

        /* foreach loop to upload each file after the event has been created */
        uris.forEach(async ({ uri, mimeType }) => {
          try {
            await calendarUpload(uri, id, mimeType);
          } catch (error) {
            console.error(error);
          }
        });
      }
    });

    // mutate(calendarNewData);

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

  if (!isValid) {
    scrollToTop();
  }

  if (isLoadingGroups || isProcessingGroupDropdownData) {
    return <LoadingSpinner loading />;
  }

  if (!groupDropdownData.length) {
    return (
      <Wrapper>
        <RegularText>{texts.volunteer.noGroups}</RegularText>
      </Wrapper>
    );
  }

  if (isError || (!isLoading && data && !data.id)) {
    Alert.alert(
      'Fehler beim Erstellen eines Events',
      'Bitte Eingaben überprüfen und erneut versuchen.'
    );
    reset();
  } else if (isSuccess && isFocused) {
    navigation.goBack();

    Alert.alert('Erfolgreich', 'Das Event wurde erfolgreich erstellt.');
  }

  return (
    <>
      <Wrapper>
        <Controller
          name="contentContainerId"
          render={({ name, onChange, value }) => (
            <DropdownInput
              {...{
                errors,
                required: true,
                data: groupDropdownData,
                value,
                valueKey: 'contentcontainer_id',
                onChange,
                name,
                label: texts.volunteer.group,
                placeholder: texts.volunteer.group,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
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
          render={({ name, onChange, value }) => (
            <DateTimeInput
              {...{
                mode: 'date',
                errors,
                required: true,
                value,
                onChange,
                name,
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
          render={({ name, onChange, value }) => (
            <DateTimeInput
              {...{
                errors,
                value,
                onChange,
                name,
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
          render={({ name, onChange, value }) => (
            <DateTimeInput
              {...{
                mode: 'date',
                errors,
                required: true,
                value,
                onChange,
                name,
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
          render={({ name, onChange, value }) => (
            <DateTimeInput
              {...{
                errors,
                value,
                onChange,
                name,
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
          name="isPublic"
          render={({ onChange, value }) => (
            <CheckBox
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
          name="organizer"
          label={texts.volunteer.organizer}
          placeholder={texts.volunteer.organizer}
          multiline
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="entranceFee"
          label={texts.volunteer.entranceFee}
          placeholder={texts.volunteer.entranceFee}
          multiline
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="participantInfo"
          label={texts.volunteer.participantInfo}
          placeholder={texts.volunteer.participantInfo}
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
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper>
        <Controller
          name="images"
          render={(field) => (
            <ImageSelector
              {...{
                control,
                field,
                isVolunteer: true,
                item: {
                  name: 'images',
                  label: texts.volunteer.images,
                  buttonTitle: texts.volunteer.addImage
                }
              }}
            />
          )}
          control={control}
        />
        <Controller
          name="documents"
          render={(field) => (
            <DocumentSelector
              {...{
                control,
                field,
                isVolunteer: true,
                item: {
                  name: 'documents',
                  label: texts.volunteer.documents,
                  buttonTitle: texts.volunteer.addDocument
                }
              }}
            />
          )}
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
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  }
});
