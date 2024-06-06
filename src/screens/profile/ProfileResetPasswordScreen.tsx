import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperVertical
} from '../../components';
import { consts, texts } from '../../config';
import { profileResetPassword } from '../../queries/profile';
import { ProfileResetPassword, ScreenName } from '../../types';

const { EMAIL_REGEX } = consts;

export const ProfileResetPasswordScreen = ({ navigation }: StackScreenProps<any>) => {
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

  const onSubmit = (resetPasswordData: ProfileResetPassword) => {
    Keyboard.dismiss();

    mutateResetPassword(resetPasswordData, {
      onSuccess: () => {
        Alert.alert(
          texts.profile.resetPasswordAlertTitle,
          texts.profile.resetPasswordAlertMessage,
          [
            {
              text: texts.profile.ok,
              onPress: () => navigation.navigate(ScreenName.ProfileLogin)
            }
          ]
        );
      }
    });
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.resetPasswordTitle} />
          </WrapperVertical>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.profile.resetPasswordLabel}
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

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.send}
              disabled={isLoading}
            />

            <RegularText />

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <RegularText primary center underline>
                {texts.profile.back}
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
  center: {
    alignItems: 'center'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
