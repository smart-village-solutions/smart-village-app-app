import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  HtmlView,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperHorizontal,
  WrapperVertical
} from '../../components';
import { colors, consts, texts } from '../../config';
import { useStaticContent } from '../../hooks';
import { profileResetPassword } from '../../queries/profile';
import { ProfileResetPassword } from '../../types';

const { EMAIL_REGEX } = consts;

export const ProfileEditPasswordScreen = ({ navigation }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ProfileResetPassword>({
    defaultValues: {
      email: ''
    }
  });

  const { mutate: mutateResetPassword, isLoading } = useMutation(profileResetPassword);

  const {
    data: dataProfileEditPasswordScreenTop,
    loading: loadingProfileEditPasswordScreenTop,
    refetch: refetchProfileEditPasswordScreenTop
  } = useStaticContent({
    name: 'profileEditPasswordScreenTop',
    type: 'html'
  });

  const {
    data: dataProfileEditPasswordScreenBottom,
    loading: loadingProfileEditPasswordScreenBottom,
    refetch: refetchProfileEditPasswordScreenBottom
  } = useStaticContent({
    name: 'profileEditPasswordScreenBottom',
    type: 'html'
  });

  const onSubmit = (resetPasswordData: ProfileResetPassword) => {
    Keyboard.dismiss();

    mutateResetPassword(resetPasswordData, {
      onSuccess: () => {
        Alert.alert(texts.profile.editPasswordAlertTitle, texts.profile.editPasswordAlertMessage, [
          {
            text: texts.profile.ok,
            onPress: () => navigation.goBack()
          }
        ]);
      }
    });
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={
                loadingProfileEditPasswordScreenTop || loadingProfileEditPasswordScreenBottom
              }
              onRefresh={() => {
                refetchProfileEditPasswordScreenTop();
                refetchProfileEditPasswordScreenBottom();
              }}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        >
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.updatePassword} />
          </WrapperVertical>

          {!!dataProfileEditPasswordScreenTop && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileEditPasswordScreenTop} />
            </WrapperHorizontal>
          )}

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={!dataProfileEditPasswordScreenTop && texts.profile.editPasswordLabel}
              placeholder={texts.profile.email}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.profile.emailError,
                pattern: { value: EMAIL_REGEX, message: texts.profile.emailInvalid }
              }}
              errorMessage={errors.email && errors.email.message}
              control={control}
            />
          </Wrapper>

          {!!dataProfileEditPasswordScreenBottom && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileEditPasswordScreenBottom} />
            </WrapperHorizontal>
          )}

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.updatePassword}
              disabled={isLoading}
            />
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
