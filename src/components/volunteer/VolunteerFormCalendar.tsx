import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import _sortBy from 'lodash/sortBy';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useMutation, useQuery } from 'react-query';

import { colors, consts, texts } from '../../config';
import { jsonParser, momentFormat } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { calendarDelete, calendarNew, calendarUpload, groupsMy } from '../../queries/volunteer';
import { Calendar, VolunteerGroup } from '../../types';
import { Button } from '../Button';
import { DateTimeInput } from '../form/DateTimeInput';
import { DropdownInput, DropdownInputProps } from '../form/DropdownInput';
import { Input } from '../form/Input';
import { LoadingSpinner } from '../LoadingSpinner';
import { DocumentSelector, MultiImageSelector } from '../selectors';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_TYPE_REGEX, PDF_TYPE_REGEX, URL_REGEX } = consts;

const fileFilters = (fileRegex: RegExp, calendarData: Calendar) =>
  JSON.stringify(
    calendarData?.content?.files
      ?.map(({ file_name: infoText, mime_type: mimeType, url: uri, id: fileId }) => {
        const isFile = fileRegex.test(infoText);

        if (isFile) {
          return { entryId: calendarData?.id, fileId, infoText, mimeType, uri };
        }

        return null;
      })
      ?.filter((otherFiles) => otherFiles != null)
  );

const filerParseAndUpload = (calendarNewData: Calendar, id: number) => {
  const images = jsonParser(calendarNewData.images);
  const documents = jsonParser(calendarNewData.documents);
  const uris: { uri: string; mimeType: string }[] = [];

  if (images?.length) {
    images.forEach(({ uri, mimeType }: { uri: string; mimeType: string }) => {
      uris.push({ uri, mimeType });
    });
  }

  if (documents?.length) {
    documents.forEach(({ uri, mimeType }: { uri: string; mimeType: string }) => {
      uris.push({ uri, mimeType });
    });
  }

  /* foreach loop to upload each file after the event has been created */
  uris.forEach(async ({ uri, mimeType }) => {
    try {
      const isURL = URL_REGEX.test(uri);

      if (isURL) return;

      await calendarUpload(uri, id, mimeType);
    } catch (error) {
      console.error(error);
    }
  });
};

const deleteCalendarAlert = (onPress: () => Promise<void>) =>
  Alert.alert('Hinweis', 'Möchten Sie das Event löschen?', [
    { text: texts.volunteer.abort, style: 'cancel' },
    { text: texts.volunteer.delete, onPress, style: 'destructive' }
  ]);

