import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
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
import { consts, normalize, texts } from '../../config';
import { storeProfileAuthToken } from '../../helpers';
import { profileEditMail } from '../../queries/profile';
import { ProfileEditMail, ScreenName } from '../../types';
import { useProfileUser } from '../../hooks';

const { EMAIL_REGEX } = consts;

const showUpdateFailAlert = () =>
  Alert.alert(texts.profile.updateProfileFailedTitle, texts.profile.updateProfileFailedBody);

const showUpdateSuccessAlert = ({ onPress }: { onPress: () => void }) =>
  Alert.alert(
    texts.profile.showUpdateSuccessAlertTitle,
    texts.profile.showUpdateEmailSuccessAlertBody,
    [
      {
        text: texts.profile.ok,
        onPress
      }
    ]
  );

export const ProfileEditMailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ProfileEditMail>({
    defaultValues: {
      email: route.params?.email || ''
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
          onPress: () => {
            storeProfileAuthToken();
            navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() });
          }
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
