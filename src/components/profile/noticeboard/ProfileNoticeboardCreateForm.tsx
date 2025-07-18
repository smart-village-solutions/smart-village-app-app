import { StackNavigationProp } from '@react-navigation/stack';
import _findKey from 'lodash/findKey';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery as useQueryWithApollo } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import {
  Button,
  Checkbox,
  DateTimeInput,
  HtmlView,
  Input,
  Label,
  LoadingSpinner,
  RegularText,
  Touchable,
  Wrapper,
  WrapperHorizontal,
  WrapperRow
} from '../../../components';
import { colors, consts, Icon, normalize, texts } from '../../../config';
import {
  formatSizeStandard,
  graphqlFetchPolicy,
  momentFormat,
  parseListItemsFromQuery,
  storeProfileAuthToken
} from '../../../helpers';
import { useStaticContent } from '../../../hooks';
import { NetworkContext } from '../../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../../queries';
import { CREATE_GENERIC_ITEM } from '../../../queries/genericItem';
import { uploadMediaContent } from '../../../queries/mediaContent';
import { member } from '../../../queries/profile';
import { showLoginAgainAlert } from '../../../screens/profile/ProfileScreen';
import { SettingsContext } from '../../../SettingsProvider';
import { NOTICEBOARD_TYPES, ProfileMember, ScreenName } from '../../../types';
import { DocumentSelector, MultiImageSelector } from '../../selectors';

const {
  EMAIL_REGEX,
  IMAGE_SELECTOR_ERROR_TYPES,
  IMAGE_SELECTOR_TYPES,
  MEDIA_TYPES,
  REFRESH_INTERVALS
} = consts;

const extendedMoment = extendMoment(moment);

