import { StackNavigationProp } from '@react-navigation/stack';
import _findKey from 'lodash/findKey';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet } from 'react-native';
import { useQuery as RQuseQuery } from 'react-query';

import {
  Button,
  Checkbox,
  DateTimeInput,
  DocumentSelector,
  HtmlView,
  Input,
  LoadingSpinner,
  MultiImageSelector,
  RegularText,
  Touchable,
  Wrapper,
  WrapperHorizontal,
  WrapperRow
} from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import { formatSizeStandard, momentFormat, storeProfileAuthToken } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { CREATE_GENERIC_ITEM } from '../../queries/genericItem';
import { uploadMediaContent } from '../../queries/mediaContent';
import { member } from '../../queries/profile';
import { showLoginAgainAlert } from '../../screens/profile/ProfileScreen';
import { SettingsContext } from '../../SettingsProvider';
import { NOTICEBOARD_TYPES, ScreenName } from '../../types';
import { ProfileMember } from '../../types/profile';

const { EMAIL_REGEX, IMAGE_SELECTOR_TYPES, IMAGE_SELECTOR_ERROR_TYPES, MEDIA_TYPES } = consts;

const extendedMoment = extendMoment(moment);

type TNoticeboardCreateData = {
  id: string;
  body: string;
  dateEnd: string;
  dateStart: string;
  documents: string;
  email: string;
  image: string;
  name: string;
  noticeboardType: NOTICEBOARD_TYPES;
  price: string;
  priceType?: string;
  title: string;
};

const NOTICEBOARD_TYPE_OPTIONS = [
  { value: NOTICEBOARD_TYPES.OFFER, title: texts.noticeboard.categoryNames.offer },
  { value: NOTICEBOARD_TYPES.SEARCH, title: texts.noticeboard.categoryNames.search }
];

/* eslint-disable complexity */
export const NoticeboardCreateForm = ({
  data,
  navigation,
  route
}: {
  data: any;
  navigation: StackNavigationProp<any>;
  queryVariables: { [key: string]: any };
  route: any;
}) => {
  const isEdit = !!Object.keys(data).length;
  const subQuery = route.params?.subQuery ?? {};
  const consentForDataProcessingText =
    subQuery?.params?.consentForDataProcessingText ??
    route?.params?.consentForDataProcessingText ??
    '';
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { showNoticeboardMediaContent = {} } = settings;
  const { document: showDocument = false, documentMaxSizes = {} } = showNoticeboardMediaContent;
  const genericType = route?.params?.genericType ?? '';
  const requestedDateDifference = route?.params?.requestedDateDifference ?? 3;
  const [isLoading, setIsLoading] = useState(false);

  const { data: memberData } = RQuseQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
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
      dateStart: moment().toDate(),
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

  useEffect(() => {
    setValue('email', memberData?.member?.email ?? '');
    setValue(
      'name',
      `${memberData?.member?.first_name ?? ''} ${memberData?.member?.last_name?.[0] ?? ''}`.trim()
    );
  }, [memberData]);

  const [createGenericItem, { loading }] = useMutation(CREATE_GENERIC_ITEM);
  let imageUrl: string | undefined;
  let documentUrl: string | undefined;

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

      // check if images size is bigger than 10MB
      if (imagesSize > 10485760) {
        setIsLoading(false);
        return Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.imagesSizeError);
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

      await createGenericItem({
        variables: {
          id: noticeboardNewData.id,
          categoryName: texts.noticeboard.categoryNames[noticeboardNewData.noticeboardType],
          genericType,
          publishedAt: momentFormat(noticeboardNewData.dateStart),
          title: noticeboardNewData.title,
          contacts: [{ email: noticeboardNewData.email, firstName: noticeboardNewData.name }],
          contentBlocks: [{ body: noticeboardNewData.body, title: noticeboardNewData.title }],
          mediaContents: documentsUrl,
          dates: [
            {
              dateEnd: momentFormat(noticeboardNewData.dateEnd),
              dateStart: momentFormat(noticeboardNewData.dateStart)
            }
          ],
          mediaContents: imageUrls,
          priceInformations: [{ description: price }]
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

      <Wrapper style={styles.noPaddingTop}>
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

      <Wrapper style={styles.noPaddingTop}>
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

      <Wrapper style={styles.noPaddingTop}>
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

      <Wrapper style={styles.noPaddingTop}>
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

      <Wrapper style={styles.noPaddingTop}>
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

      <Wrapper style={styles.noPaddingTop}>
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

      <Wrapper style={styles.noPaddingTop}>
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
        <Wrapper style={styles.noPaddingTop}>
          <Controller
            name="documents"
            control={control}
            render={({ field }) => (
              <DocumentSelector
                {...{ control, field }}
                maxFileSize={documentMaxSizes.file}
                item={{
                  buttonTitle: texts.noticeboard.addDocuments,
                  infoTitle: texts.noticeboard.documentsInfo
                }}
              />
            )}
          />
        </Wrapper>
      )}

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="image"
          render={({ field }) => (
            <MultiImageSelector
              {...{
                control,
                errorType: IMAGE_SELECTOR_ERROR_TYPES.NOTICEBOARD,
                field,
                isDeletable: !isEdit,
                isMultiImages: true,
                item: {
                  buttonTitle: texts.noticeboard.addImages,
                  name: 'image'
                },
                selectorType: IMAGE_SELECTOR_TYPES.NOTICEBOARD
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      {!!consentForDataProcessingText && (
        <WrapperHorizontal>
          <HtmlView html={consentForDataProcessingText} />
        </WrapperHorizontal>
      )}

      <Wrapper style={styles.noPaddingTop}>
        {loading || isLoading ? (
          <LoadingSpinner loading />
        ) : (
          <Button
            onPress={handleSubmit(onSubmit)}
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
  noPaddingTop: {
    paddingTop: 0
  },
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
