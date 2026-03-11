import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';

import { colors, consts, device, Icon, normalize, texts } from '../../../config';
import {
  buildAddressData,
  buildContactsData,
  buildDate,
  buildPriceInformations,
  buildWebUrls,
  uploadImages
} from '../../../helpers';
import { GET_CATEGORIES } from '../../../queries/categories';
import { CREATE_EVENT_RECORDS } from '../../../queries/eventRecords';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Label } from '../../Label';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { DateTimeInput, DropdownInput, DropdownInputProps, Input } from '../../form';
import { MapLibre } from '../../map';
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
  WebUrls,
  weekdays
} from './InputGroups';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

const recurringIntervals = [
  { value: texts.profile.forms.renewalIntervalDaily, index: '0' },
  { value: texts.profile.forms.renewalIntervalWeekly, index: '1' },
  { value: texts.profile.forms.renewalIntervalMonthly, index: '2' },
  { value: texts.profile.forms.renewalIntervalYearly, index: '3' }
] as unknown as DropdownInputProps['data'];

type EventFormValues = {
  categories: string;
  city: string;
  contacts: ContactFormValue[];
  description: string;
  endDate: Date | null;
  endTime: Date | null;
  image: string | null;
  latitude: number | null;
  location: string;
  longitude: number | null;
  postcode: string;
  priceInformations: PriceInformationFormValue[];
  recurring: boolean;
  recurringInterval: string;
  recurringType: string;
  recurringWeekdays: number[];
  regionName: string;
  startDate: Date | null;
  startTime: Date | null;
  street: string;
  title: string;
  urls: WebUrlFormValue[];
};

