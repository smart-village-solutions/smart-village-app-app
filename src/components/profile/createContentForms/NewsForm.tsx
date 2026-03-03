import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { colors, consts, Icon, texts } from '../../../config';
import { GET_CATEGORIES } from '../../../queries/categories';
import { uploadMediaContent } from '../../../queries/mediaContent';
import { CREATE_NEWS_ITEM } from '../../../queries/newsItems';
import { Button } from '../../Button';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper } from '../../Wrapper';
import { DateTimeInput, DropdownInput, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';
import { Checkbox } from '../../Checkbox';
import { StyleSheet } from 'react-native';
import { Label } from '../../Label';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

type NewsFormValues = {
  categories: string;
  date: Date | null;
  description: string;
  image: string;
  subTitle: string;
  title: string;
  url: string;
  urlDescription: string;
  sendPushNotification: boolean;
};

export const NewsForm = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: dataCategories,
    loading: loadingCategories,
    refetch: refetchCategories
  } = useQuery(GET_CATEGORIES, {
    variables: { tagList: ['news_item'] }
  });

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<NewsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      categories: '[]',
      date: moment().toDate(),
      description: '',
      image: '[]',
      subTitle: '',
      title: '',
      url: '',
      urlDescription: '',
      sendPushNotification: false
    }
  });

  const [createNewsItem, { loading }] = useMutation(CREATE_NEWS_ITEM);
  let imageUrl: string | undefined;

  const onSubmit = async (formValues: NewsFormValues) => {
    setIsLoading(true);

    try {
      const images = JSON.parse(formValues.image);
      const imageUrls: { sourceUrl: { url: string }; contentType: string }[] = images
        .filter((image) => !!image.id)
        .map((image) => ({ contentType: 'image', sourceUrl: { url: image.uri } }));

      if (images?.length) {
        for (const image of images) {
          if (!image.id) {
            try {
              imageUrl = await uploadMediaContent(image, 'image');

              imageUrl && imageUrls.push({ sourceUrl: { url: imageUrl }, contentType: 'image' });
            } catch (error) {
              setIsLoading(false);
              Alert.alert(
                texts.profile.forms.contentImageUploadErrorAlertTitle,
                texts.profile.forms.contentImageUploadErrorAlertMessage
              );
              return;
            }
          }
        }
      }

      await createNewsItem({
        variables: {
          categories: formValues.categories.map((categoryName: string) => ({
            name: categoryName
          })),
          contentBlocks: [
            {
              title: formValues.title,
              intro: formValues.subTitle,
              body: formValues.description,
              mediaContents: JSON.parse(formValues.image).map((image: { uri: string }) => ({
                contentType: 'image',
                sourceUrl: { url: image.uri }
              }))
            }
          ],
          publishedAt: formValues.date,
          pushNotification: formValues.sendPushNotification,
          sourceUrl: {
            url: formValues.url,
            description: formValues.urlDescription
          },
          title: formValues.title
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
      value: category.name,
      selected: false
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
          autoCapitalize="none"
          control={control}
          errorMessage={errors.title && errors.title.message}
          label={`${texts.profile.forms.title} *`}
          name="title"
          placeholder={texts.profile.forms.titlePlaceholder}
          rules={{ required: texts.profile.forms.titleError }}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          errorMessage={errors.subTitle && errors.subTitle.message}
          label={texts.profile.forms.subTitle}
          name="subTitle"
          placeholder={texts.profile.forms.subTitlePlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          errorMessage={errors.description && errors.description.message}
          label={texts.profile.forms.description}
          name="description"
          placeholder={texts.profile.forms.descriptionPlaceholder}
          richText
          validate
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
        <Input
          autoCapitalize="none"
          control={control}
          label={texts.profile.forms.linkGroup.url}
          name="url"
          placeholder={texts.profile.forms.linkGroup.urlPlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          autoCapitalize="none"
          control={control}
          label={texts.profile.forms.linkGroup.description}
          name="urlDescription"
          placeholder={texts.profile.forms.linkGroup.descriptionPlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Label bold>{texts.profile.forms.pushNotificationTitle}</Label>
        <Label>{texts.profile.forms.pushNotificationDescription}</Label>

        <Controller
          name="sendPushNotification"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={!!value}
              checkedIcon={<Icon.SquareCheckFilled />}
              containerStyle={styles.checkboxContainerStyle}
              onPress={() => onChange(!value)}
              textStyle={styles.checkboxTextStyle}
              title={texts.profile.forms.pushNotificationCheckbox}
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

const styles = StyleSheet.create({
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  }
});
