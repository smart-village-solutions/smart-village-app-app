import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper
} from '../../components';
import { texts } from '../../config';
import { VOUCHER_MEMBER_ID, storeVoucherAuthToken } from '../../helpers/voucherHelper';
import { logIn } from '../../queries/vouchers';
import { ScreenName, VoucherLogin } from '../../types';
import { addToStore } from '../../helpers';

const showLoginFailAlert = () =>
  Alert.alert(texts.voucher.loginFailedTitle, texts.voucher.loginFailedBody);

// eslint-disable-next-line complexity
export const VoucherLoginScreen = ({ navigation }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<VoucherLogin>({
    defaultValues: {
      key: '',
      secret: ''
    }
  });

  const { mutate: mutateLogIn, isLoading, isError, isSuccess, data, reset } = useMutation(logIn);

  const onSubmit = (loginData: VoucherLogin) =>
    mutateLogIn(loginData, {
      onSuccess: (responseData) => {
        if (!responseData?.member) {
          return;
        }

        // save auth token and member id to global state
        storeVoucherAuthToken(responseData.member.authentication_token);
        addToStore(VOUCHER_MEMBER_ID, responseData.member.id);

        // refreshAuth param causes the home screen to update and no longer show the login button
        navigation.navigate(ScreenName.VoucherHome, { refreshAuth: new Date().valueOf() });
      }
    });

  if (isError || (isSuccess && !data?.success)) {
    showLoginFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <SectionHeader title={texts.voucher.loginTitle} big />

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="key"
              label={texts.voucher.key}
              placeholder={texts.voucher.key}
              validate
              rules={{ required: true }}
              errorMessage={errors.key && `${texts.voucher.key} muss ausgefüllt werden`}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="secret"
              label={texts.voucher.secret}
              placeholder={texts.voucher.secret}
              validate
              rules={{ required: true }}
              errorMessage={errors.secret && `${texts.voucher.secret} muss ausgefüllt werden`}
              control={control}
            />
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.voucher.login}
              disabled={isLoading}
              notFullWidth
            />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <RegularText primary center>
                {texts.voucher.abort}
              </RegularText>
            </TouchableOpacity>
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
