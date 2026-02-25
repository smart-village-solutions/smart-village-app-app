import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { colors, consts, Icon, texts } from '../../../config';
import { GET_CATEGORIES } from '../../../queries/categories';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Label } from '../../Label';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { DateTimeInput, DropdownInput, DropdownInputProps, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

import {
  ContactFormValue,
  Contacts,
  createDefaultContact,
  createDefaultPriceInformation,
  createDefaultWebUrl,
  PriceInformationFormValue,
  PriceInformations,
  WebUrlFormValue,
  WebUrls
} from './InputGroups';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

const renewalIntervals = [
  { value: texts.profile.forms.renewalIntervalDaily },
  { value: texts.profile.forms.renewalIntervalWeekly },
  { value: texts.profile.forms.renewalIntervalMonthly },
  { value: texts.profile.forms.renewalIntervalYearly }
] as unknown as DropdownInputProps['data'];

type EventFormValues = {
  categoryName: string;
  description: string;
  contacts: ContactFormValue[];
  endDate: Date | null;
  endTime: Date | null;
  image: string | null;
  priceInformations: PriceInformationFormValue[];
  repeat: boolean;
  repeatInterval: string;
  repeatUntilDate: Date | null;
  startDate: Date | null;
  startTime: Date | null;
  title: string;
  webUrls: WebUrlFormValue[];
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
      contacts: [],
      description: '',
      endDate: moment().toDate(),
      endTime: moment().toDate(),
      image: '[]',
      priceInformations: [],
      repeat: false,
      repeatInterval: '',
      repeatUntilDate: moment().toDate(),
      startDate: moment().toDate(),
      startTime: moment().toDate(),
      title: '',
      webUrls: []
    }
  });

  const isRepeatable = useWatch({
    control,
    name: 'repeat'
  });

  const {
    fields: webUrlsFields,
    append: appendWebUrl,
    remove: removeWebUrl
  } = useFieldArray({
    control,
    name: 'webUrls'
  });

  const {
    fields: priceInformationsFields,
    append: appendPriceInformation,
    remove: removePriceInformation
  } = useFieldArray({
    control,
    name: 'priceInformations'
  });

  const {
    fields: contactsFields,
    append: appendContact,
    remove: removeContact
  } = useFieldArray({
    control,
    name: 'contacts'
  });

  // TODO: implement event creation logic here
  const onSubmit = (formValues: EventFormValues) => {
    setIsLoading(true);
    console.log(formValues);
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
                boldLabel: true,
                control,
                data: categoryNameDropdownData,
                errors,
                label: `${texts.defectReport.categoryName} *`,
                name,
                onChange,
                placeholder: texts.defectReport.categoryName,
                required: true,
                value,
                valueKey: 'name'
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          name="title"
          label={`${texts.profile.forms.eventTitle} *`}
          placeholder={texts.profile.forms.eventTitlePlaceholder}
          autoCapitalize="none"
          validate
          rules={{
            required: texts.profile.forms.eventTitleError
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
                label: `${texts.profile.forms.startDate} *`,
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
        <Label bold>{texts.profile.forms.eventRepeatableTitle}</Label>
        <Label>{texts.profile.forms.eventRepeatableDescription}</Label>

        <Controller
          name="repeat"
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

      {isRepeatable && (
        <>
          <Wrapper noPaddingTop>
            <Input
              name="repeatInterval"
              label={`${texts.profile.forms.repeatInterval} *`}
              placeholder={texts.profile.forms.repeatIntervalPlaceholder}
              autoCapitalize="none"
              keyboardType="numeric"
              validate
              rules={{
                required: isRepeatable ? texts.profile.forms.repeatIntervalError : undefined
              }}
              errorMessage={errors.repeatInterval && errors.repeatInterval.message}
              control={control}
            />

            <Controller
              name="repeatUntilDate"
              render={({ field: { name, onChange, value } }) => (
                <DropdownInput
                  {...{
                    errors,
                    data: renewalIntervals,
                    value,
                    valueKey: 'value',
                    onChange,
                    name,
                    label: `${texts.profile.forms.renewalInterval} *`,
                    required: isRepeatable,
                    control,
                    showSearch: false
                  }}
                />
              )}
              control={control}
            />
          </Wrapper>
        </>
      )}

      <Wrapper noPaddingTop>
        <Button
          invert
          onPress={() => appendContact(createDefaultContact())}
          title={texts.profile.forms.addContact}
        />
      </Wrapper>

      <Contacts
        control={control as any}
        errors={errors as any}
        fields={contactsFields}
        remove={removeContact}
      />

      <Wrapper noPaddingTop>
        <Button
          invert
          onPress={() => appendPriceInformation(createDefaultPriceInformation())}
          title={texts.profile.forms.addPriceInformation}
        />
      </Wrapper>

      <PriceInformations
        control={control as any}
        errors={errors as any}
        fields={priceInformationsFields}
        remove={removePriceInformation}
      />

      <Wrapper noPaddingTop>
        <Button
          invert
          onPress={() => appendWebUrl(createDefaultWebUrl())}
          title={texts.profile.forms.addLinks}
        />
      </Wrapper>

      <WebUrls
        control={control as any}
        errors={errors as any}
        fields={webUrlsFields}
        remove={removeWebUrl}
      />

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
