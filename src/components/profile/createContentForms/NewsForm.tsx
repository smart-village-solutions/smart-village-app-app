import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { MutableRefObject, useCallback, useContext, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Controller, FieldErrors, SubmitErrorHandler, useForm } from 'react-hook-form';
import { Alert, LayoutChangeEvent, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { ProfileContext } from '../../../ProfileProvider';
import { colors, consts, Icon, normalize, texts } from '../../../config';
import { uploadImages } from '../../../helpers';
import { GET_CATEGORIES } from '../../../queries/categories';
import { CREATE_NEWS_ITEM } from '../../../queries/newsItems';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Label } from '../../Label';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { Wrapper, WrapperHorizontal } from '../../Wrapper';
import { DateTimeInput, DropdownInput, Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

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

type NewsFormProps = {
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

export const NewsForm = ({ scrollViewRef }: NewsFormProps) => {
  const { currentUserData } = useContext(ProfileContext);

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const fieldPositionsRef = useRef<Partial<Record<keyof NewsFormValues | string, number>>>({});

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

  const registerFieldPosition = useCallback(
    (fieldName: keyof NewsFormValues | string) => (event: LayoutChangeEvent) => {
      fieldPositionsRef.current[fieldName] = event.nativeEvent.layout.y;
    },
    []
  );

  const onSubmit = async (formValues: NewsFormValues) => {
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
              mediaContents: imageUrls
            }
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

      <WrapperHorizontal>
        <Divider style={styles.divider} />
      </WrapperHorizontal>

      <Wrapper onLayout={registerFieldPosition('date')}>
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
      )}

      <Wrapper noPaddingTop>
        <Button
          onPress={handleFormSubmit}
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
  },
  divider: {
    backgroundColor: colors.placeholder
  }
});
