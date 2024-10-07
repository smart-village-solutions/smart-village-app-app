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
  HtmlView,
  Input,
  RegularText,
  Touchable,
  Wrapper,
  WrapperHorizontal,
  WrapperRow
} from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import { graphqlFetchPolicy, momentFormat, parseListItemsFromQuery } from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { CREATE_GENERIC_ITEM } from '../../queries/genericItem';
import { uploadMediaContent } from '../../queries/mediaContent';
import { NOTICEBOARD_TYPES } from '../../types';
import { MultiImageSelector } from '../selectors';

const { EMAIL_REGEX, IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;
const extendedMoment = extendMoment(moment);

type TNoticeboardCreateData = {
  id: string;
  body: string;
  dateEnd: string;
  dateStart: string;
  email: string;
  image: string;
  name: string;
  noticeboardType: NOTICEBOARD_TYPES;
  termsOfService: boolean;
  price: string;
  priceType?: string;
  title: string;
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

  const existingImageUrl = data?.mediaContents?.[0]?.sourceUrl?.url;

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
      email: data?.contacts?.[0]?.email ?? '',
      image: existingImageUrl ? JSON.stringify([{ uri: existingImageUrl }]) : '[]',
      name: data?.contacts?.[0]?.firstName ?? '',
      noticeboardType:
        _findKey(
          texts.noticeboard.categoryNames,
          (value) => value === data?.categories?.[0]?.name
        ) || '',
      price: data?.priceInformations?.[0]?.description?.replace('€', '').trim() ?? '',
      priceType: data?.priceInformations?.[0]?.priceType ?? '€',
      title: data?.title ?? ''
    }
  });

  const [createGenericItem, { loading }] = useMutation(CREATE_GENERIC_ITEM);
  let imageUrl: string | undefined;

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
      const image = JSON.parse(noticeboardNewData.image);

      if (image?.length) {
        try {
          imageUrl = await uploadMediaContent(image[0], 'image');
        } catch (error) {
          setIsLoading(false);

          Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.imageUploadError);
          return;
        }
      }

      await createGenericItem({
        variables: {
          id: noticeboardNewData.id,
          categoryName: noticeboardNewData.noticeboardType,
          genericType,
          publishedAt: momentFormat(noticeboardNewData.dateStart),
          title: noticeboardNewData.title,
          contacts: [{ email: noticeboardNewData.email, firstName: noticeboardNewData.name }],
          contentBlocks: [{ body: noticeboardNewData.body, title: noticeboardNewData.title }],
          dates: [
            {
              dateEnd: momentFormat(noticeboardNewData.dateEnd),
              dateStart: momentFormat(noticeboardNewData.dateStart)
            }
          ],
          mediaContents: [{ sourceUrl: { url: imageUrl }, contentType: 'image' }],
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

      <Wrapper style={styles.noPaddingTop}>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.noticeboard.send}
          disabled={loading || isLoading}
        />

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
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  },
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});