// eslint-disable-next-line complexity
export const VolunteerFormCalendar = ({
  navigation,
  route,
  scrollToTop,
  groupId
}: StackScreenProps<any> & { scrollToTop: () => void; groupId?: number }) => {
  const calendarData = route.params?.calendarData as Calendar;
  const isEditMode = !!calendarData; // edit mode if there exists some calendar data

  const appointments = {
    dateFrom: calendarData?.start_datetime
      ? new Date(momentFormat(calendarData.start_datetime, 'YYYY-MM-DD'))
      : undefined,
    dateTo: calendarData?.end_datetime
      ? new Date(momentFormat(calendarData.end_datetime, 'YYYY-MM-DD'))
      : undefined,
    timeFrom: calendarData?.start_datetime
      ? new Date(momentFormat(calendarData.start_datetime, 'YYYY-MM-DDTHH:mm:ss'))
      : undefined,
    timeTo: calendarData?.end_datetime
      ? new Date(momentFormat(calendarData.end_datetime, 'YYYY-MM-DDTHH:mm:ss'))
      : undefined
  };

  const {
    control,
    formState: { errors, isValid },
    handleSubmit
  } = useForm<Calendar>({
    mode: 'onBlur',
    defaultValues: {
      isPublic: calendarData?.isPublic || 0,
      calendarId: calendarData?.id || '',
      contentContainerId: groupId || '',
      title: calendarData?.title || '',
      startDate: appointments.dateFrom,
      startTime: appointments.timeFrom,
      endDate: appointments.dateTo,
      endTime: appointments.timeTo,
      description: calendarData?.description || '',
      participantInfo: calendarData?.participant_info || '',
      entranceFee: '',
      location: '',
      topics: calendarData?.content?.topics.map(({ name }) => name).toString() || '',
      documents: calendarData?.content?.files?.length
        ? fileFilters(PDF_TYPE_REGEX, calendarData)
        : '[]',
      images: calendarData?.content?.files?.length
        ? fileFilters(IMAGE_TYPE_REGEX, calendarData)
        : '[]'
    }
  });
  const {
    data: dataGroupsMy,
    isLoading: isLoadingGroupsMy,
    isSuccess: isSuccessGroupsMy,
    refetch: refetchGroupsMy,
    isRefetching: isRefetchingGroupsMy
  } = useQuery(QUERY_TYPES.VOLUNTEER.GROUPS_MY, groupsMy);
  const [groupDropdownData, setGroupDropdownData] = useState<DropdownInputProps['data'] | []>();
  const [isProcessingGroupDropdownData, setIsProcessingGroupDropdownData] = useState(true);

  const filterGroupDropDownData = useCallback(async () => {
    setIsProcessingGroupDropdownData(true);
    if (dataGroupsMy?.results?.length) {
      const filteredGroupDropDownData = dataGroupsMy.results.map((item: VolunteerGroup) => ({
        ...item,
        value: item.name
      }));

      setGroupDropdownData(
        _sortBy(filteredGroupDropDownData, 'name') as DropdownInputProps['data'] | []
      );
    }
    setIsProcessingGroupDropdownData(false);
  }, [dataGroupsMy]);

  useFocusEffect(
    useCallback(() => {
      refetchGroupsMy();
    }, [])
  );

  useEffect(() => {
    !isRefetchingGroupsMy &&
      setTimeout(() => {
        filterGroupDropDownData();
      }, 300);
  }, [isRefetchingGroupsMy, filterGroupDropDownData]);

  const isFocused = useIsFocused();

  const { mutateAsync, isLoading, isError, isSuccess, data, reset } = useMutation(calendarNew);

  const onSubmit = async (calendarNewData: Calendar) => {
    mutateAsync(calendarNewData).then(async ({ id }: { id: number }) => {
      if (id) filerParseAndUpload(calendarNewData, id);
    });
  };

  const onCalendarDelete = async () => {
    try {
      await calendarDelete(calendarData?.id);
      navigation.pop(2);
      Alert.alert('Erfolgreich', 'Das Event wurde erfolgreich gelöscht.');
    } catch (error) {
      Alert.alert('Fehler beim Löschen des Events', 'Bitte versuchen Sie es noch einmal.');
      console.error(error);
    }
  };

  if (!isValid) {
    scrollToTop();
  }

  if (isLoadingGroupsMy || isProcessingGroupDropdownData) {
    return <LoadingSpinner loading />;
  }

  if (!isSuccessGroupsMy && groupDropdownData !== undefined && !groupDropdownData.length) {
    return (
      <Wrapper>
        <RegularText>{texts.volunteer.noGroups}</RegularText>
      </Wrapper>
    );
  }

  if (isError || (!isLoading && data && !data.id)) {
    Alert.alert(
      isEditMode ? 'Fehler beim Aktualisieren eines Events' : 'Fehler beim Erstellen eines Events',
      'Bitte Eingaben überprüfen und erneut versuchen.'
    );
    reset();
  } else if (isSuccess && isFocused) {
    navigation.goBack();

    Alert.alert(
      'Erfolgreich',
      isEditMode
        ? 'Das Event wurde erfolgreich aktualisiert.'
        : 'Das Event wurde erfolgreich erstellt.'
    );
  }

  return (
    <>
      <Wrapper>
        <Input hidden name="calendarId" control={control} />
        {!!groupId || isEditMode ? (
          <Input hidden name="contentContainerId" control={control} />
        ) : (
          groupDropdownData?.length && (
            <Controller
              name="contentContainerId"
              render={({ field: { name, onChange, value } }) => (
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
          )
        )}
      </Wrapper>
      <Wrapper noPaddingTop>
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
      <Wrapper noPaddingTop>
        <Controller
          name="startDate"
          render={({ field: { name, onChange, value } }) => (
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
      <Wrapper noPaddingTop>
        <Controller
          name="startTime"
          render={({ field: { name, onChange, value } }) => (
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
      <Wrapper noPaddingTop>
        <Controller
          name="endDate"
          render={({ field: { name, onChange, value } }) => (
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
      <Wrapper noPaddingTop>
        <Controller
          name="endTime"
          render={({ field: { name, onChange, value } }) => (
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
      <Wrapper noPaddingTop>
        <Input
          name="location"
          label={texts.volunteer.location}
          placeholder={texts.volunteer.location}
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper noPaddingTop>
        <Input
          name="description"
          label={texts.volunteer.description}
          placeholder={texts.volunteer.description}
          multiline
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper noPaddingTop>
        <Input
          name="participantInfo"
          label={texts.volunteer.participantInfo}
          placeholder={texts.volunteer.participantInfo}
          multiline
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper noPaddingTop>
        <Input
          name="topics"
          label={texts.volunteer.topics}
          placeholder={texts.volunteer.topics}
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper noPaddingTop>
        <Controller
          name="isPublic"
          render={({ field: { onChange, value } }) => (
            <CheckBox
              accessibilityRole="button"
              checked={!!value}
              onPress={() => onChange(!value)}
              title="Öffentlich"
              checkedColor={colors.accent}
              checkedIcon="check-square-o"
              uncheckedColor={colors.darkText}
              uncheckedIcon="square-o"
              containerStyle={styles.checkboxContainerStyle}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper noPaddingTop>
        <Controller
          name="images"
          render={({ field }) => (
            <MultiImageSelector
              {...{
                control,
                errorType: IMAGE_SELECTOR_ERROR_TYPES.VOLUNTEER,
                field,
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
          render={({ field }) => (
            <DocumentSelector
              {...{
                control,
                field,
                isVolunteer: true,
                maxFileSize: '10485760',
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
      <Wrapper noPaddingTop>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.volunteer.save}
          disabled={isLoading}
        />
        {isEditMode && (
          <Button
            onPress={() => deleteCalendarAlert(onCalendarDelete)}
            title={texts.volunteer.delete}
          />
        )}
        <Touchable onPress={() => navigation.goBack()}>
          <RegularText primary center>
            {texts.volunteer.abort}
          </RegularText>
        </Touchable>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  }
});
