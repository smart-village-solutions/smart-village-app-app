import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import * as appJson from '../../../app.json';
import {
  BoldText,
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperHorizontal,
  WrapperWithOrientation
} from '../../components';
import { consts, secrets, texts } from '../../config';
import { storeVolunteerAuthToken, storeVolunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { me, register } from '../../queries/volunteer';
import { ScreenName, VolunteerRegistration } from '../../types';

const { a11yLabel, EMAIL_REGEX } = consts;
const namespace = appJson.expo.slug as keyof typeof secrets;
const dataPrivacyLink = secrets[namespace]?.volunteer?.dataPrivacyLink;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.volunteer.registrationFailedTitle, texts.volunteer.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.volunteer.privacyCheckRequireTitle, texts.volunteer.privacyCheckRequireBody);

// eslint-disable-next-line complexity
export const VolunteerRegistrationScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isSecureTextEntryConfirmation, setIsSecureTextEntryConfirmation] = useState(true);
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm<VolunteerRegistration>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      dataPrivacyCheck: false
    }
  });
  const password = watch('password');

  const { mutate: mutateRegister, isLoading, isError, isSuccess, data, reset } = useMutation(
    register
  );
  const {
    isLoading: isLoadingMe,
    isError: isErrorMe,
    isSuccess: isSuccessMe,
    data: dataMe
  } = useQuery(QUERY_TYPES.VOLUNTEER.ME, me, {
    enabled: !!data?.auth_token, // the query will not execute until the auth token exists
    onSuccess: (dataMe) => {
      if (dataMe?.account) {
        // save user data to global state
        storeVolunteerUserData(dataMe.account);

        navigation.navigate(ScreenName.VolunteerRegistered);
      }
    }
  });

  const onSubmit = (registerData: VolunteerRegistration) => {
    if (!hasAcceptedDataPrivacy) return showPrivacyCheckedAlert();

    mutateRegister(
      { ...registerData, dataPrivacyCheck: hasAcceptedDataPrivacy },
      {
        onSuccess: (data) => {
          // wait for saving auth token to global state
          return storeVolunteerAuthToken(data.auth_token);
        }
      }
    );
  };

  if (
    isError ||
    isErrorMe ||
    (isSuccess && data?.code && data?.code !== 200) ||
    (isSuccessMe && dataMe?.status && dataMe?.status !== 200)
  ) {
    showRegistrationFailAlert();
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
                name="username"
                label={texts.volunteer.username}
                placeholder={texts.volunteer.username}
                textContentType="username"
                autoCapitalize="none"
                validate
                rules={{
                  required: texts.volunteer.usernameError,
                  minLength: { value: 4, message: texts.volunteer.usernameErrorLengthError }
                }}
                errorMessage={errors.username && errors.username.message}
                control={control}
              />
            </Wrapper>

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
                name="password"
                label={texts.volunteer.password}
                placeholder={texts.volunteer.password}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={isSecureTextEntry}
                rightIcon={
                  <InputSecureTextIcon
                    isSecureTextEntry={isSecureTextEntry}
                    setIsSecureTextEntry={setIsSecureTextEntry}
                  />
                }
                validate
                rules={{
                  required: texts.volunteer.passwordError,
                  minLength: { value: 5, message: texts.volunteer.passwordLengthError }
                }}
                errorMessage={errors.password && errors.password.message}
                control={control}
              />
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="passwordConfirmation"
                label={texts.volunteer.passwordConfirmation}
                placeholder={texts.volunteer.passwordConfirmation}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={isSecureTextEntryConfirmation}
                rightIcon={
                  <InputSecureTextIcon
                    isSecureTextEntry={isSecureTextEntryConfirmation}
                    setIsSecureTextEntry={setIsSecureTextEntryConfirmation}
                  />
                }
                validate
                rules={{
                  required: texts.volunteer.passwordError,
                  minLength: { value: 5, message: texts.volunteer.passwordLengthError },
                  validate: (value) => value === password || texts.volunteer.passwordDoNotMatch
                }}
                errorMessage={errors.passwordConfirmation && errors.passwordConfirmation.message}
                control={control}
              />
            </Wrapper>

            <WrapperHorizontal>
              <Checkbox
                linkDescription={texts.volunteer.privacyCheckLink}
                link={dataPrivacyLink}
                title={texts.volunteer.privacyChecked}
                checkedIcon="check-square-o"
                uncheckedIcon="square-o"
                checked={hasAcceptedDataPrivacy}
                center={false}
                onPress={() => setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy)}
              />
            </WrapperHorizontal>

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
