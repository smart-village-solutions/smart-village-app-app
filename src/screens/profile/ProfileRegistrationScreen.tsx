import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from 'react-query';

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
  WrapperHorizontal,
  WrapperRow
} from '../../components';
import { Icon, colors, consts, texts } from '../../config';
import { register } from '../../queries/volunteer';
import { ScreenName, VolunteerRegistration } from '../../types';

const { EMAIL_REGEX } = consts;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.profile.registrationFailedTitle, texts.profile.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.profile.privacyCheckRequireTitle, texts.profile.privacyCheckRequireBody);

// eslint-disable-next-line complexity
export const ProfileRegistrationScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isSecureTextEntryConfirmation, setIsSecureTextEntryConfirmation] = useState(true);
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);
  const dataPrivacyLink = route.params?.webUrl ?? '';

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

          navigation.navigate(ScreenName.ProfileSignup, {
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
          <WrapperRow center>
            <SectionHeader big center title={texts.profile.registrationTitle} />
          </WrapperRow>

          <Wrapper>
            <Input
              name="username"
              label={texts.profile.username}
              placeholder={texts.profile.username}
              textContentType="username"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.profile.usernameError,
                minLength: { value: 4, message: texts.profile.usernameErrorLengthError }
              }}
              errorMessage={errors.username && errors.username.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="firstname"
              label={texts.profile.firstname}
              placeholder={texts.profile.firstname}
              textContentType="firstname"
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="lastname"
              label={texts.profile.lastname}
              placeholder={texts.profile.lastname}
              textContentType="lastname"
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="dayOfBirth"
              label={texts.profile.dayOfBirth}
              placeholder={texts.profile.dayOfBirth}
              textContentType="dayOfBirth"
              control={control}
            />
          </Wrapper>

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
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="password"
              label={texts.profile.password}
              placeholder={texts.profile.password}
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
                required: texts.profile.passwordError,
                minLength: { value: 5, message: texts.profile.passwordLengthError }
              }}
              errorMessage={errors.password && errors.password.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="passwordConfirmation"
              label={texts.profile.passwordConfirmation}
              placeholder={texts.profile.passwordConfirmation}
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
                required: texts.profile.passwordError,
                minLength: { value: 5, message: texts.profile.passwordLengthError },
                validate: (value) => value === password || texts.profile.passwordDoNotMatch
              }}
              errorMessage={errors.passwordConfirmation && errors.passwordConfirmation.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Checkbox
              linkDescription={texts.profile.privacyCheckLink}
              link={dataPrivacyLink}
              title={texts.profile.privacyChecked}
              checkedIcon={<Icon.SquareCheckFilled />}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
              checked={hasAcceptedDataPrivacy}
              center={false}
              onPress={() => setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy)}
            />
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.register}
              disabled={isLoading}
            />

            <RegularText />

            <TouchableOpacity onPress={() => navigation.navigate(ScreenName.ProfileSignup)}>
              <RegularText primary center underline>
                {texts.profile.enterCode}
              </RegularText>
            </TouchableOpacity>

            <RegularText />

            <RegularText primary center>
              {texts.profile.alreadyRegistered}
              <RegularText
                primary
                underline
                onPress={() => navigation.navigate(ScreenName.ProfileLogin)}
              >
                {texts.profile.login}
              </RegularText>
            </RegularText>
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
