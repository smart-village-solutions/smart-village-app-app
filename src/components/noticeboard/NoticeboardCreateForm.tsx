import { StackNavigationProp } from '@react-navigation/stack';
import _findKey from 'lodash/findKey';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { MutableRefObject, useCallback, useContext, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Controller, FieldErrors, SubmitErrorHandler, useForm } from 'react-hook-form';
import { Alert, Keyboard, LayoutChangeEvent, ScrollView, StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  DateTimeInput,
  DocumentSelector,
  HtmlView,
  Input,
  Label,
  LoadingSpinner,
  MultiImageSelector,
  RegularText,
  Touchable,
  Wrapper,
  WrapperHorizontal,
  WrapperRow
} from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import {
  formatSizeStandard,
  graphqlFetchPolicy,
  momentFormat,
  parseListItemsFromQuery
} from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { CREATE_GENERIC_ITEM } from '../../queries/genericItem';
import { uploadMediaContent } from '../../queries/mediaContent';
import { SettingsContext } from '../../SettingsProvider';
import { NOTICEBOARD_TYPES } from '../../types';

const { EMAIL_REGEX, IMAGE_SELECTOR_TYPES, IMAGE_SELECTOR_ERROR_TYPES, MEDIA_TYPES } = consts;

const extendedMoment = extendMoment(moment);

type TNoticeboardCreateData = {
  body: string;
  dateEnd: string;
  dateStart: string;
  documents: string;
  email: string;
  id: string;
  image: string;
  name: string;
  noticeboardType: NOTICEBOARD_TYPES;
  price: string;
  priceType?: string;
  termsOfService: boolean;
  title: string;
};

