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
import { storeVolunteerAuthToken } from '../../helpers';
import { signup } from '../../queries/volunteer';
import { VolunteerSignup } from '../../types';

const { EMAIL_REGEX } = consts;

const showSignupFailAlert = () =>
  Alert.alert(texts.profile.signupFailedTitle, texts.profile.signupFailedBody);

// eslint-disable-next-line complexity
export const ProfileResetPasswordScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const email = route.params?.email ?? '';
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<VolunteerSignup>({
    defaultValues: {
      email,
      token: ''
    }
  });

  const { mutate: mutateSignup, isLoading, isError, isSuccess, data, reset } = useMutation(signup);

  const onSubmit = (signupData: VolunteerSignup) => {
    mutateSignup(signupData, {
      onSuccess: (responseData) => {
        if (!responseData?.auth_token) {
          return;
        }

        // wait for saving auth token to global state
        return storeVolunteerAuthToken(responseData.auth_token);
      }
    });
  };

  if (isError || (isSuccess && data?.code !== 200)) {
    showSignupFailAlert();
    reset();
  }

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
