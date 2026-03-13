import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { MutableRefObject, useCallback, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import {
  Controller,
  FieldErrors,
  SubmitErrorHandler,
  useFieldArray,
  useForm,
  useWatch
} from 'react-hook-form';
import { Alert, DeviceEventEmitter, LayoutChangeEvent, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, consts, device, Icon, normalize, texts } from '../../../config';
import {
  buildAddressData,
  buildContactsData,
  buildDate,
  buildPriceInformations,
  buildWebUrls,
  parseDateInputValue,
  PriceInformationFormValue,
  uploadImages,
  WebUrlFormValue
} from '../../../helpers';
import { DETAIL_REFRESH_EVENT } from '../../../hooks';
import { GET_CATEGORIES } from '../../../queries/categories';
import { CREATE_EVENT_RECORDS } from '../../../queries/eventRecords';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Label } from '../../Label';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../../Wrapper';
import { DateTimeInput, DropdownInput, DropdownInputProps, Input } from '../../form';
import { MapLibre } from '../../map';
import { MultiImageSelector } from '../../selectors';

import {
  ContactFormValue,
  Contacts,
  createDefaultContact,
  createDefaultPriceInformation,
  createDefaultWebUrl,
  PriceInformations,
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
  categories: string[] | string;
  city: string;
  contacts: ContactFormValue[];
  description: string;
  endDate: Date | null;
  endTime: Date | null;
  id?: string;
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

type EventFormProps = {
  initialData?: any;
  mode?: 'create' | 'edit';
  scrollViewRef?: MutableRefObject<ScrollView | null>;
};

const orderedFieldNames: Array<keyof EventFormValues> = [
  'categories',
  'title',
  'description',
  'startDate',
  'startTime',
  'endDate',
  'endTime',
  'recurringInterval',
  'recurringType',
  'regionName',
  'street',
  'postcode',
  'city',
  'location'
];

const getErrorPaths = (value: unknown, parentPath = ''): string[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  if ('message' in value || 'type' in value || 'ref' in value) {
    return parentPath ? [parentPath] : [];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    return getErrorPaths(nestedValue, currentPath);
  });
};

const endDateBeforeStartDateError = 'Das Enddatum darf nicht vor dem Startdatum liegen';

const buildImageValue = (mediaContents: any[] = []) =>
  JSON.stringify(
    mediaContents
      .filter(
        (mediaContent) => mediaContent?.contentType === 'image' && mediaContent?.sourceUrl?.url
      )
      .map((mediaContent) => {
        const uri = mediaContent.sourceUrl.url;
        const imageName = uri.split('/').pop();

        return { id: mediaContent.id, infoText: imageName, uri };
      })
  );

const buildMediaContentInput = (mediaContents: any[] = []) =>
  mediaContents
    .filter((mediaContent) => mediaContent?.contentType && mediaContent?.sourceUrl?.url)
    .map((mediaContent) => ({
      contentType: mediaContent.contentType,
      ...(mediaContent.captionText && { captionText: mediaContent.captionText }),
      ...(mediaContent.copyright && { copyright: mediaContent.copyright }),
      sourceUrl: {
        url: mediaContent.sourceUrl.url
      }
    }));

const buildContactsValue = (contacts: any[] = []): ContactFormValue[] =>
  contacts.map((contact) => ({
    description: '',
    email: contact?.email ?? '',
    fax: contact?.fax ?? '',
    firstname: contact?.firstName ?? '',
    phone: contact?.phone ?? '',
    surname: contact?.lastName ?? '',
    url: contact?.webUrls?.[0]?.url ?? '',
    urlText: contact?.webUrls?.[0]?.description ?? ''
  }));

const buildWebUrlsValue = (webUrls: any[] = []): WebUrlFormValue[] =>
  webUrls.map((webUrl) => ({
    description: webUrl?.description ?? '',
    url: webUrl?.url ?? ''
  }));

const buildPriceInformationsValue = (priceInformations: any[] = []): PriceInformationFormValue[] =>
  priceInformations.map((priceInformation) => ({
    amount:
      priceInformation?.amount !== null && priceInformation?.amount !== undefined
        ? `${priceInformation.amount}`
        : '',
    description: priceInformation?.description ?? ''
  }));

