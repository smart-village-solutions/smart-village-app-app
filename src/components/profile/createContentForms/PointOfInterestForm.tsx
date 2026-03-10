import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { consts, device, normalize, texts } from '../../../config';
import { GET_CATEGORIES } from '../../../queries/categories';
import { Button } from '../../Button';
import { Label } from '../../Label';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { DateTimeInput, DropdownInput, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

import {
  createDefaultOpeningHour,
  createDefaultPriceInformation,
  createDefaultWebUrl,
  OpeningHourFormValue,
  OpeningHours,
  PriceInformationFormValue,
  PriceInformations,
  WebUrlFormValue,
  WebUrls
} from './InputGroups';
import { MapLibre } from '../../map';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

type PoiFormValues = {
  categoryName: string;
  city: string;
  date: Date | null;
  description: string;
  image: string | null;
  latitude: number | null;
  location: string;
  longitude: number | null;
  name: string;
  openingHours: OpeningHourFormValue[];
  postcode: string;
  priceInformations: PriceInformationFormValue[];
  regionName: string;
  street: string;
  webUrls: WebUrlFormValue[];
};

export const PointOfInterestForm = () => {
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
      categoryName: '',
      city: '',
      date: moment().toDate(),
      description: '',
      image: '[]',
      latitude: null,
      location: '',
      longitude: null,
      name: '',
      openingHours: [],
      postcode: '',
      priceInformations: [],
      regionName: '',
      street: '',
      webUrls: []
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

  // TODO: implement Poi item creation logic here
  const onSubmit = (formValues: PoiFormValues) => {
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
        <Label bold>{texts.profile.forms.adresse}</Label>

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
          keyboardType="numeric"
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
        <Button
          invert
          onPress={() => appendOpeningHour(createDefaultOpeningHour())}
          title={texts.profile.forms.addOpeningHours}
        />
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
        <Controller
          name="date"
          render={({ field: { name, onChange, value } }) => (
            <DateTimeInput
              {...{
                boldLabel: true,
                control,
                errors,
                label: texts.profile.forms.date,
                mode: 'date',
                name,
                onChange,
                placeholder: texts.profile.forms.datePlaceholder,
                required: true,
                value
              }}
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
  map: {
    height: normalize(300),
    width: device.width - 2 * normalize(16)
  }
});