/* eslint-disable complexity */
export const EventForm = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
    handleSubmit,
    setValue
  } = useForm<EventFormValues>({
    mode: 'onBlur',
    defaultValues: {
      categories: '[]',
      city: '',
      contacts: [],
      description: '',
      endDate: moment().toDate(),
      endTime: moment().toDate(),
      image: '[]',
      latitude: null,
      location: '',
      longitude: null,
      postcode: '',
      priceInformations: [],
      recurring: false,
      recurringInterval: '',
      recurringType: '',
      recurringWeekdays: [],
      regionName: '',
      startDate: moment().toDate(),
      startTime: moment().toDate(),
      street: '',
      title: '',
      urls: []
    }
  });

  const isRecurring = useWatch({
    control,
    name: 'recurring'
  });

  const recurringType = useWatch({
    control,
    name: 'recurringType'
  });

  const recurringWeekdays = useWatch({
    control,
    name: 'recurringWeekdays'
  });

  const {
    fields: webUrlsFields,
    append: appendWebUrl,
    remove: removeWebUrl
  } = useFieldArray({
    control,
    name: 'urls'
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

  const [createEventRecord, { loading }] = useMutation(CREATE_EVENT_RECORDS);

  const onSubmit = async (formValues: EventFormValues) => {
    setIsLoading(true);

    try {
      const result = await uploadImages(formValues.image ?? '[]');

      if (result.uploadError) {
        setIsLoading(false);
        Alert.alert(
          texts.profile.forms.contentImageUploadErrorAlertTitle,
          texts.profile.forms.contentImageUploadErrorAlertMessage
        );
        return;
      }

      const { imageUrls } = result;
      const dates = buildDate(formValues);
      const contacts = buildContactsData(formValues.contacts);
      const webUrls = buildWebUrls(formValues.urls);
      const priceInformations = buildPriceInformations(formValues.priceInformations);

      await createEventRecord({
        variables: {
          addresses: [buildAddressData(formValues)],
          categories: formValues.categories.map((name: string) => ({ name })),
          dates,
          title: formValues.title,
          recurring: formValues.recurring ? '1' : '0',
          ...(formValues.recurring && { recurringInterval: formValues.recurringInterval }),
          ...(formValues.recurring && { recurringType: formValues.recurringType }),
          ...(formValues.recurring &&
            !!formValues.recurringWeekdays.length && {
              recurringWeekdays: formValues.recurringWeekdays.map((day) => day.toString())
            }),
          ...(formValues.description && { description: formValues.description }),
          ...(imageUrls.length && { mediaContents: imageUrls }),
          ...(webUrls.length && { urls: webUrls }),
          ...(priceInformations.length && { priceInformations }),
          ...(contacts && { contacts })
        }
      });

      navigation.goBack();
      Alert.alert(
        texts.profile.forms.contentCreateSuccessAlertTitle,
        texts.profile.forms.contentCreateSuccessAlertMessage
      );
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
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
          name="categories"
          render={({ field: { name, onChange, value } }) => (
            <DropdownInput
              {...{
                boldLabel: true,
                control,
                data: categoryNameDropdownData,
                errors,
                label: `${texts.defectReport.categoryName} *`,
                multipleSelect: true,
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
        <Label bold>{texts.profile.forms.eventLocation}</Label>

        <Controller
          name="location"
          render={({ field: { onChange, value } }) => (
            <MapLibre
              locations={[]}
              mapCenterPosition={selectedPosition}
              mapStyle={styles.map}
              onMapPress={({ geometry }) => {
                const coordinate = {
                  latitude: geometry?.coordinates[1],
                  longitude: geometry?.coordinates[0]
                };

                setSelectedPosition(coordinate);
                setValue('latitude', coordinate.latitude);
                setValue('longitude', coordinate.longitude);

                return { isLocationSelectable: true };
              }}
              selectedPosition={selectedPosition}
              setPinEnabled
              setOwnLocation
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          name="regionName"
          label={texts.profile.forms.regionName}
          placeholder={texts.profile.forms.regionNamePlaceholder}
          autoCapitalize="none"
          validate
          errorMessage={errors.regionName && errors.regionName.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          name="street"
          label={texts.profile.forms.street}
          placeholder={texts.profile.forms.streetPlaceholder}
          autoCapitalize="none"
          validate
          errorMessage={errors.street && errors.street.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          name="postcode"
          label={texts.profile.forms.postcode}
          placeholder={texts.profile.forms.postcodePlaceholder}
          autoCapitalize="none"
          validate
          errorMessage={errors.postcode && errors.postcode.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          name="city"
          label={texts.profile.forms.city}
          placeholder={texts.profile.forms.cityPlaceholder}
          autoCapitalize="none"
          validate
          errorMessage={errors.city && errors.city.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Label bold>{texts.profile.forms.eventRepeatableTitle}</Label>
        <Label>{texts.profile.forms.eventRepeatableDescription}</Label>

        <Controller
          name="recurring"
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

      {isRecurring && (
        <>
          <Wrapper noPaddingTop>
            <Input
              name="recurringInterval"
              label={`${texts.profile.forms.repeatInterval} *`}
              placeholder={texts.profile.forms.repeatIntervalPlaceholder}
              autoCapitalize="none"
              keyboardType="numeric"
              validate
              rules={{
                required: isRecurring ? texts.profile.forms.repeatIntervalError : undefined
              }}
              errorMessage={errors.recurringInterval && errors.recurringInterval.message}
              control={control}
            />

            <Controller
              name="recurringType"
              render={({ field: { name, onChange, value } }) => (
                <DropdownInput
                  {...{
                    control,
                    data: recurringIntervals,
                    errors,
                    label: `${texts.profile.forms.renewalInterval} *`,
                    name,
                    onChange,
                    placeholder: texts.profile.forms.renewalIntervalPlaceholder,
                    required: isRecurring,
                    showSearch: false,
                    value,
                    valueKey: 'index'
                  }}
                />
              )}
              control={control}
            />
          </Wrapper>

          {recurringType === '1' &&
            weekdays.map((item, index) => (
              <Wrapper noPaddingTop key={index}>
                <Checkbox
                  checked={recurringWeekdays?.includes(index) ?? false}
                  checkedIcon={<Icon.SquareCheckFilled />}
                  containerStyle={styles.checkboxContainerStyle}
                  onPress={() => {
                    const current = recurringWeekdays ?? [];
                    const updated = current.includes(index)
                      ? current.filter((day) => day !== index)
                      : [...current, index].sort((a, b) => a - b);

                    setValue('recurringWeekdays', updated);
                  }}
                  title={item.value}
                  uncheckedIcon={<Icon.Square color={colors.placeholder} />}
                />
              </Wrapper>
            ))}
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
          disabled={loading || isLoading}
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
/* eslint-enable complexity */

const styles = StyleSheet.create({
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  map: {
    height: normalize(250),
    width: device.width - 2 * normalize(16)
  }
});
