import { useNavigation } from '@react-navigation/native';
import React, { MutableRefObject, useCallback, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import {
  Controller,
  FieldErrors,
  SubmitErrorHandler,
  useFieldArray,
  useForm
} from 'react-hook-form';
import { Alert, DeviceEventEmitter, LayoutChangeEvent, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, consts, device, normalize, texts } from '../../../config';
import {
  buildAddressData,
  buildContactData,
  buildOpeningHours,
  buildPriceInformations,
  buildWebUrls,
  OpeningHourFormValue,
  parseDateInputValue,
  PriceInformationFormValue,
  uploadImages,
  WebUrlFormValue
} from '../../../helpers';
import { DETAIL_REFRESH_EVENT } from '../../../hooks';
import { GET_CATEGORIES } from '../../../queries/categories';
import { CREATE_POINT_OF_INTEREST } from '../../../queries/pointsOfInterest';
import { Button } from '../../Button';
import { Label } from '../../Label';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper, WrapperHorizontal } from '../../Wrapper';
import { DropdownInput, Input } from '../../form';
import { MapLibre } from '../../map';
import { MultiImageSelector } from '../../selectors';

import {
  createDefaultOpeningHour,
  createDefaultPriceInformation,
  createDefaultWebUrl,
  OpeningHours,
  PriceInformations,
  WebUrls
} from './InputGroups';
const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

type PoiFormValues = {
  categories: string[] | string;
  city: string;
  description: string;
  email: string;
  firstname: string;
  id?: string;
  image: string | null;
  latitude: number | null;
  location: string;
  longitude: number | null;
  name: string;
  openingHours: OpeningHourFormValue[];
  phone: string;
  postcode: string;
  priceInformations: PriceInformationFormValue[];
  regionName: string;
  street: string;
  surname: string;
  url: string;
  urlText: string;
  webUrls: WebUrlFormValue[];
};

type PointOfInterestFormProps = {
  initialData?: any;
  mode?: 'create' | 'edit';
  scrollViewRef?: MutableRefObject<ScrollView | null>;
};