const orderedFieldNames: Array<keyof TNoticeboardCreateData> = [
  'name',
  'email',
  'noticeboardType',
  'title',
  'body',
  'dateEnd',
  'termsOfService'
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

/* eslint-disable complexity */
export const NoticeboardCreateForm = ({
  data,
  navigation,
  queryVariables,
  route,
  scrollViewRef
}: {
  data: any;
  navigation: StackNavigationProp<any>;
  queryVariables: { [key: string]: any };
  route: any;
  scrollViewRef?: MutableRefObject<ScrollView | null>;
}) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const isEdit = !!Object.keys(data).length;
  const subQuery = route.params?.subQuery ?? {};
  const consentForDataProcessingText =
    subQuery?.params?.consentForDataProcessingText ??
    route?.params?.consentForDataProcessingText ??
    '';
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { showNoticeboardMediaContent = {} } = settings;
  const {
    document: showDocument = false,
    documentMaxSizes = {},
    image: showImage = false,
    imageMaxSizes = {},
    maxDocumentCount = 0,
    maxImageCount = 0
  } = showNoticeboardMediaContent;
  const genericType = route?.params?.genericType ?? '';
  const requestedDateDifference = route?.params?.requestedDateDifference ?? 3;
  const [isLoading, setIsLoading] = useState(false);

  const { data: categories } = useQuery(getQuery(QUERY_TYPES.CATEGORIES), {
    fetchPolicy,
    variables: queryVariables
  });

  const NOTICEBOARD_TYPE_OPTIONS = parseListItemsFromQuery(QUERY_TYPES.CATEGORIES, categories, '', {
    queryVariables
  }).map((item) => ({ value: item.title, title: item.title }));

  const formImages = data?.mediaContents?.map((image: any) => {
    const uri = image.sourceUrl.url;
    const uriSplitForImageName = uri.split('/');
    const imageName = uriSplitForImageName[uriSplitForImageName.length - 1];

    return { id: image.id, infoText: imageName, uri };
  });

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    shouldFocusError: false,
    defaultValues: {
      id: data?.id ?? '',
      body: data?.contentBlocks?.[0]?.body ?? '',
      dateEnd: data?.dates?.[0]?.dateEnd
        ? moment(data?.dates?.[0]?.dateEnd)?.toDate()
        : moment().add(requestedDateDifference, 'months').toDate(),
      dateStart: data?.dates?.[0]?.dateStart
        ? moment(data?.dates?.[0]?.dateStart)?.toDate()
        : moment().toDate(),
      documents: '[]',
      email: data?.contacts?.[0]?.email ?? '',
      image: formImages?.length ? JSON.stringify(formImages) : '[]',
      name: data?.contacts?.[0]?.firstName ?? '',
      noticeboardType:
        _findKey(
          texts.noticeboard.categoryNames,
          (value) => value === data?.categories?.[0]?.name
        ) || '',
      price: data?.priceInformations?.[0]?.description?.replace('€', '').trim() ?? '',
      priceType: data?.priceInformations?.[0]?.priceType ?? '€',
      termsOfService: false,
      title: data?.title ?? ''
    }
  });
  const fieldPositionsRef = useRef<Partial<Record<keyof TNoticeboardCreateData | string, number>>>(
    {}
  );

  const [createGenericItem, { loading }] = useMutation(CREATE_GENERIC_ITEM);
  let imageUrl: string | undefined;
  let documentUrl: string | undefined;

  const registerFieldPosition = useCallback(
    (fieldName: keyof TNoticeboardCreateData | string) => (event: LayoutChangeEvent) => {
      fieldPositionsRef.current[fieldName] = event.nativeEvent.layout.y;
    },
    []
  );

  const scrollToFirstError: SubmitErrorHandler<TNoticeboardCreateData> = useCallback(
    (formErrors: FieldErrors<TNoticeboardCreateData>) => {
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

  const onSubmit = async (noticeboardNewData: TNoticeboardCreateData) => {
    Keyboard.dismiss();

    if (!noticeboardNewData.termsOfService) {
      return Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.termsOfService);
    }

    const dateStart = moment(noticeboardNewData.dateStart).toDate();
    const dateEnd = moment(noticeboardNewData.dateEnd).toDate();
    const dateDifference = extendedMoment.range(dateStart, dateEnd).diff('months');

    if (dateDifference > requestedDateDifference || dateDifference < 0) {
      return Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.dateDifference);
    }

    setIsLoading(true);

    try {
      let price = noticeboardNewData.price;

      // regex to check if price is a number with 2 decimal places allowing . or , as decimal separator
      if (/^\d+(?:[.,]\d{2})?$/.test(price)) {
        price = `${noticeboardNewData.price} ${noticeboardNewData.priceType}`.trim();
      }

      const images = JSON.parse(noticeboardNewData.image);
      const imageUrls: { sourceUrl: { url: string }; contentType: string }[] = images
        .filter((image) => !!image.id)
        .map((image) => ({ contentType: 'image', sourceUrl: { url: image.uri } }));
      const imagesSize = images.reduce((acc: number, image: any) => acc + image.size, 0);

      // check if any image size is bigger than `imageMaxSizes.file`
      for (const image of images) {
        if (!!imageMaxSizes.file && image.size > imageMaxSizes.file) {
          setIsLoading(false);
          return Alert.alert(
            texts.noticeboard.alerts.hint,
            texts.noticeboard.alerts.imageSizeError(formatSizeStandard(imageMaxSizes.file))
          );
        }
      }

      // check if images size is bigger than `imageMaxSizes.total`
      if (imageMaxSizes.total && imagesSize > imageMaxSizes.total) {
        setIsLoading(false);
        return Alert.alert(
          texts.noticeboard.alerts.hint,
          texts.noticeboard.alerts.imagesSizeError(formatSizeStandard(imageMaxSizes.total))
        );
      }

      if (images?.length) {
        for (const image of images) {
          if (!image.id) {
            try {
              imageUrl = await uploadMediaContent(image, 'image');

              imageUrl && imageUrls.push({ sourceUrl: { url: imageUrl }, contentType: 'image' });
            } catch (error) {
              setIsLoading(false);
              Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.imageUploadError);
              return;
            }
          }
        }
      }

      const documents = JSON.parse(noticeboardNewData.documents);
      const documentsUrl: { sourceUrl: { url: string }; contentType: string }[] = documents
        ?.filter((document: { id: number }) => !!document.id)
        ?.map((document: { mimeType: string; cachedAttachment: string }) => ({
          contentType: document.mimeType,
          sourceUrl: { url: document.cachedAttachment }
        }));
      const documentsSize = documents.reduce(
        (acc: number, document: any) => acc + document.size,
        0
      );

      // check if any document size is bigger than `documentMaxSizes.file`
      for (const document of documents) {
        if (!!documentMaxSizes.file && document.size > documentMaxSizes.file) {
          setIsLoading(false);
          return Alert.alert(
            texts.noticeboard.alerts.hint,
            texts.noticeboard.alerts.documentSizeError(formatSizeStandard(documentMaxSizes.file))
          );
        }
      }

      // check if documents size is bigger than `documentMaxSizes.total`
      if (documentMaxSizes.total && documentsSize > documentMaxSizes.total) {
        setIsLoading(false);
        return Alert.alert(
          texts.noticeboard.alerts.hint,
          texts.noticeboard.alerts.documentsSizeError(formatSizeStandard(documentMaxSizes.total))
        );
      }

      if (documents?.length) {
        for (const document of documents) {
          if (!document.id) {
            try {
              documentUrl = await uploadMediaContent(
                document,
                document.mimeType,
                'document',
                MEDIA_TYPES.DOCUMENT
              );

              documentUrl &&
                documentsUrl.push({
                  sourceUrl: { url: documentUrl },
                  contentType: document.mimeType
                });
            } catch (error) {
              setIsLoading(false);
              Alert.alert(
                texts.noticeboard.alerts.hint,
                texts.noticeboard.alerts.documentUploadError
              );
              return;
            }
          }
        }
      }

      const mediaContents = documentsUrl.concat(imageUrls);

      await createGenericItem({
        variables: {
          categoryName: noticeboardNewData.noticeboardType,
          contacts: [{ email: noticeboardNewData.email, firstName: noticeboardNewData.name }],
          contentBlocks: [{ body: noticeboardNewData.body, title: noticeboardNewData.title }],
          dates: [
            {
              dateEnd: momentFormat(noticeboardNewData.dateEnd),
              dateStart: momentFormat(noticeboardNewData.dateStart)
            }
          ],
          genericType,
          id: noticeboardNewData.id,
          mediaContents,
          priceInformations: [{ description: price }],
          publishedAt: momentFormat(noticeboardNewData.dateStart),
          title: noticeboardNewData.title
        }
      });

      navigation.goBack();
      Alert.alert(texts.noticeboard.successScreen.header, texts.noticeboard.successScreen.entry);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleFormSubmit = useCallback(() => {
    void handleSubmit(onSubmit, scrollToFirstError)();
  }, [handleSubmit, onSubmit, scrollToFirstError]);

  return (
    <>
      <Input name="dateStart" hidden control={control} />

      <Wrapper noPaddingTop onLayout={registerFieldPosition('name')}>
        <Input
          name="name"
          label={`${texts.noticeboard.inputName} *`}
          placeholder={texts.noticeboard.inputName}
          validate
          rules={{
            required: `${texts.noticeboard.inputName} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.name && errors.name.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('email')}>
        <Input
          name="email"
          label={`${texts.noticeboard.inputMail} *`}
          placeholder={texts.noticeboard.inputMail}
          keyboardType="email-address"
          validate
          rules={{
            required: `${texts.noticeboard.inputMail} ${texts.noticeboard.inputErrorText}`,
            pattern: {
              value: EMAIL_REGEX,
              message: `${texts.noticeboard.inputMail}${texts.noticeboard.invalidMail}`
            }
          }}
          errorMessage={errors.email && errors.email.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('noticeboardType')}>
        <Label bold>{`${texts.noticeboard.selectNoticeboardType} *`}</Label>
        <Controller
          name="noticeboardType"
          rules={{ required: texts.noticeboard.alerts.noticeboardType }}
          render={({ field: { onChange, value } }) => (
            <>
              {NOTICEBOARD_TYPE_OPTIONS.map((noticeboardItem: { value: string; title: string }) => (
                <Checkbox
                  checked={value === noticeboardItem.value}
                  checkedIcon={<Icon.CircleCheckFilled />}
                  containerStyle={styles.checkboxContainerStyle}
                  key={noticeboardItem.title}
                  onPress={() => onChange(noticeboardItem.value)}
                  title={noticeboardItem.title}
                  uncheckedIcon={<Icon.Circle color={colors.placeholder} />}
                />
              ))}
              <Input
                control={control}
                errorMessage={errors.noticeboardType && errors.noticeboardType.message}
                hidden
                name={'noticeboardType'}
                validate
              />
            </>
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('title')}>
        <Input
          name="title"
          label={`${texts.noticeboard.inputTitle} *`}
          placeholder={texts.noticeboard.inputTitle}
          validate
          rules={{
            required: `${texts.noticeboard.inputTitle} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.title && errors.title.message}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('body')}>
        <Input
          control={control}
          errorMessage={errors.body && errors.body.message}
          inputStyle={styles.textArea}
          label={`${texts.noticeboard.inputDescription} *`}
          multiline
          name="body"
          placeholder={texts.noticeboard.inputDescription}
          rules={{
            required: `${texts.noticeboard.inputDescription} ${texts.noticeboard.inputErrorText}`
          }}
          textAlignVertical="top"
          validate
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <WrapperRow spaceBetween>
          <Input
            name="price"
            label={texts.noticeboard.inputPrice}
            placeholder={texts.noticeboard.inputPrice}
            validate
            errorMessage={errors.price && errors.price.message}
            control={control}
            row
          />
          <Input
            name="priceType"
            label={texts.noticeboard.inputPriceType}
            placeholder={texts.noticeboard.inputPriceTypePlaceholder}
            control={control}
            row
          />
        </WrapperRow>
      </Wrapper>

      <Wrapper noPaddingTop onLayout={registerFieldPosition('dateEnd')}>
        <Controller
          name="dateEnd"
          render={({ field: { name, onChange, value } }) => (
            <DateTimeInput
              {...{
                boldLabel: true,
                control,
                errors,
                label: texts.noticeboard.inputDate(requestedDateDifference),
                maximumDate: moment().add(requestedDateDifference, 'months').toDate(),
                minimumDate: moment().toDate(),
                mode: 'date',
                name,
                onChange,
                placeholder: texts.noticeboard.inputDate(requestedDateDifference),
                required: true,
                value
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      {showDocument && (
        <Wrapper noPaddingTop>
          <Controller
            name="documents"
            control={control}
            render={({ field }) => (
              <DocumentSelector
                {...{
                  configuration: {
                    limitation: {
                      maxCount: maxDocumentCount,
                      maxFileSize: documentMaxSizes?.file
                    }
                  },
                  control,
                  field
                }}
                item={{
                  buttonTitle: texts.noticeboard.addDocuments,
                  infoText:
                    maxDocumentCount && texts.noticeboard.alerts.documentHint(maxDocumentCount)
                }}
              />
            )}
          />
        </Wrapper>
      )}

      {showImage && (
        <Wrapper noPaddingTop>
          <Controller
            name="image"
            render={({ field }) => (
              <MultiImageSelector
                {...{
                  control,
                  configuration: {
                    limitation: {
                      maxCount: maxImageCount,
                      maxFileSize: imageMaxSizes?.file
                    }
                  },
                  errorType: IMAGE_SELECTOR_ERROR_TYPES.NOTICEBOARD,
                  field,
                  isDeletable: !isEdit,
                  isMultiImages: true,
                  item: {
                    buttonTitle: texts.noticeboard.addImages,
                    infoText: maxImageCount && texts.noticeboard.alerts.imageHint(maxImageCount),
                    name: 'image'
                  },
                  selectorType: IMAGE_SELECTOR_TYPES.NOTICEBOARD
                }}
              />
            )}
            control={control}
          />
        </Wrapper>
      )}

      {!!consentForDataProcessingText && (
        <WrapperHorizontal>
          <HtmlView html={consentForDataProcessingText} />
        </WrapperHorizontal>
      )}

      <Wrapper onLayout={registerFieldPosition('termsOfService')}>
        <Controller
          name="termsOfService"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={!!value}
              checkedIcon={<Icon.SquareCheckFilled />}
              containerStyle={styles.checkboxContainerStyle}
              onPress={() => onChange(!value)}
              textStyle={styles.checkboxTextStyle}
              title={`${texts.noticeboard.inputCheckbox} *`}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        {loading || isLoading ? (
          <LoadingSpinner loading />
        ) : (
          <Button
            onPress={handleFormSubmit}
            title={isEdit ? texts.noticeboard.editButton : texts.noticeboard.sendButton}
          />
        )}

        <Touchable onPress={() => navigation.goBack()}>
          <RegularText primary center>
            {texts.noticeboard.abort}
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
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});
