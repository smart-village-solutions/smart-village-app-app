import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { texts } from '../../../config';
import { Button } from '../../Button';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';

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
    formState: { errors, isValid },
    handleSubmit
  } = useForm<NewsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      date: null,
      description: '',
      image: null,
      subTitle: '',
      title: ''
    }
  });

  const onSubmit = (profileEditData: NewsFormValues) => {
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
          name="subTitle"
          label={texts.profile.forms.subTitle}
          placeholder={texts.profile.forms.subTitlePlaceholder}
          autoCapitalize="none"
          validate
          rules={{
            required: texts.profile.forms.subTitleError
          }}
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
          rules={{
            required: texts.profile.forms.descriptionError
          }}
          errorMessage={errors.description && errors.description.message}
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
