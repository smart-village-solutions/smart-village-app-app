import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import {
  Button,
  Checkbox,
  HtmlView,
  Input,
  RegularText,
  Touchable,
  Wrapper
} from '../../components';
import { Icon, colors, consts, texts } from '../../config';
import { storeProfileAuthToken } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { CREATE_GENERIC_ITEM_MESSAGE } from '../../queries/genericItem';
import { member } from '../../queries/profile';
import { showLoginAgainAlert } from '../../screens/profile/ProfileScreen';
import { ProfileMember, ScreenName } from '../../types';

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
  const consentForDataProcessingText = subQuery?.params?.consentForDataProcessingText ?? '';
  const genericItemId = data?.id ?? '';

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

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset: resetForm
  } = useForm({
    defaultValues: {
      email: memberData?.member?.email ?? '',
      message: '',
      name: `${memberData?.member?.first_name ?? ''} ${
        memberData?.member?.last_name?.[0] ?? ''
      }`.trim(),
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

      resetForm();

      Alert.alert(
        texts.noticeboard.successScreen.header,
        texts.noticeboard.successScreen.application
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
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
        <Input
          name="phoneNumber"
          label={texts.noticeboard.inputPhoneNumber}
          placeholder={texts.noticeboard.inputPhoneNumber}
          validate
          control={control}
          keyboardType="phone-pad"
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="message"
          label={`${texts.noticeboard.inputMessage} *`}
          placeholder={texts.noticeboard.inputMessage}
          validate
          multiline
          rules={{
            required: `${texts.noticeboard.inputMessage} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.message && errors.message.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
        <HtmlView html={consentForDataProcessingText} />

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
  }
});
