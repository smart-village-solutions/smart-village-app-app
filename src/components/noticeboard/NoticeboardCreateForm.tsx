import { StackNavigationProp } from '@react-navigation/stack';
import _findKey from 'lodash/findKey';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet } from 'react-native';

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
import { useStaticContent } from '../../hooks';
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
  // Carpool specific fields
  age?: string;
  autoBrand?: string;
  autoColor?: string;
  availablePlaces?: string;
  comments?: string;
  departureAddress?: string;
  departureDate?: string;
  departureTime?: string;
  destinationAddress?: string;
  drivingFrequency?: string;
  drivingFrequencyDays?: string;
  licensePlate?: string;
};

type CarpoolInputConfig = {
  [key: string]: string[];
};

/* eslint-disable complexity */
export const NoticeboardCreateForm = ({
  data,
  navigation,
  queryVariables,
  route
}: {
  data: any;
  navigation: StackNavigationProp<any>;
  queryVariables: { [key: string]: any };
  route: any;
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
  const isCarpool = route?.params?.isCarpool ?? false;
  const [isLoading, setIsLoading] = useState(false);
  const [frequency, setFrequency] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categories } = useQuery(getQuery(QUERY_TYPES.CATEGORIES), {
    fetchPolicy,
    variables: queryVariables
  });

  const { data: carpoolInputConfig } = useStaticContent<CarpoolInputConfig>({
    name: 'carpoolInputConfig',
    type: 'json',
    skip: !isCarpool
  });

  const NOTICEBOARD_TYPE_OPTIONS = parseListItemsFromQuery(QUERY_TYPES.CATEGORIES, categories, '', {
    queryVariables
  }).map((item) => ({ value: item.title, title: item.title }));

  const CARPOOL_FREQUENCY_OPTIONS = [
    { value: 'oneTime', title: texts.noticeboard.carpoolFrequencyOneTime },
    { value: 'regularly', title: texts.noticeboard.carpoolFrequencyRegularly }
  ];

  const WEEK_DAYS = [
    { value: 'monday', title: texts.noticeboard.weekday.monday },
    { value: 'tuesday', title: texts.noticeboard.weekday.tuesday },
    { value: 'wednesday', title: texts.noticeboard.weekday.wednesday },
    { value: 'thursday', title: texts.noticeboard.weekday.thursday },
    { value: 'friday', title: texts.noticeboard.weekday.friday },
    { value: 'saturday', title: texts.noticeboard.weekday.saturday },
    { value: 'sunday', title: texts.noticeboard.weekday.sunday }
  ];

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
      title: data?.title ?? '',
      // Carpool specific fields
      age: data?.age ?? '',
      autoBrand: data?.autoBrand ?? '',
      autoColor: data?.autoColor ?? '',
      availablePlaces: data?.availablePlaces ?? '',
      comments: data?.comments ?? '',
      departureAddress: data?.departureAddress ?? '',
      departureDate: data?.departureDate ?? moment().toDate(),
      departureTime: data?.departureTime ?? moment().toDate(),
      destinationAddress: data?.destinationAddress ?? '',
      drivingFrequency: data?.drivingFrequency ?? '',
      drivingFrequencyDays: data?.drivingFrequencyDays ?? '[]',
      licensePlate: data?.licensePlate ?? ''
    }
  });

  const [createGenericItem, { loading }] = useMutation(CREATE_GENERIC_ITEM);
  let imageUrl: string | undefined;
  let documentUrl: string | undefined;

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

      // check if any document size is bigger than `imageMaxSizes.file`
      for (const image of images) {
        if (!!imageMaxSizes.file && image.size > imageMaxSizes.file) {
          setIsLoading(false);
          return Alert.alert(
            texts.noticeboard.alerts.hint,
            texts.noticeboard.alerts.imageSizeError(formatSizeStandard(imageMaxSizes.file))
          );
        }
      }

      // check if documents size is bigger than `imageMaxSizes.total`
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
          payload: noticeboardNewData,
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

  return (
    <>
      <Input name="dateStart" hidden control={control} />

      <Wrapper noPaddingTop>
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

      <Wrapper noPaddingTop>
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

      {!!isCarpool && (
        <Wrapper noPaddingTop>
          <Input
            name="age"
            label={`${texts.noticeboard.inputAge} *`}
            placeholder={texts.noticeboard.inputAge}
            validate
            keyboardType="numeric"
            rules={{
              required: `${texts.noticeboard.inputAge} ${texts.noticeboard.inputErrorText}`,
              min: {
                value: 18,
                message: texts.noticeboard.alerts.ageMin
              },
              max: {
                value: 99,
                message: texts.noticeboard.alerts.ageMax
              }
            }}
            errorMessage={errors.age && errors.age.message}
            control={control}
          />
        </Wrapper>
      )}

      <Wrapper noPaddingTop>
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
                  onPress={() => {
                    if (isCarpool) {
                      setSelectedCategory(noticeboardItem.value);
                    }
                    onChange(noticeboardItem.value);
                  }}
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

      {(!isCarpool || carpoolInputConfig?.[selectedCategory]?.includes('title')) && (
        <Wrapper noPaddingTop>
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
      )}

      {(!isCarpool || carpoolInputConfig?.[selectedCategory]?.includes('body')) && (
        <Wrapper noPaddingTop>
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
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('departureDate') && (
        <Wrapper noPaddingTop>
          <Controller
            name="departureDate"
            render={({ field: { name, onChange, value } }) => (
              <DateTimeInput
                {...{
                  boldLabel: true,
                  control,
                  errors,
                  label: `${texts.noticeboard.inputDepartureDate} *`,
                  minimumDate: moment().toDate(),
                  mode: 'date',
                  name,
                  onChange,
                  placeholder: texts.noticeboard.inputDepartureDate,
                  required: true,
                  value
                }}
              />
            )}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('departureTime') && (
        <Wrapper noPaddingTop>
          <Controller
            name="departureTime"
            render={({ field: { name, onChange, value } }) => (
              <DateTimeInput
                {...{
                  boldLabel: true,
                  control,
                  errors,
                  label: `${texts.noticeboard.inputDepartureTime} *`,
                  minimumDate: moment().toDate(),
                  mode: 'time',
                  name,
                  onChange,
                  placeholder: texts.noticeboard.inputDepartureTime,
                  required: true,
                  value
                }}
              />
            )}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('departureAddress') && (
        <Wrapper noPaddingTop>
          <Input
            name="departureAddress"
            label={`${texts.noticeboard.inputDepartureAddress} *`}
            placeholder={texts.noticeboard.inputDepartureAddress}
            validate
            rules={{
              required: `${texts.noticeboard.inputDepartureAddress} ${texts.noticeboard.inputErrorText}`
            }}
            errorMessage={errors.departureAddress && errors.departureAddress.message}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('destinationAddress') && (
        <Wrapper noPaddingTop>
          <Input
            name="destinationAddress"
            label={`${texts.noticeboard.inputDestinationAddress} *`}
            placeholder={texts.noticeboard.inputDestinationAddress}
            validate
            rules={{
              required: `${texts.noticeboard.inputDestinationAddress} ${texts.noticeboard.inputErrorText}`
            }}
            errorMessage={errors.destinationAddress && errors.destinationAddress.message}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('drivingFrequency') && (
        <Wrapper noPaddingTop>
          <Label bold>{texts.noticeboard.drivingFrequency} *</Label>
          <Controller
            name="drivingFrequency"
            render={({ field: { onChange, value } }) => (
              <>
                {CARPOOL_FREQUENCY_OPTIONS.map(
                  (carpoolFrequencyItem: { value: string; title: string }) => (
                    <Checkbox
                      checked={value === carpoolFrequencyItem.value}
                      checkedIcon={<Icon.CircleCheckFilled />}
                      containerStyle={styles.checkboxContainerStyle}
                      key={carpoolFrequencyItem.title}
                      onPress={() => {
                        setFrequency(carpoolFrequencyItem.value);
                        onChange(carpoolFrequencyItem.value);
                      }}
                      title={carpoolFrequencyItem.title}
                      uncheckedIcon={<Icon.Circle color={colors.placeholder} />}
                    />
                  )
                )}
                <Input
                  control={control}
                  errorMessage={errors.drivingFrequency && errors.drivingFrequency.message}
                  hidden
                  name={'drivingFrequency'}
                  validate
                />
              </>
            )}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && frequency === CARPOOL_FREQUENCY_OPTIONS[1].value && (
        <Wrapper noPaddingTop>
          <Label bold>{texts.noticeboard.selectDrivingDays}</Label>
          <Controller
            name="drivingFrequencyDays"
            control={control}
            render={({ field: { onChange, value } }) => {
              // Parse value if it's a stringified array
              let days: string[] = [];
              if (Array.isArray(value)) {
                days = value;
              } else if (typeof value === 'string') {
                try {
                  const parsed = JSON.parse(value);
                  days = Array.isArray(parsed) ? parsed : [];
                } catch {
                  days = [];
                }
              }
              return (
                <>
                  {WEEK_DAYS.map((weekDaysItem: { value: string; title: string }) => {
                    const isChecked = days.includes(weekDaysItem.value);

                    return (
                      <Checkbox
                        checked={isChecked}
                        checkedIcon={<Icon.CircleCheckFilled />}
                        containerStyle={styles.checkboxContainerStyle}
                        key={weekDaysItem.title}
                        onPress={() => {
                          let newValue;
                          if (isChecked) {
                            newValue = days.filter((v: string) => v !== weekDaysItem.value);
                          } else {
                            newValue = [...days, weekDaysItem.value];
                          }
                          onChange(newValue);
                        }}
                        title={weekDaysItem.title}
                        uncheckedIcon={<Icon.Circle color={colors.placeholder} />}
                      />
                    );
                  })}
                  <Input
                    control={control}
                    errorMessage={
                      errors.drivingFrequencyDays && errors.drivingFrequencyDays.message
                    }
                    hidden
                    name={'drivingFrequencyDays'}
                    validate
                  />
                </>
              );
            }}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('availablePlaces') && (
        <Wrapper>
          <Input
            name="availablePlaces"
            label={`${texts.noticeboard.inputAvailablePlaces} *`}
            placeholder={texts.noticeboard.inputAvailablePlaces}
            validate
            keyboardType="numeric"
            rules={{
              required: `${texts.noticeboard.inputAvailablePlaces} ${texts.noticeboard.inputErrorText}`,
              pattern: {
                value: /^\d+$/,
                message: texts.noticeboard.inputAvailablePlacesError
              }
            }}
            errorMessage={errors.availablePlaces && errors.availablePlaces.message}
            control={control}
          />
        </Wrapper>
      )}

      {(!isCarpool || carpoolInputConfig?.[selectedCategory]?.includes('price')) && (
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
      )}

      {(!isCarpool || carpoolInputConfig?.[selectedCategory]?.includes('dateEnd')) && (
        <Wrapper noPaddingTop>
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
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('licensePlate') && (
        <Wrapper noPaddingTop>
          <Input
            name="licensePlate"
            label={texts.noticeboard.inputLicensePlate}
            placeholder={texts.noticeboard.inputLicensePlate}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('autoBrand') && (
        <Wrapper noPaddingTop>
          <Input
            name="autoBrand"
            label={texts.noticeboard.inputAutoBrand}
            placeholder={texts.noticeboard.inputAutoBrand}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('autoColor') && (
        <Wrapper noPaddingTop>
          <Input
            name="autoColor"
            label={texts.noticeboard.inputAutoColor}
            placeholder={texts.noticeboard.inputAutoColor}
            control={control}
          />
        </Wrapper>
      )}

      {!!isCarpool && carpoolInputConfig?.[selectedCategory]?.includes('comments') && (
        <Wrapper noPaddingTop>
          <Input
            control={control}
            inputStyle={styles.textArea}
            label={texts.noticeboard.inputComments}
            multiline
            name="comments"
            placeholder={texts.noticeboard.inputComments}
            textAlignVertical="top"
            validate
          />
        </Wrapper>
      )}

      {!isCarpool && showDocument && (
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

      {!isCarpool && showImage && (
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

      {(!isCarpool || carpoolInputConfig?.[selectedCategory]?.includes('termsOfService')) && (
        <>
          {!!consentForDataProcessingText && (
            <WrapperHorizontal>
              <HtmlView html={consentForDataProcessingText} />
            </WrapperHorizontal>
          )}

          <Wrapper>
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
        </>
      )}

      {(!isCarpool || !!selectedCategory) && (
        <Wrapper noPaddingTop>
          {loading || isLoading ? (
            <LoadingSpinner loading />
          ) : (
            <Button
              onPress={handleSubmit(onSubmit)}
              title={
                isCarpool
                  ? texts.noticeboard.sendCarpool
                  : isEdit
                  ? texts.noticeboard.editButton
                  : texts.noticeboard.sendButton
              }
            />
          )}

          <Touchable onPress={() => navigation.goBack()}>
            <RegularText primary center>
              {texts.noticeboard.abort}
            </RegularText>
          </Touchable>
        </Wrapper>
      )}
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
