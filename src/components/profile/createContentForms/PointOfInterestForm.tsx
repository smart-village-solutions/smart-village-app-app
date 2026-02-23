import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { consts, device, normalize, texts } from '../../../config';
import { Button } from '../../Button';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { DateTimeInput, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

type PoiFormValues = {
  date: Date | null;
  description: string;
  image: string | null;
  placeName: string;
  title: string;
  street: string;
  postcode: string;
  city: string;
};

export const PointOfInterestForm = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<PoiFormValues>({
    mode: 'onBlur',
    defaultValues: {
      date: moment().toDate(),
      description: '',
      image: '[]',
      placeName: '',
      title: '',
      street: '',
      postcode: '',
      city: ''
    }
  });

  // TODO: implement Poi item creation logic here
  const onSubmit = (formValues: PoiFormValues) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
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
        <Input
          name="placeName"
          label={texts.profile.forms.placeName}
          placeholder={texts.profile.forms.placeNamePlaceholder}
          keyboardType="numeric"
          autoCapitalize="none"
          validate
          rules={{
            required: texts.profile.forms.placeNameError
          }}
          errorMessage={errors.placeName && errors.placeName.message}
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
          rules={{
            required: texts.profile.forms.streetError
          }}
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
          rules={{
            required: texts.profile.forms.postcodeError
          }}
          errorMessage={errors.postalCode && errors.postalCode.message}
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
          rules={{
            required: texts.profile.forms.cityError
          }}
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
