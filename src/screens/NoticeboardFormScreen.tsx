import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useCallback, useContext, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Control, Controller, DeepMap, FieldValues, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  BoldText,
  Button,
  Checkbox,
  DateTimeInput,
  HtmlView,
  Input,
  LoadingContainer,
  RegularText,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  Wrapper,
  WrapperRow
} from '../components';
import { colors, consts, device, texts } from '../config';
import { momentFormat } from '../helpers';
import { useStaticContent } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { CREATE_GENERIC_ITEM, CREATE_GENERIC_ITEM_MESSAGE } from '../queries/genericItem';
import { NOTICEBOARD_TYPES, ScreenName } from '../types';

const { EMAIL_REGEX } = consts;
const a11yText = consts.a11yLabel;
const extendedMoment = extendMoment(moment);

type NoticeboardFormScreenDataType = {
  contentBlocks: [{ body: string; title: string }];
  createdAt?: string;
  dates: [{ dateEnd: string; dateStart: string }];
  id: string | number;
  title: string;
};

type NoticeboardData = {
  body: string;
  dateEnd: string;
  dateStart: string;
  email: string;
  message: string;
  name: string;
  noticeboardType: NOTICEBOARD_TYPES;
  phoneNumber: string;
  termsOfService: boolean;
  title: string;
};

const NOTICEBOARD_TYPE_OPTIONS = [
  { value: NOTICEBOARD_TYPES.OFFERS, title: texts.noticeboard.categoryNames[1] },
  { value: NOTICEBOARD_TYPES.SEARCHES, title: texts.noticeboard.categoryNames[2] },
  { value: NOTICEBOARD_TYPES.NEIGHBOURLY_HELP, title: texts.noticeboard.categoryNames[0] }
];

