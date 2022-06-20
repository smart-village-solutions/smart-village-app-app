import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { consts, texts } from '../../config';
import { storeVolunteerAuthToken, storeVolunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { me, signup } from '../../queries/volunteer';
import { ScreenName, VolunteerSignup } from '../../types';

const { a11yLabel, EMAIL_REGEX } = consts;

const showSignupFailAlert = () =>
  Alert.alert(texts.volunteer.signupFailedTitle, texts.volunteer.signupFailedBody);

// eslint-disable-next-line complexity
export const VolunteerSignupScreen = ({ navigation, route }: StackScreenProps<any>) => {
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
  const {
    isLoading: isLoadingMe,
    isError: isErrorMe,
    isSuccess: isSuccessMe,
    data: dataMe
  } = useQuery(QUERY_TYPES.VOLUNTEER.ME, me, {
    enabled: !!data?.auth_token, // the query will not execute until the auth token exists
    onSuccess: (responseData) => {
      if (!responseData?.account) {
        return;
      }

      // save user data to global state
      storeVolunteerUserData(responseData.account);

      navigation.navigate(ScreenName.VolunteerRegistered);
    }
  });

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

  if (
    isError ||
    isErrorMe ||
    (isSuccess && data?.code && data?.code !== 200) ||
    (isSuccessMe && dataMe?.status && dataMe?.status !== 200)
  ) {
    showSignupFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <TitleContainer>
              <Title
                big
                center
                accessibilityLabel={`${texts.volunteer.registrationTitle} ${a11yLabel.heading}`}
              >
                {texts.volunteer.registrationTitle}
              </Title>
            </TitleContainer>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="email"
                label={texts.volunteer.email}
                placeholder={texts.volunteer.email}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                validate
                rules={{
                  required: texts.volunteer.emailError,
                  pattern: { value: EMAIL_REGEX, message: texts.volunteer.emailInvalid }
                }}
                errorMessage={errors.email && errors.email.message}
                control={control}
              />
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="token"
                label={texts.volunteer.token}
                placeholder={texts.volunteer.token}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoCapitalize="none"
                validate
                rules={{
                  required: texts.volunteer.tokenError
                }}
                errorMessage={errors.token && errors.token.message}
                control={control}
              />
            </Wrapper>

            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={texts.volunteer.next}
                disabled={isLoading || isLoadingMe}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {texts.volunteer.abort.toUpperCase()}
                </BoldText>
              </Touchable>
            </Wrapper>
          </WrapperWithOrientation>

          <LoadingModal loading={isLoading || isLoadingMe} />
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