const orderedFieldNames: Array<keyof PoiFormValues> = [
  'categories',
  'name',
  'description',
  'openingHours',
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

const buildOpeningHoursValue = (openingHours: any[] = []): OpeningHourFormValue[] =>
  openingHours.map((openingHour) => ({
    description: openingHour?.description ?? '',
    endDate: parseDateInputValue(openingHour?.dateTo) ?? null,
    endTime: parseDateInputValue(openingHour?.timeTo, ['HH:mm', 'HH:mm:ss']) ?? null,
    isOpen: !!openingHour?.open,
    startDate: parseDateInputValue(openingHour?.dateFrom) ?? null,
    startTime: parseDateInputValue(openingHour?.timeFrom, ['HH:mm', 'HH:mm:ss']) ?? null,
    weekday:
      openingHour?.weekday !== null &&
      openingHour?.weekday !== undefined &&
      openingHour?.weekday !== ''
        ? Number(openingHour.weekday)
        : -1
  }));

/* eslint-disable complexity */
export const PointOfInterestForm = ({
  initialData,
  mode = 'create',
  scrollViewRef
}: PointOfInterestFormProps) => {
  const navigation = useNavigation();
  const isEdit = mode === 'edit' && !!initialData?.id;
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
  const fieldPositionsRef = useRef<Partial<Record<keyof PoiFormValues | string, number>>>({});

  const { data: dataCategories, loading: loadingCategories } = useQuery(GET_CATEGORIES, {
    variables: { tagList: ['point_of_interest'] }
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm<PoiFormValues>({
    mode: 'onBlur',
    defaultValues: {
      categories:
        initialData?.categories?.map((category: { name: string }) => category.name) ||
        (initialData?.category?.name ? [initialData.category.name] : []),
      city: initialData?.addresses?.[0]?.city ?? '',
      description: initialData?.description ?? '',
      email: initialData?.contact?.email ?? '',
      firstname: initialData?.contact?.firstName ?? '',
      id: initialData?.id ?? '',
      image: buildImageValue(initialData?.mediaContents),
      latitude: initialData?.addresses?.[0]?.geoLocation?.latitude ?? null,
      location: '',
      longitude: initialData?.addresses?.[0]?.geoLocation?.longitude ?? null,
      name: initialData?.title ?? initialData?.name ?? '',
      openingHours: buildOpeningHoursValue(initialData?.openingHours),
      phone: initialData?.contact?.phone ?? '',
      postcode: initialData?.addresses?.[0]?.zip ?? '',
      priceInformations: buildPriceInformationsValue(initialData?.priceInformations),
      regionName: initialData?.addresses?.[0]?.addition ?? '',
      street: initialData?.addresses?.[0]?.street ?? '',
      surname: initialData?.contact?.lastName ?? '',
      url: initialData?.contact?.webUrls?.[0]?.url ?? '',
      urlText: initialData?.contact?.webUrls?.[0]?.description ?? '',
      webUrls: buildWebUrlsValue(initialData?.webUrls)
    }
  });

  const {
    fields: openingHoursFields,
    append: appendOpeningHour,
    remove: removeOpeningHour
  } = useFieldArray({
    control,
    name: 'openingHours'
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

  const [createPointOfInterest, { loading }] = useMutation(CREATE_POINT_OF_INTEREST);

  const registerFieldPosition = useCallback(
    (fieldName: keyof PoiFormValues | string) => (event: LayoutChangeEvent) => {
      fieldPositionsRef.current[fieldName] = event.nativeEvent.layout.y;
    },
    []
  );

  const onSubmit = async (formValues: PoiFormValues) => {
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
      const contact = buildContactData(formValues);
      const openingHours = buildOpeningHours(formValues.openingHours);
      const webUrls = buildWebUrls(formValues.webUrls);
      const priceInformations = buildPriceInformations(formValues.priceInformations);

      await createPointOfInterest({
        variables: {
          ...(isEdit && formValues.id && { id: formValues.id }),
          addresses: [buildAddressData(formValues)],
          categories: formValues.categories.map((name: string) => ({ name })),
          name: formValues.name,
          ...(formValues.description && { description: formValues.description }),
          ...(imageUrls.length && { mediaContents: imageUrls }),
          ...(contact && { contact }),
          ...(openingHours.length && { openingHours }),
          ...(webUrls.length && { webUrls }),
          ...(priceInformations.length && { priceInformations })
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

  const scrollToFirstError: SubmitErrorHandler<PoiFormValues> = useCallback(
    (formErrors: FieldErrors<PoiFormValues>) => {
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('name')}>
        <Input
          name="name"
          label={`${texts.profile.forms.name} *`}
          placeholder={texts.profile.forms.namePlaceholder}
          autoCapitalize="none"
          validate
          rules={{
            required: texts.profile.forms.nameError
          }}
          errorMessage={errors.name && errors.name.message}
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
        <RegularText>{texts.profile.forms.address}</RegularText>
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

      <Wrapper noPaddingBottom>
        <Divider style={styles.divider} />
      </Wrapper>

      <Wrapper onLayout={registerFieldPosition('openingHours')}>
        <RegularText>{texts.profile.forms.openingHours}</RegularText>
      </Wrapper>

      <OpeningHours
        control={control as any}
        errors={errors as any}
        fields={openingHoursFields}
        remove={removeOpeningHour}
      />

      <Wrapper noPaddingTop>
        <Button
          invert
          onPress={() => appendOpeningHour(createDefaultOpeningHour())}
          title={texts.profile.forms.addOpeningHours}
        />
      </Wrapper>

      <WrapperHorizontal>
        <Divider style={styles.divider} />
      </WrapperHorizontal>

      <Wrapper>
        <RegularText>{texts.profile.forms.contacts.title}</RegularText>
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          label={texts.profile.forms.contacts.firstname}
          name="firstname"
          placeholder={texts.profile.forms.contacts.firstnamePlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          label={texts.profile.forms.contacts.surname}
          name="surname"
          placeholder={texts.profile.forms.contacts.surnamePlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          keyboardType="email-address"
          label={texts.profile.forms.contacts.email}
          name="email"
          placeholder={texts.profile.forms.contacts.emailPlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          keyboardType="phone-pad"
          label={texts.profile.forms.contacts.phone}
          name="phone"
          placeholder={texts.profile.forms.contacts.phonePlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          keyboardType="url"
          label={texts.profile.forms.contacts.url}
          name="url"
          placeholder={texts.profile.forms.contacts.urlPlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          label={texts.profile.forms.contacts.urlText}
          name="urlText"
          placeholder={texts.profile.forms.contacts.urlTextPlaceholder}
          validate
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
  divider: {
    backgroundColor: colors.placeholder
  },
  map: {
    height: normalize(200),
    width: device.width - 2 * normalize(16)
  }
});
