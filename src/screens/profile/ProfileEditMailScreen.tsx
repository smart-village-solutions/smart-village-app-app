import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  LOGIN_MODAL,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperVertical
} from '../../components';
import { consts, normalize, texts } from '../../config';
import { profileEditMail } from '../../queries/profile';
import { ProfileEditMail } from '../../types';

const { EMAIL_REGEX } = consts;

const showUpdateFailAlert = () =>
  Alert.alert(texts.profile.updateProfileFailedTitle, texts.profile.updateProfileFailedBody);

const showUpdateSuccessAlert = ({ onPress }: { onPress: () => void }) =>
  Alert.alert(texts.profile.showUpdateSuccessAlertTitle, texts.profile.showUpdateSuccessAlertBody, [
    {
      text: texts.profile.ok,
      onPress
    }
  ]);

export const ProfileEditMailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const from = route.params?.from ?? '';

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ProfileEditMail>({
    defaultValues: {
      email: ''
    }
  });

  const {
    mutate: mutateUpdate,
    isError,
    isLoading,
    isSuccess,
    reset,
    data
  } = useMutation(profileEditMail);

  const onSubmit = (updateData: ProfileEditMail) =>
    mutateUpdate(updateData, {
      onSuccess: (responseData) => {
        if (!responseData?.member) {
          return;
        }

        showUpdateSuccessAlert({
          onPress: () => (from === LOGIN_MODAL ? navigation.popToTop() : navigation.goBack())
        });
      }
    });

  if (isError || (isSuccess && !data?.member)) {
    showUpdateFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.updateMail} />
          </WrapperVertical>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.profile.email}
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
              inputContainerStyle={styles.inputContainer}
            />
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.updateMail}
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
  },
  inputContainer: {
    height: normalize(45)
  }
});
