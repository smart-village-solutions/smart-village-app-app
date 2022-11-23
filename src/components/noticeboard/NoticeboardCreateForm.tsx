import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import React from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  DateTimeInput,
  HtmlView,
  Input,
  NoticeboardAlerts,
  RegularText,
  Touchable,
  Wrapper
} from '../../components';
import { colors, consts, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { CREATE_GENERIC_ITEM } from '../../queries/genericItem';
import { NOTICEBOARD_TYPES, ScreenName } from '../../types';

const { EMAIL_REGEX } = consts;
const extendedMoment = extendMoment(moment);

type TNoticeboardCreateData = {
  body: string;
  dateEnd: string;
  dateStart: string;
  email: string;
  name: string;
  noticeboardType: NOTICEBOARD_TYPES;
  termsOfService: boolean;
  title: string;
};

const NOTICEBOARD_TYPE_OPTIONS = [
  { value: NOTICEBOARD_TYPES.OFFER, title: texts.noticeboard.categoryNames.offer },
  { value: NOTICEBOARD_TYPES.SEARCH, title: texts.noticeboard.categoryNames.search },
  {
    value: NOTICEBOARD_TYPES.NEIGHBOURLY_HELP,
    title: texts.noticeboard.categoryNames.neighbourlyHelp
  }
];

export const NoticeboardCreateForm = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const consentForDataProcessingTex = route?.params?.consentForDataProcessingText ?? '';
  const genericType = route?.params?.genericType ?? '';
  const requestedDateDifference = route?.params?.requestedDateDifference ?? 3;

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
      name: '',
      noticeboardType: '',
      termsOfService: false,
      title: ''
    }
  });

  const [createGenericItem, { loading: createLoading, error: createError }] =
    useMutation(CREATE_GENERIC_ITEM);

  const onSubmit = async (noticeboardNewData: TNoticeboardCreateData) => {
    if (!noticeboardNewData.termsOfService) return NoticeboardAlerts('termsOfService');

    const dateStart = new Date(noticeboardNewData.dateStart);
    const dateEnd = new Date(noticeboardNewData.dateEnd);
    const dateDifference = extendedMoment.range(dateStart, dateEnd).diff('months');

    if (dateDifference > requestedDateDifference || dateDifference < 0)
      return NoticeboardAlerts('dateDifference');

    try {
      await createGenericItem({
        variables: {
          categoryName: texts.noticeboard.categoryNames[noticeboardNewData.noticeboardType],
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
          ]
        }
      });
    } catch (error) {
      console.error(error, createError);
      return alert('error');
    }

    navigation.navigate(ScreenName.NoticeboardSuccess, {
      title: texts.noticeboard.successScreen.header,
      successText: texts.noticeboard.successScreen.entry
    });
  };

  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Input name="dateStart" hidden control={control} />
        <Input
          name="name"
          label={texts.noticeboard.inputName}
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

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="noticeboardType"
          rules={{ required: texts.noticeboard.alerts.noticeboardType }}
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

      <Wrapper style={styles.noPaddingTop}>
        {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
        <HtmlView html={consentForDataProcessingTex} />

        <Controller
          name="termsOfService"
          render={({ onChange, value }) => (
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
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.noticeboard.sent}
          disabled={createLoading}
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
