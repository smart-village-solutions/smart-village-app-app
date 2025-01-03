import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  HtmlView,
  Input,
  RegularText,
  Touchable,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { Icon, colors, consts, normalize, texts } from '../../config';
import { CREATE_GENERIC_ITEM_MESSAGE } from '../../queries/genericItem';

const { EMAIL_REGEX } = consts;

type NoticeboardFormScreenDataType = {
  id: string | number;
};

type TNoticeboardMessageData = {
  email: string;
  message: string;
  name: string;
  phoneNumber: string;
  termsOfService: boolean;
};

export const NoticeboardMessageForm = ({
  data,
  navigation,
  route
}: {
  data: NoticeboardFormScreenDataType;
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const subQuery = route.params?.subQuery ?? {};
  const consentForDataProcessingText =
    subQuery?.params?.consentForDataProcessingText ??
    route?.params?.consentForDataProcessingText ??
    '';
  const genericItemId = data?.id ?? '';

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm({
    defaultValues: {
      email: '',
      message: '',
      name: '',
      phoneNumber: '',
      termsOfService: false
    }
  });

  const [createGenericItemMessage, { loading }] = useMutation(CREATE_GENERIC_ITEM_MESSAGE);

  const onSubmit = async (noticeboardNewData: TNoticeboardMessageData) => {
    Keyboard.dismiss();

    if (!noticeboardNewData.termsOfService) {
      return Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.termsOfService);
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

      Alert.alert(
        texts.noticeboard.successScreen.header,
        texts.noticeboard.successScreen.application
      );
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          errorMessage={errors.name && errors.name.message}
          label={`${texts.noticeboard.inputName} *`}
          name="name"
          placeholder={texts.noticeboard.inputName}
          rules={{
            required: `${texts.noticeboard.inputName} ${texts.noticeboard.inputErrorText}`
          }}
          validate
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          errorMessage={errors.email && errors.email.message}
          keyboardType="email-address"
          label={`${texts.noticeboard.inputMail} *`}
          name="email"
          placeholder={texts.noticeboard.inputMail}
          rules={{
            required: `${texts.noticeboard.inputMail} ${texts.noticeboard.inputErrorText}`,
            pattern: {
              value: EMAIL_REGEX,
              message: `${texts.noticeboard.inputMail}${texts.noticeboard.invalidMail}`
            }
          }}
          validate
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          keyboardType="phone-pad"
          label={texts.noticeboard.inputPhoneNumber}
          name="phoneNumber"
          placeholder={texts.noticeboard.inputPhoneNumber}
          validate
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          errorMessage={errors.message && errors.message.message}
          inputStyle={styles.textArea}
          label={`${texts.noticeboard.inputMessage} *`}
          multiline
          name="message"
          placeholder={texts.noticeboard.inputMessage}
          rules={{
            required: `${texts.noticeboard.inputMessage} ${texts.noticeboard.inputErrorText}`
          }}
          textAlignVertical="top"
          validate
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
              title={`${texts.noticeboard.inputCheckbox} *`}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.noticeboard.send}
          disabled={loading}
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
  },
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});