const alert = (alertType: string) => {
  const buttonText = texts.noticeboard.abort,
    message = texts.noticeboard.alerts[alertType] ?? texts.noticeboard.alerts.error,
    title = texts.noticeboard.alerts.hint;

  return Alert.alert(title, message, [{ text: buttonText, style: 'cancel' }]);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable complexity */
export const NoticeboardFormScreen = ({
  data,
  navigation,
  route
}: {
  data: NoticeboardFormScreenDataType;
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);

  const consentForDataProcessingTex = route?.params?.consentForDataProcessingText ?? '';
  const genericItemId = data?.id ?? '';
  const genericType = route?.params?.genericType ?? '';
  const name = route?.params?.name ?? '';
  const newEntryForm = route?.params?.newEntryForm ?? false;
  const requestedDateDifference = route?.params?.requestedDateDifference ?? 3;

  const {
    data: dataHtml,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: name,
    type: 'html',
    skip: !name
  });

  const html = dataHtml || data?.contentBlocks?.[0]?.body;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetchHtml?.();
    }
    setRefreshing(false);
  }, [isConnected, refetchHtml]);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      body: '',
      dateEnd: new Date(),
      dateStart: new Date(),
      email: '',
      termsOfService: false,
      message: '',
      name: '',
      noticeboardType: '',
      phoneNumber: '',
      title: ''
    }
  });

  const [createGenericItem, { data: createItem, loading, error: createError }] =
    useMutation(CREATE_GENERIC_ITEM);
  const [
    createGenericItemMessage,
    { data: messageStatusCode, loading: messageLoading, error: messageError }
  ] = useMutation(CREATE_GENERIC_ITEM_MESSAGE);

  const onSubmit = async (noticeboardNewData: NoticeboardData) => {
    if (!noticeboardNewData.termsOfService) return alert('termsOfService');

    if (newEntryForm) {
      const dateStart = new Date(noticeboardNewData.dateStart);
      const dateEnd = new Date(noticeboardNewData.dateEnd);
      const dateDifference = extendedMoment.range(dateStart, dateEnd).diff('months');

      if (dateDifference > requestedDateDifference || dateDifference < 0)
        return alert('dateDifference');

      if (!noticeboardNewData.noticeboardType) return alert('noticeboardType');

      try {
        await createGenericItem({
          variables: {
            categoryName: texts.noticeboard.categoryNames[noticeboardNewData.noticeboardType],
            genericType,
            publishedAt: momentFormat(noticeboardNewData.dateStart),
            title: noticeboardNewData.title,
            contentBlocks: [{ body: noticeboardNewData.body, title: noticeboardNewData.title }],
            dates: [
              {
                dateEnd: momentFormat(noticeboardNewData.dateEnd),
                dateStart: momentFormat(noticeboardNewData.dateStart)
              }
            ]
          }
        });
      } catch (error) {
        console.error(error, createError);
        return alert('error');
      }
    }

    try {
      await createGenericItemMessage({
        variables: {
          genericItemId: genericItemId,
          name: noticeboardNewData.name,
          email: noticeboardNewData.email,
          phoneNumber: noticeboardNewData.phoneNumber,
          message: noticeboardNewData.message,
          termsOfService: noticeboardNewData.termsOfService
        }
      });
    } catch (error) {
      console.error(error, messageError);
      return alert('error');
    }

    navigation.navigate(ScreenName.NoticeboardSuccess, {
      title: texts.noticeboard.successScreen.header,
      successText: newEntryForm
        ? texts.noticeboard.successScreen.entry
        : texts.noticeboard.successScreen.application
    });
  };

  if (loadingHtml) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      {!!data?.contentBlocks?.[0]?.title && (
        <>
          <TitleContainer>
            <Title accessibilityLabel={`(${texts.noticeboard.noticeboard}) ${a11yText.heading}`}>
              {data.contentBlocks[0].title}
            </Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </>
      )}

      {!!html && (
        <Wrapper>
          {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
          <HtmlView html={html} />
        </Wrapper>
      )}

      {!!data?.dates?.[0]?.dateStart && (
        <Wrapper>
          <WrapperRow>
            <BoldText>{texts.noticeboard.publicationDate}: </BoldText>
            <RegularText>{momentFormat(data.dates[0].dateStart)}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}

      {!!data?.dates?.[0]?.dateEnd && (
        <Wrapper>
          <WrapperRow>
            <BoldText>{texts.noticeboard.expiryDate}: </BoldText>
            <RegularText>{momentFormat(data.dates[0].dateEnd)}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}

      <Wrapper style={styles.noPaddingTop}>
        <Input name="dateStart" hidden control={control} />
        <Input
          name="name"
          label={texts.noticeboard.inputName}
          placeholder={texts.noticeboard.inputName}
          validate
          rules={{ required: `${texts.noticeboard.inputName} ${texts.noticeboard.inputErrorText}` }}
          errorMessage={errors.name && errors.name.message}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="email"
          label={texts.noticeboard.inputMail}
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

      {newEntryForm
        ? entryForm({ control, errors, requestedDateDifference })
        : applicationForm({ control, errors })}

      <Wrapper style={styles.noPaddingTop}>
        {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
        <HtmlView html={consentForDataProcessingTex} />

        <Controller
          name="termsOfService"
          render={({ onChange, value }) => (
            <>
              <Checkbox
                checked={!!value}
                onPress={() => onChange(!value)}
                title={texts.noticeboard.inputCheckbox}
                checkedColor={colors.accent}
                checkedIcon="check-square-o"
                uncheckedColor={colors.darkText}
                uncheckedIcon="square-o"
                containerStyle={styles.checkboxContainerStyle}
                textStyle={styles.checkboxTextStyle}
                link={undefined}
                center={undefined}
                linkDescription={undefined}
              />
            </>
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.noticeboard.sent}
          disabled={loading}
        />

        <Touchable onPress={() => navigation.goBack()}>
          <RegularText primary center>
            {texts.noticeboard.abort}
          </RegularText>
        </Touchable>
      </Wrapper>
    </ScrollView>
  );
};
/* eslint-enable complexity */

const entryForm = ({
  control,
  errors,
  requestedDateDifference
}: {
  control: Control<FieldValues>;
  errors: DeepMap<any, string>;
  requestedDateDifference: string;
}) => {
  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="noticeboardType"
          render={({ onChange, value }) => (
            <>
              {NOTICEBOARD_TYPE_OPTIONS.map((noticeboardItem) => (
                <Checkbox
                  key={noticeboardItem.title}
                  checked={value === noticeboardItem.value}
                  onPress={() => onChange(noticeboardItem.value)}
                  title={noticeboardItem.title}
                  checkedColor={colors.accent}
                  uncheckedColor={colors.darkText}
                  containerStyle={styles.checkboxContainerStyle}
                  textStyle={styles.checkboxTextStyle}
                  link={undefined}
                  center={undefined}
                  linkDescription={undefined}
                  checkedIcon={undefined}
                  uncheckedIcon={undefined}
                />
              ))}
            </>
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="title"
          label={texts.noticeboard.inputTitle}
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
          name="body"
          label={texts.noticeboard.inputDescription}
          placeholder={texts.noticeboard.inputDescription}
          validate
          multiline
          rules={{
            required: `${texts.noticeboard.inputDescription} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.body && errors.body.message}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="dateEnd"
          render={({ name, onChange, value }) => (
            <DateTimeInput
              {...{
                mode: 'date',
                errors,
                required: true,
                value,
                onChange,
                name,
                label: texts.noticeboard.inputDate(requestedDateDifference),
                placeholder: texts.noticeboard.inputDate(requestedDateDifference),
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
    </>
  );
};

const applicationForm = ({
  control,
  errors
}: {
  control: Control<FieldValues>;
  errors: DeepMap<any, string>;
}) => {
  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="phoneNumber"
          label={texts.noticeboard.inputPhoneNumber}
          placeholder={texts.noticeboard.inputPhoneNumber}
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="body"
          label={texts.noticeboard.inputMessage}
          placeholder={texts.noticeboard.inputMessage}
          validate
          multiline
          rules={{
            required: `${texts.noticeboard.inputMessage} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.body && errors.body.message}
          control={control}
        />
      </Wrapper>
    </>
  );
};

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
  }
});
