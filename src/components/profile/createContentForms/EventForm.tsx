import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { colors, consts, Icon, texts } from '../../../config';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { DateTimeInput, DropdownInput, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';
import { LoadingSpinner } from '../../LoadingSpinner';
import { GET_CATEGORIES } from '../../../queries/categories';
import { useQuery } from 'react-apollo';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

type EventFormValues = {
  categoryName: string;
  description: string;
  endDate: Date | null;
  endTime: Date | null;
  image: string | null;
  isRepeatable: boolean;
  startDate: Date | null;
  startTime: Date | null;
  title: string;
};

export const EventForm = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: dataCategories,
    loading: loadingCategories,
    refetch: refetchCategories
  } = useQuery(GET_CATEGORIES, {
    variables: { tagList: ['event_record'] }
  });

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<EventFormValues>({
    mode: 'onBlur',
    defaultValues: {
      categoryName: '',
      description: '',
      endDate: moment().toDate(),
      endTime: moment().toDate(),
      image: '[]',
      isRepeatable: false,
      startDate: moment().toDate(),
      startTime: moment().toDate(),
      title: ''
    }
  });

  // TODO: implement event creation logic here
  const onSubmit = (formValues: EventFormValues) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (loadingCategories) {
    return <LoadingSpinner loading />;
  }

  const categoryNameDropdownData =
    dataCategories?.categories?.map((category) => ({
      id: category.id,
      name: category.name,
      value: category.name
    })) || [];

  return (
    <>
      <Wrapper noPaddingTop>
        <Controller
          name="categoryName"
          render={({ field: { name, onChange, value } }) => (
            <DropdownInput
              {...{
                errors,
                data: categoryNameDropdownData,
                value,
                valueKey: 'name',
                onChange,
                name,
                required: true,
                label: `${texts.defectReport.categoryName} *`,
                placeholder: texts.defectReport.categoryName,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          name="title"
          label={texts.profile.forms.title}
          placeholder={texts.profile.forms.titlePlaceholder}
          autoCapitalize="none"
          validate
          rules={{
            required: texts.profile.forms.titleError
          }}
          errorMessage={errors.title && errors.title.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          name="description"
          label={texts.profile.forms.description}
          placeholder={texts.profile.forms.descriptionPlaceholder}
          autoCapitalize="none"
          validate
          richText
          rules={{
            required: texts.profile.forms.descriptionError
          }}
          errorMessage={errors.description && errors.description.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Controller
          name="image"
          render={({ field }) => (
            <MultiImageSelector
              {...{
                control,
                errorType: IMAGE_SELECTOR_ERROR_TYPES.NEWS,
                field,
                // isDeletable: !isEdit, // TODO: handle deletable state for edit mode
                isMultiImages: true,
                item: {
                  buttonTitle: texts.profile.forms.addImages,
                  name: 'image'
                },
                selectorType: IMAGE_SELECTOR_TYPES.NEWS
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Controller
          name="startDate"
          render={({ field: { name, onChange, value } }) => (
            <DateTimeInput
              {...{
                boldLabel: true,
                control,
                errors,
                label: texts.profile.forms.startDate,
                mode: 'date',
                name,
                onChange,
                placeholder: texts.profile.forms.startDatePlaceholder,
                required: true,
                value
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
                boldLabel: true,
                control,
                errors,
                label: texts.profile.forms.endDate,
                mode: 'date',
                name,
                onChange,
                placeholder: texts.profile.forms.endDatePlaceholder,
                required: true,
                value
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
                boldLabel: true,
                control,
                errors,
                label: texts.profile.forms.startTime,
                mode: 'time',
                name,
                onChange,
                placeholder: texts.profile.forms.startTimePlaceholder,
                required: true,
                value
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
                boldLabel: true,
                control,
                errors,
                label: texts.profile.forms.endTime,
                mode: 'time',
                name,
                onChange,
                placeholder: texts.profile.forms.endTimePlaceholder,
                required: true,
                value
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Controller
          name="isRepeatable"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={!!value}
              checkedIcon={<Icon.SquareCheckFilled />}
              containerStyle={styles.checkboxContainerStyle}
              onPress={() => onChange(!value)}
              title={texts.profile.forms.isRepeatable}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.profile.forms.send}
          disabled={isLoading}
        />
        <Touchable onPress={() => navigation.goBack()}>
          <RegularText primary center>
            {texts.profile.forms.abort}
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
