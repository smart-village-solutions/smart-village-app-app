import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
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
  WrapperRow
} from '../../components';
import { consts, texts } from '../../config';
import { profileResetPassword } from '../../queries/profile';
import { ProfileResetPassword, ScreenName } from '../../types';

const { EMAIL_REGEX } = consts;

// eslint-disable-next-line complexity
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

  const { mutate: mutateSignup, isLoading } = useMutation(profileResetPassword);

  const onSubmit = (resetPasswordData: ProfileResetPassword) => {
    mutateSignup(resetPasswordData, {
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
          <WrapperRow center>
            <SectionHeader big center title={texts.profile.resetPasswordTitle} />
          </WrapperRow>

          <Wrapper>
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
