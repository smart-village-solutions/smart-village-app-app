import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { MutableRefObject, useCallback, useContext, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Controller, FieldErrors, SubmitErrorHandler, useForm } from 'react-hook-form';
import { Alert, DeviceEventEmitter, LayoutChangeEvent, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { ProfileContext } from '../../../ProfileProvider';
import { colors, consts, Icon, normalize, texts } from '../../../config';
import { parseDateInputValue, uploadImages } from '../../../helpers';
import { DETAIL_REFRESH_EVENT } from '../../../hooks';
import { GET_CATEGORIES } from '../../../queries/categories';
import { CREATE_NEWS_ITEM } from '../../../queries/newsItems';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper, WrapperVertical } from '../../Wrapper';
import { DateTimeInput, DropdownInput, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

type NewsFormValues = {
  categories: string[] | string;
  date: Date | null;
  description: string;
  id?: string;
  image: string;
  subTitle: string;
  title: string;
  url: string;
  urlDescription: string;
  sendPushNotification: boolean;
};

type NewsFormProps = {
  initialData?: any;
  mode?: 'create' | 'edit';
  scrollViewRef?: MutableRefObject<ScrollView | null>;
};

const orderedFieldNames: Array<keyof NewsFormValues> = [
  'categories',
  'title',
  'subTitle',
  'description',
  'url',
  'urlDescription',
  'date'
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

/* eslint-disable complexity */
export const NewsForm = ({ initialData, mode = 'create', scrollViewRef }: NewsFormProps) => {
  const { currentUserData } = useContext(ProfileContext);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const fieldPositionsRef = useRef<Partial<Record<keyof NewsFormValues | string, number>>>({});
  const isEdit = mode === 'edit' && !!initialData?.id;
  const contentBlock = initialData?.contentBlocks?.[0];

  const { data: dataCategories, loading: loadingCategories } = useQuery(GET_CATEGORIES, {
    variables: { tagList: ['news_item'] }
  });

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<NewsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      categories: initialData?.categories?.map((category: { name: string }) => category.name) || [],
      date: parseDateInputValue(initialData?.publishedAt) ?? moment().toDate(),
      description: contentBlock?.body ?? '',
      id: initialData?.id ?? '',
      image: buildImageValue(contentBlock?.mediaContents),
      subTitle: contentBlock?.intro ?? '',
      title: initialData?.mainTitle ?? initialData?.title ?? contentBlock?.title ?? '',
      url: initialData?.sourceUrl?.url ?? '',
      urlDescription: initialData?.sourceUrl?.description ?? '',
      sendPushNotification: false
    }
  });

  const [createNewsItem, { loading }] = useMutation(CREATE_NEWS_ITEM);

  const registerFieldPosition = useCallback(
    (fieldName: keyof NewsFormValues | string) => (event: LayoutChangeEvent) => {
      fieldPositionsRef.current[fieldName] = event.nativeEvent.layout.y;
    },
    []
  );

  const onSubmit = useCallback(
    async (formValues: NewsFormValues) => {
      setIsLoading(true);

      try {
        const submitContentBlock = initialData?.contentBlocks?.[0];
        const submitAdditionalContentBlocks = initialData?.contentBlocks?.slice(1) ?? [];
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
          submitContentBlock?.mediaContents
        ).filter((mediaContent) => mediaContent.contentType !== 'image');
        const preservedContentBlocks = submitAdditionalContentBlocks.map((block: any) => ({
          ...(block?.id && { id: block.id }),
          ...(block?.title && { title: block.title }),
          ...(block?.intro && { intro: block.intro }),
          ...(block?.body && { body: block.body }),
          ...(block?.mediaContents?.length && {
            mediaContents: buildMediaContentInput(block.mediaContents)
          })
        }));

        await createNewsItem({
          variables: {
            ...(isEdit && formValues.id && { id: formValues.id }),
            categories: formValues.categories.map((categoryName: string) => ({
              name: categoryName
            })),
            contentBlocks: [
              {
                ...(submitContentBlock?.id && { id: submitContentBlock.id }),
                title: formValues.title,
                intro: formValues.subTitle,
                body: formValues.description,
                mediaContents: [...existingNonImageMediaContents, ...imageUrls]
              },
              ...preservedContentBlocks
            ],
            publishedAt: formValues.date,
            pushNotification: formValues.sendPushNotification,
            ...(formValues.url && {
              sourceUrl: {
                url: formValues.url,
                ...(formValues.urlDescription && { description: formValues.urlDescription })
              }
            }),
            title: formValues.title
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
    },
    [createNewsItem, initialData, isEdit, navigation]
  );

  const submitWithPushNotificationConfirmation = useCallback(
    (formValues: NewsFormValues) => {
      if (!formValues.sendPushNotification) {
        void onSubmit(formValues);
        return;
      }

      Alert.alert(
        texts.profile.forms.pushNotificationConfirmTitle,
        texts.profile.forms.pushNotificationConfirmMessage,
        [
          {
            style: 'cancel',
            text: texts.profile.abort
          },
          {
            onPress: () => {
              void onSubmit(formValues);
            },
            text: texts.profile.ok
          }
        ]
      );
    },
    [onSubmit]
  );

  const scrollToFirstError: SubmitErrorHandler<NewsFormValues> = useCallback(
    (formErrors: FieldErrors<NewsFormValues>) => {
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
    void handleSubmit(submitWithPushNotificationConfirmation, scrollToFirstError)();
  }, [handleSubmit, scrollToFirstError, submitWithPushNotificationConfirmation]);

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
      <Wrapper noPaddingTop onLayout={registerFieldPosition('title')}>
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('subTitle')}>
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

      <Wrapper noPaddingTop onLayout={registerFieldPosition('description')}>
        <Input
          autoCapitalize="none"
          control={control}
          errorMessage={errors.description && errors.description.message}
          label={texts.profile.forms.text}
          name="description"
          placeholder={texts.profile.forms.textPlaceholder}
          richText
          validate
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
        <RegularText>{texts.profile.forms.linkGroup.source}</RegularText>
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('url')}>
        <Input
          autoCapitalize="none"
          control={control}
          label={texts.profile.forms.linkGroup.url}
          name="url"
          placeholder={texts.profile.forms.linkGroup.urlPlaceholder}
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('urlDescription')}>
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
        <Divider style={styles.divider} />
      </Wrapper>

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
                label: `${texts.profile.forms.categories}`,
                multipleSelect: true,
                name,
                onChange,
                placeholder: texts.profile.forms.categoriesPlaceholder,
                value,
                valueKey: 'name'
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('date')}>
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

      {currentUserData?.roles.role_push_notification && (
        <>
          <Wrapper noPaddingTop>
            <Divider style={styles.divider} />
          </Wrapper>
          <Wrapper noPaddingTop>
            <RegularText>{texts.profile.forms.pushNotificationTitle}</RegularText>
            <RegularText></RegularText>
            <RegularText smallest>{texts.profile.forms.pushNotificationDescription}</RegularText>

            <WrapperVertical noPaddingBottom>
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
            </WrapperVertical>
          </Wrapper>
        </>
      )}

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
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  },
  divider: {
    backgroundColor: colors.placeholder
  }
});
