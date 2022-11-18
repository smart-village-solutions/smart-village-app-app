import { StackNavigationProp } from '@react-navigation/stack';
import * as Moment from 'moment';
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
import { CREATE_GENERIC_ITEM } from '../queries/genericItem';
import { NoticeboardType } from '../types';

const { EMAIL_REGEX } = consts;
const a11yText = consts.a11yLabel;

type NoticeboardFormScreenDataType = {
  contentBlocks: [{ body: string; title: string }];
  createdAt?: string;
  dates: [{ dateEnd: string; dateStart: string }];
  title: string;
};


const NOTICEBOARD_TYPE = [
  { value: NoticeboardType.Offers, title: texts.noticeboard.offers },
  { value: NoticeboardType.Searches, title: texts.noticeboard.searches },
  { value: NoticeboardType.NeighbourlyHelp, title: texts.noticeboard.neighbourlyHelp }
];
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
      consentToDataProcessing: false,
      message: '',
      name: '',
      noticeboardType: '',
      phoneNumber: '',
      title: ''
    }
  });
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
          name="consentToDataProcessing"
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
              {NOTICEBOARD_TYPE.map((noticeboardItem) => (
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
