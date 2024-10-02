import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from 'react-query';

import * as appJson from '../../../app.json';
import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { Icon, colors, consts, secrets, texts } from '../../config';
import { register } from '../../queries/volunteer';
import { ScreenName, VolunteerRegistration } from '../../types';

const { EMAIL_REGEX } = consts;
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

  const {
    mutate: mutateRegister,
    isLoading,
    isError,
    isSuccess,
    data,
    reset
  } = useMutation(register);

  const onSubmit = (registerData: VolunteerRegistration) => {
    if (!hasAcceptedDataPrivacy) return showPrivacyCheckedAlert();

    mutateRegister(
      { ...registerData, dataPrivacyCheck: hasAcceptedDataPrivacy },
      {
        onSuccess: (responseData) => {
          if (responseData?.code !== 200) {
            return;
          }

          navigation.navigate(ScreenName.VolunteerSignup, {
            email: registerData.email
          });
        }
      }
    );
  };

  if (isError || (isSuccess && data?.code !== 200)) {
    showRegistrationFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <SectionHeader title={texts.volunteer.registrationTitle} big center />
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
              center={false}
              checked={hasAcceptedDataPrivacy}
              checkedIcon={<Icon.SquareCheckFilled />}
              link={dataPrivacyLink}
              linkDescription={texts.volunteer.privacyCheckLink}
              onPress={() => setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy)}
              title={texts.volunteer.privacyChecked}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          </WrapperHorizontal>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.volunteer.next}
              disabled={isLoading}
              notFullWidth
            />
            <TouchableOpacity onPress={() => navigation.navigate(ScreenName.VolunteerSignup)}>
              <RegularText primary center>
                {texts.volunteer.enterCode}
              </RegularText>
            </TouchableOpacity>
            <RegularText />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <RegularText primary center>
                {texts.volunteer.abort}
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
