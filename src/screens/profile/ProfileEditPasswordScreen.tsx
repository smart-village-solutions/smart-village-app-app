import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperVertical
} from '../../components';
import { consts, texts } from '../../config';
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
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.updatePassword} />
          </WrapperVertical>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.profile.editPasswordLabel}
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