/* eslint-disable complexity */
export const EventForm = ({ initialData, mode = 'create', scrollViewRef }: EventFormProps) => {
  const navigation = useNavigation();
  const isEdit = mode === 'edit' && !!initialData?.id;
  const initialDates = initialData?.date || initialData?.dates?.[0] || {};
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialData?.addresses?.[0]?.geoLocation
      ? {
          latitude: initialData.addresses[0].geoLocation.latitude,
          longitude: initialData.addresses[0].geoLocation.longitude
        }
      : null
  );
  const fieldPositionsRef = useRef<Partial<Record<keyof EventFormValues | string, number>>>({});

  const { data: dataCategories, loading: loadingCategories } = useQuery(GET_CATEGORIES, {
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
      categories:
        initialData?.categories?.map((category: { name: string }) => category.name) ||
        (initialData?.category?.name ? [initialData.category.name] : []),
      city: initialData?.addresses?.[0]?.city ?? '',
      contacts: buildContactsValue(initialData?.contacts),
      description: initialData?.description ?? '',
      endDate: parseDateInputValue(initialDates?.dateTo) ?? (isEdit ? null : moment().toDate()),
      endTime: parseDateInputValue(initialDates?.timeTo, ['HH:mm', 'HH:mm:ss']) ?? null,
      id: initialData?.id ?? '',
      image: buildImageValue(initialData?.mediaContents),
      latitude: initialData?.addresses?.[0]?.geoLocation?.latitude ?? null,
      location: '',
      longitude: initialData?.addresses?.[0]?.geoLocation?.longitude ?? null,
      postcode: initialData?.addresses?.[0]?.zip ?? '',
      priceInformations: buildPriceInformationsValue(initialData?.priceInformations),
      recurring: initialData?.recurring === '1' || initialData?.recurring === true,
      recurringInterval: initialData?.recurringInterval ? `${initialData.recurringInterval}` : '',
      recurringType: initialData?.recurringType ? `${initialData.recurringType}` : '',
      recurringWeekdays:
        initialData?.recurringWeekdays?.map((weekday: string | number) => Number(weekday)) || [],
      regionName: initialData?.addresses?.[0]?.addition ?? '',
      startDate: parseDateInputValue(initialDates?.dateFrom) ?? (isEdit ? null : moment().toDate()),
      startTime: parseDateInputValue(initialDates?.timeFrom, ['HH:mm', 'HH:mm:ss']) ?? null,
      street: initialData?.addresses?.[0]?.street ?? '',
      title: initialData?.title ?? '',
      urls: buildWebUrlsValue(initialData?.webUrls)
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

  const startDate = useWatch({
    control,
    name: 'startDate'
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

  const registerFieldPosition = useCallback(
    (fieldName: keyof EventFormValues | string) => (event: LayoutChangeEvent) => {
      fieldPositionsRef.current[fieldName] = event.nativeEvent.layout.y;
    },
    []
  );

  const scrollToFirstError: SubmitErrorHandler<EventFormValues> = useCallback(
    (formErrors: FieldErrors<EventFormValues>) => {
      const errorPaths = getErrorPaths(formErrors);
      const firstMatchingField = orderedFieldNames.find((fieldName) =>
        errorPaths.some((path) => path === fieldName || path.startsWith(`${fieldName}.`))
      );

      if (!firstMatchingField) {
        return;
      }

      const y = fieldPositionsRef.current[firstMatchingField];

      if (typeof y !== 'number') {
        return;
      }

      scrollViewRef?.current?.scrollTo({
        animated: true,
        y: Math.max(0, y - normalize(24))
      });
    },
    [scrollViewRef]
  );

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
      const existingNonImageMediaContents = buildMediaContentInput(
        initialData?.mediaContents
      ).filter((mediaContent) => mediaContent.contentType !== 'image');
      const dates = buildDate(formValues);
      const contacts = buildContactsData(formValues.contacts);
      const webUrls = buildWebUrls(formValues.urls);
      const priceInformations = buildPriceInformations(formValues.priceInformations);

      await createEventRecord({
        variables: {
          ...(isEdit && formValues.id && { id: formValues.id }),
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
          ...((existingNonImageMediaContents.length || imageUrls.length) && {
            mediaContents: [...existingNonImageMediaContents, ...imageUrls]
          }),
          ...(webUrls.length && { urls: webUrls }),
          ...(priceInformations.length && { priceInformations }),
          ...(contacts && { contacts })
        }
      });

      DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT);
      navigation.goBack();
      Alert.alert(
        isEdit
          ? texts.profile.forms.contentUpdateSuccessAlertTitle
          : texts.profile.forms.contentCreateSuccessAlertTitle,
        isEdit
          ? texts.profile.forms.contentUpdateSuccessAlertMessage
          : texts.profile.forms.contentCreateSuccessAlertMessage
      );
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleFormSubmit = useCallback(() => {
    void handleSubmit(onSubmit, scrollToFirstError)();
  }, [handleSubmit, onSubmit, scrollToFirstError]);

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
      <Wrapper noPaddingTop onLayout={registerFieldPosition('categories')}>
        <Controller
          name="categories"
          render={({ field: { name, onChange, value } }) => (
            <DropdownInput
              {...{
                boldLabel: true,
                control,
                data: categoryNameDropdownData,
                errors,
                label: `${texts.profile.forms.categories} *`,
                multipleSelect: true,
                name,
                onChange,
                placeholder: texts.profile.forms.categoriesPlaceholder,
                required: true,
                value,
                valueKey: 'name'
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('title')}>
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('description')}>
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

      <Wrapper noPaddingBottom>
        <Divider style={styles.divider} />
      </Wrapper>

      <Wrapper>
        <RegularText>{texts.profile.forms.images}</RegularText>
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
        <Divider style={styles.divider} />
      </Wrapper>

      <Wrapper noPaddingTop>
        <RegularText>{texts.profile.forms.eventDate}</RegularText>
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('startDate')}>
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('startTime')}>
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
                value
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('endDate')}>
        <Controller
          name="endDate"
          render={({ field: { name, onChange, value } }) => (
            <DateTimeInput
              {...{
                boldLabel: true,
                control,
                errors,
                label: texts.profile.forms.endDate,
                minimumDate: startDate ?? undefined,
                mode: 'date',
                name,
                onChange,
                placeholder: texts.profile.forms.endDatePlaceholder,
                rules: {
                  validate: (selectedEndDate) => {
                    if (!selectedEndDate || !startDate) {
                      return true;
                    }

                    return moment(selectedEndDate)
                      .startOf('day')
                      .isBefore(moment(startDate).startOf('day'))
                      ? endDateBeforeStartDateError
                      : true;
                  }
                },
                value
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('endTime')}>
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
                value
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <RegularText small>{texts.profile.forms.eventRepeatableTitle}</RegularText>
        <RegularText></RegularText>
        <RegularText smallest>{texts.profile.forms.eventRepeatableDescription}</RegularText>

        <WrapperVertical noPaddingBottom>
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
        </WrapperVertical>
      </Wrapper>

      {isRecurring && (
        <>
          <Wrapper noPaddingTop onLayout={registerFieldPosition('recurringInterval')}>
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
          </Wrapper>

          <Wrapper noPaddingTop onLayout={registerFieldPosition('recurringType')}>
            <Controller
              name="recurringType"
              render={({ field: { name, onChange, value } }) => (
                <DropdownInput
                  {...{
                    boldLabel: true,
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
        <Divider style={styles.divider} />
      </Wrapper>

      <Wrapper noPaddingTop>
        <RegularText>{texts.profile.forms.eventLocation}</RegularText>
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('regionName')}>
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('street')}>
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('postcode')}>
        <Input
          name="postcode"
          label={texts.profile.forms.postcode}
          placeholder={texts.profile.forms.postcodePlaceholder}
          autoCapitalize="none"
          keyboardType="numeric"
          maxLength={5}
          validate
          rules={{
            minLength: { value: 5, message: texts.profile.postcodeMinLength }
          }}
          errorMessage={errors.postcode && errors.postcode.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('city')}>
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('location')}>
        <Label bold>{texts.profile.forms.coordinates}</Label>
        <Controller
          name="location"
          render={() => (
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

      <WrapperHorizontal>
        <Divider style={styles.divider} />
      </WrapperHorizontal>

      <Wrapper>
        <RegularText>{texts.profile.forms.eventContact}</RegularText>
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
          onPress={() => appendContact(createDefaultContact())}
          title={texts.profile.forms.addContact}
        />
      </Wrapper>

      <WrapperHorizontal>
        <Divider style={styles.divider} />
      </WrapperHorizontal>

      <Wrapper>
        <RegularText>{texts.profile.forms.links}</RegularText>
      </Wrapper>

      <WebUrls
        control={control as any}
        errors={errors as any}
        fields={webUrlsFields}
        remove={removeWebUrl}
      />

      <Wrapper noPaddingTop>
        <Button
          invert
          onPress={() => appendWebUrl(createDefaultWebUrl())}
          title={texts.profile.forms.addLinks}
        />
      </Wrapper>

      <WrapperHorizontal>
        <Divider style={styles.divider} />
      </WrapperHorizontal>

      <Wrapper>
        <RegularText>{texts.profile.forms.priceInformations}</RegularText>
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
          onPress={() => appendPriceInformation(createDefaultPriceInformation())}
          title={texts.profile.forms.addPriceInformation}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Button
          onPress={handleFormSubmit}
          title={isEdit ? texts.profile.forms.save : texts.profile.forms.send}
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
  divider: {
    backgroundColor: colors.placeholder
  },
  map: {
    height: normalize(200),
    width: device.width - 2 * normalize(16)
  }
});
