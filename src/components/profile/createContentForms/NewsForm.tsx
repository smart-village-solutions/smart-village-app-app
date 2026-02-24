import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { consts, texts } from '../../../config';
import { Button } from '../../Button';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { DateTimeInput, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

type NewsFormValues = {
  date: Date | null;
  description: string;
  image: string | null;
  subTitle: string;
  title: string;
};

export const NewsForm = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<NewsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      date: moment().toDate(),
      description: '',
      image: '[]',
      subTitle: '',
      title: ''
    }
  });

  // TODO: implement news item creation logic here
  const onSubmit = (formValues: NewsFormValues) => {
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
          label={`${texts.profile.forms.title} *`}
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
          name="subTitle"
          label={texts.profile.forms.subTitle}
          placeholder={texts.profile.forms.subTitlePlaceholder}
          autoCapitalize="none"
          validate
          errorMessage={errors.subTitle && errors.subTitle.message}
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
