import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import _sortBy from 'lodash/sortBy';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation as useMainserverMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useMutation, useQuery } from 'react-query';

import { colors, consts, texts } from '../../config';
import { isOwner, jsonParser, momentFormat, volunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { CREATE_EVENT_RECORDS } from '../../queries/eventRecords';
import { calendarDelete, calendarNew, calendarUpload, groups } from '../../queries/volunteer';
import { ScreenName, VolunteerCalendar, VolunteerGroup } from '../../types';
import { Button } from '../Button';
import { DocumentSelector, ImageSelector } from '../consul/selectors';
import { DateTimeInput } from '../form/DateTimeInput';
import { DropdownInput, DropdownInputProps } from '../form/DropdownInput';
import { Input } from '../form/Input';
import { LoadingSpinner } from '../LoadingSpinner';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

const { IMAGE_TYPE_REGEX, PDF_TYPE_REGEX, URL_REGEX } = consts;

const deleteCalendarAlert = (onPress: () => Promise<void>) =>
  Alert.alert('Hinweis', 'Möchten Sie das Event löschen?', [
    { text: 'Abbrechen', style: 'cancel' },
    { text: 'Löschen', onPress, style: 'destructive' }
  ]);

// eslint-disable-next-line complexity
export const VolunteerFormCalendar = ({
  navigation,
  route,
  scrollToTop,
  groupId
}: StackScreenProps<any> & { scrollToTop: () => void; groupId?: number }) => {
  const calendarData = route.params?.calendarData ?? '';

  const appointments = {
    dateFrom: new Date(momentFormat(calendarData?.start_datetime, 'YYYY-MM-DD')),
    dateTo: new Date(momentFormat(calendarData?.end_datetime, 'YYYY-MM-DD')),
    timeFrom: new Date(momentFormat(calendarData?.start_datetime, '')),
    timeTo: new Date(momentFormat(calendarData?.end_datetime, ''))
  };

  const {
    control,
    formState: { errors, isValid },
    handleSubmit
  } = useForm<VolunteerCalendar>({
    mode: 'onBlur',
    defaultValues: {
      isPublic: 0,
      calendarId: calendarData?.id || '',
      title: calendarData?.title || '',
      startDate: calendarData?.start_datetime ? appointments?.dateFrom : undefined,
      startTime: calendarData?.start_datetime ? appointments?.timeFrom : undefined,
      endDate: calendarData?.end_datetime ? appointments?.dateTo : undefined,
      endTime: calendarData?.end_datetime ? appointments?.timeTo : undefined,
      description: calendarData?.description || '',
      participantInfo: calendarData?.participant_info || '',
      entranceFee: '',
      location: '',
      topics: calendarData?.content?.topics.map(({ name }: any) => name).toString() || [],
      contentContainerId: groupId || 0,
      documents: calendarData?.content?.files?.length
        ? fileFilters(PDF_TYPE_REGEX, calendarData)
        : '[]',
      images: calendarData?.content?.files?.length
        ? fileFilters(IMAGE_TYPE_REGEX, calendarData)
        : '[]'
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
      if (id) filerParseAndUpload(calendarNewData, id);
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

  const onCalendarDelete = async () => {
    try {
      await calendarDelete(calendarData?.id);
      navigation.navigate(ScreenName.VolunteerHome);

      Alert.alert('Erfolgreich', 'Das Event wurde erfolgreich gelöscht.');
    } catch (error) {
      Alert.alert('Fehler beim Löschen des Events', 'Bitte versuchen Sie es noch einmal.');
      console.error(error);
    }
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
        <Input hidden name="calendarId" control={control} />
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
              checkedColor={colors.accent}
              checkedIcon="check-square-o"
              uncheckedColor={colors.darkText}
              uncheckedIcon="square-o"
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
        {!!calendarData && (
          <Button
            disabled={isLoading}
            invert
            onPress={() => deleteCalendarAlert(onCalendarDelete)}
            title={texts.volunteer.delete}
          />
        )}
        <Touchable onPress={() => navigation.goBack()}>
          <BoldText center primary underline>
            {texts.volunteer.abort.toUpperCase()}
          </BoldText>
        </Touchable>
      </Wrapper>
    </>
  );
};

const fileFilters = (
  fileRegex: any,
  calendarData: {
    id: number;
    content: { files: any[] };
  }
) =>
  JSON.stringify(
    calendarData?.content?.files
      .map(({ file_name: infoText, mime_type: mimeType, url: uri, id: fileId }: any) => {
        const isFile = fileRegex.test(infoText);

        if (isFile) return { entryId: calendarData?.id, fileId, infoText, mimeType, uri };
        else return;
      })
      .filter((otherFiles: any) => otherFiles != null)
  );

const filerParseAndUpload = (calendarNewData: VolunteerCalendar, id: number) => {
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
  uris.forEach(async ({ uri, mimeType }: any) => {
    try {
      const isURL = URL_REGEX.test(uri);
      if (isURL) return;

      await calendarUpload(uri, id, mimeType);
    } catch (error) {
      console.error(error);
    }
  });
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