const CARPOOL_FREQUENCY_OPTIONS = [
  { value: 'oneTime', title: texts.noticeboard.carpoolFrequency.oneTime },
  { value: 'regularly', title: texts.noticeboard.carpoolFrequency.regularly }
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

type TNoticeboardCreateData = {
  body: string;
  dateEnd: string;
  dateStart: string;
  email: string;
  id: string;
  image: string;
  name: string;
  noticeboardType: NOTICEBOARD_TYPES;
  price: string;
  priceType?: string;
  title: string;
  // Carpool specific fields
  age?: string;
  availablePlaces?: string;
  carBrand?: string;
  carColor?: string;
  comments?: string;
  departureAddress?: string;
  departureDate?: string;
  departureTime?: string;
  destinationAddress?: string;
  drivingFrequency?: string;
  drivingFrequencyDays?: string | string[];
  licensePlate?: string;
};

/* eslint-disable complexity */
export const ProfileNoticeboardCreateForm = ({
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
  const isCarpool = (route?.params?.isCarpool || !!data?.payload?.departureDate) ?? false;
  const [isLoading, setIsLoading] = useState(false);
  const [frequency, setFrequency] = useState<string | undefined>(data?.payload?.drivingFrequency);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    data?.categories?.[0]?.name || ''
  );

  const { data: memberData } = useQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    onSuccess: (responseData: ProfileMember) => {
      if (!responseData?.member) {
        storeProfileAuthToken();

        showLoginAgainAlert({
          onPress: () =>
            navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() })
        });

        return;
      }
    }
  });

  const { data: categories } = useQueryWithApollo(getQuery(QUERY_TYPES.CATEGORIES), {
    enabled: isCarpool && !isEdit,
    fetchPolicy,
    variables: queryVariables
  });

  const NOTICEBOARD_TYPE_OPTIONS = !isCarpool
    ? [
        { value: NOTICEBOARD_TYPES.OFFER, title: texts.noticeboard.categoryNames.offer },
        { value: NOTICEBOARD_TYPES.SEARCH, title: texts.noticeboard.categoryNames.search }
      ]
    : parseListItemsFromQuery(QUERY_TYPES.CATEGORIES, categories, '', {
        queryVariables
      }).map((item) => ({ value: item.title, title: item.title }));

  const { data: carpoolInputConfig } = useStaticContent({
    name: 'carpoolInputConfig',
    refreshInterval: REFRESH_INTERVALS.ONCE_PER_HOUR,
    type: 'json',
    skip: !isCarpool
  });

  const formImages = data?.mediaContents?.map((image: any) => {
    const uri = image.sourceUrl.url;
    const uriSplitForImageName = uri.split('/');
    const imageName = uriSplitForImageName[uriSplitForImageName.length - 1];

    return { id: image.id, infoText: imageName, uri };
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
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
      noticeboardType: isCarpool
        ? data?.categories?.[0]?.name || ''
        : _findKey(
            texts.noticeboard.categoryNames,
            (value) => value === data?.categories?.[0]?.name
          ) || '',
      price: data?.priceInformations?.[0]?.description?.replace('€', '').trim() ?? '',
      priceType: data?.priceInformations?.[0]?.priceType ?? '€',
      title: data?.title ?? '',
      // Carpool specific fields
      age: data?.payload?.age ?? '',
      availablePlaces: data?.payload?.availablePlaces ?? '',
      carBrand: data?.payload?.carBrand ?? '',
      carColor: data?.payload?.carColor ?? '',
      comments: data?.payload?.comments ?? '',
      departureAddress: data?.payload?.departureAddress ?? '',
      departureDate: data?.payload?.departureDate
        ? moment(data?.payload?.departureDate, 'DD.MM.YYYY').toDate()
        : moment().toDate(),
      departureTime: data?.payload?.departureTime
        ? moment(data?.payload?.departureTime, 'HH:mm').toDate()
        : moment().toDate(),
      destinationAddress: data?.payload?.destinationAddress ?? '',
      drivingFrequency: data?.payload?.drivingFrequency ?? '',
      drivingFrequencyDays: data?.payload?.drivingFrequencyDays?.length
        ? JSON.stringify(data?.payload?.drivingFrequencyDays)
        : '[]',
      licensePlate: data?.payload?.licensePlate ?? ''
    }
  });

  useEffect(() => {
    setValue('email', memberData?.member?.email ?? '');
    setValue(
      'name',
      `${memberData?.member?.first_name ?? ''} ${memberData?.member?.last_name?.[0] ?? ''}`.trim()
    );
  }, [memberData]);

  const [createGenericItem, { loading }] = useMutation(CREATE_GENERIC_ITEM);
  let imageUrl: string | undefined;

  const onSubmit = async (noticeboardNewData: TNoticeboardCreateData) => {
    Keyboard.dismiss();

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

      const payload = Object.fromEntries(
        Object.entries(noticeboardNewData)
          .filter(
            ([key, value]) =>
              key !== 'dateEnd' &&
              key !== 'price' &&
              carpoolInputConfig?.[selectedCategory]?.includes(key) &&
              value !== undefined &&
              value !== null
          )
          .map(([key, value]) => {
            if (key === 'departureDate' && value) {
              return [key, momentFormat(value)];
            }

            if (key === 'departureTime' && value) {
              return [key, momentFormat(value, 'HH:mm')];
            }

            if (key === 'drivingFrequencyDays' && value) {
              let array = value;

              if (typeof value === 'string') {
                try {
                  array = JSON.parse(value);
                } catch {
                  array = [];
                }
              }

              if (!Array.isArray(array)) array = [];

              return [key, array];
            }

            return [key, value];
          })
      );

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
          payload,
          priceInformations: [{ description: price }],
          publishedAt: momentFormat(noticeboardNewData.dateStart),
          title: noticeboardNewData.title
        }
      });

      navigation.goBack();
      Alert.alert(
        texts.noticeboard.successScreen.header,
        texts.noticeboard.successScreen.entryProfile
      );
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  return (
    <>
      <Input name="dateStart" hidden control={control} />

      {!isCarpool ? (
        <>
          <Wrapper noPaddingTop>
            <Input
              name="name"
              label={`${texts.noticeboard.inputName} *`}
              placeholder={texts.noticeboard.inputName}
              validate
              disabled
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

          <Wrapper noPaddingTop>
            <Label bold>{`${texts.noticeboard.selectNoticeboardType} *`}</Label>
            <Controller
              name="noticeboardType"
              rules={{ required: texts.noticeboard.alerts.noticeboardType }}
              render={({ field: { onChange, value } }) => (
                <>
                  {NOTICEBOARD_TYPE_OPTIONS.map(
                    (noticeboardItem: { value: string; title: string }) => (
                      <Checkbox
                        checked={value === noticeboardItem.value}
                        checkedIcon={<Icon.CircleCheckFilled />}
                        containerStyle={styles.checkboxContainerStyle}
                        key={noticeboardItem.title}
                        onPress={() => onChange(noticeboardItem.value)}
                        title={noticeboardItem.title}
                        uncheckedIcon={<Icon.Circle color={colors.placeholder} />}
                      />
                    )
                  )}
                  <Input
                    control={control}
                    errorMessage={errors.noticeboardType && errors.noticeboardType.message}
                    hidden
                    name="noticeboardType"
                    validate
                  />
                </>
              )}
              control={control}
            />
          </Wrapper>

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
        </>
      ) : (
        <>
          {!isEdit && (
            <Wrapper noPaddingTop>
              <Label bold>{`${texts.noticeboard.selectCarpoolType} *`}</Label>
              <Controller
                name="noticeboardType"
                rules={{ required: texts.noticeboard.alerts.carpoolType }}
                render={({ field: { onChange, value } }) => (
                  <>
                    {NOTICEBOARD_TYPE_OPTIONS.map(
                      (noticeboardItem: { value: string; title: string }) => (
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
                          title={
                            texts.noticeboard.carpoolType?.[noticeboardItem.title] ||
                            noticeboardItem.title
                          }
                          uncheckedIcon={<Icon.Circle color={colors.placeholder} />}
                        />
                      )
                    )}
                    <Input
                      control={control}
                      errorMessage={errors.noticeboardType && errors.noticeboardType.message}
                      hidden
                      name="noticeboardType"
                      validate
                    />
                  </>
                )}
                control={control}
              />
            </Wrapper>
          )}

          <Wrapper noPaddingTop>
            <Input
              name="name"
              label={`${texts.noticeboard.inputName} *`}
              placeholder={texts.noticeboard.inputName}
              validate
              disabled
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

          {carpoolInputConfig?.[selectedCategory]?.includes('age') && (
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

          {carpoolInputConfig?.[selectedCategory]?.includes('departureDate') && (
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

          {carpoolInputConfig?.[selectedCategory]?.includes('departureTime') && (
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

          {carpoolInputConfig?.[selectedCategory]?.includes('departureAddress') && (
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

          {carpoolInputConfig?.[selectedCategory]?.includes('destinationAddress') && (
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
          {carpoolInputConfig?.[selectedCategory]?.includes('drivingFrequency') && (
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
                      name="drivingFrequency"
                      validate
                    />
                  </>
                )}
                control={control}
              />
            </Wrapper>
          )}

          {frequency === CARPOOL_FREQUENCY_OPTIONS[1].value && (
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
                            checkedIcon={<Icon.SquareCheckFilled />}
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
                            uncheckedIcon={<Icon.Square color={colors.placeholder} />}
                          />
                        );
                      })}
                      <Input
                        control={control}
                        errorMessage={
                          errors.drivingFrequencyDays && errors.drivingFrequencyDays.message
                        }
                        hidden
                        name="drivingFrequencyDays"
                        validate
                      />
                    </>
                  );
                }}
              />
            </Wrapper>
          )}

          {carpoolInputConfig?.[selectedCategory]?.includes('availablePlaces') && (
            <Wrapper>
              <Input
                name="availablePlaces"
                label={texts.noticeboard.inputAvailablePlaces}
                placeholder={texts.noticeboard.inputAvailablePlaces}
                validate
                keyboardType="numeric"
                rules={{
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

          {carpoolInputConfig?.[selectedCategory]?.includes('price') && (
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

          {carpoolInputConfig?.[selectedCategory]?.includes('dateEnd') && (
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

          {carpoolInputConfig?.[selectedCategory]?.includes('licensePlate') && (
            <Wrapper noPaddingTop>
              <Input
                name="licensePlate"
                label={texts.noticeboard.inputLicensePlate}
                placeholder={texts.noticeboard.inputLicensePlate}
                control={control}
              />
            </Wrapper>
          )}

          {carpoolInputConfig?.[selectedCategory]?.includes('carBrand') && (
            <Wrapper noPaddingTop>
              <Input
                name="carBrand"
                label={texts.noticeboard.inputCarBrand}
                placeholder={texts.noticeboard.inputCarBrand}
                control={control}
              />
            </Wrapper>
          )}

          {carpoolInputConfig?.[selectedCategory]?.includes('carColor') && (
            <Wrapper noPaddingTop>
              <Input
                name="carColor"
                label={texts.noticeboard.inputCarColor}
                placeholder={texts.noticeboard.inputCarColor}
                control={control}
              />
            </Wrapper>
          )}

          {carpoolInputConfig?.[selectedCategory]?.includes('comments') && (
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
        </>
      )}

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

      <Wrapper>
        {loading || isLoading ? (
          <LoadingSpinner loading />
        ) : (
          <Button
            onPress={handleSubmit(onSubmit)}
            title={isEdit ? texts.noticeboard.editButton : texts.noticeboard.sendButton}
            disabled={isCarpool && !selectedCategory}
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
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});
